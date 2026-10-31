"""
analyze_results.py
Neuroeconomics Data Analysis & Simulation Engine (v2.0 - Structurally Grounded)
Project: Preferences Toward Risk, Uncertainty, and Safety in Financial Decisions
Authors: Parth Dhodapkar & Joshua Koilpillai
"""

import argparse
import json
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from scipy.optimize import minimize
from matplotlib.patches import Ellipse

# Set publication aesthetics
sns.set_theme(style="whitegrid", font="DejaVu Sans")
plt.rcParams.update({"font.size": 11, "figure.autolayout": True})

PLOTS_DIR = Path(__file__).resolve().parent / "plots"

# Color palette for the 4 (S, R) Quadrants
QUADRANT_PALETTE = {
    "High S, Low R (Unburdened IT)": "#2ECC71",         # Green (Highest Risk Tolerance)
    "Low S, Low R (Supported Student)": "#3498DB",      # Blue (Moderate Risk Tolerance)
    "High S, High R (Committed IT)": "#9B59B6",         # Purple (Restrained by Bills)
    "Low S, High R (Working Student)": "#E67E22"        # Orange (Lowest Risk Tolerance / High Stress)
}

# ==========================================
# 1. SCORING & QUADRANT PIPELINE
# ==========================================

def compute_intake_scores(df):
    """
    Computes S and R, and assigns the 4 theoretical (S, R) Quadrants.
    """
    # S: Income Stability
    df["P"] = (df["S1"] - 1.0) / 4.0
    df["D"] = 1.0 - (df["S2"] / 12.0)
    b_own = (df["S3"] / 12.0).clip(0.0, 1.0)
    b_back = df["S4"].clip(0.0, 1.0)
    df["Buffer"] = 1.0 - (1.0 - b_own) * (1.0 - b_back)
    raw_s = (df["P"] + df["D"] + df["Buffer"]) / 3.0
    df["S_raw"] = raw_s

    # Cap S for students at 0.50 to reflect the transitory/non-career nature of student
    # income (stipends/allowances) and prevent misclassification into "High S, Low R (Unburdened IT)".
    is_student = df["Cohort"].astype(str).str.strip().str.lower().str.contains("student")
    df["S"] = np.where(is_student, np.minimum(raw_s, 0.5), raw_s)
    
    # R: Financial Responsibility
    df["Dep"] = (df["R1"] / 3.0).clip(0.0, 1.0)
    cash_ratio = (df["R3"] + df["R4"]) / df["R2"].replace(0, np.nan)
    df["Cash"] = cash_ratio.fillna(0.0).clip(0.0, 1.0)
    df["R"] = (df["Dep"] + df["Cash"]) / 2.0
    
    # Financial Literacy
    df["FL_Score"] = (df["FL1"] == 1).astype(int) + (df["FL2"] == 1).astype(int) + (df["FL3"] == 1).astype(int)
    
    # Assign (S, R) Quadrants cleanly
    s_threshold = 0.65
    r_threshold = 0.35
    conditions = [
        (df["S"] >= s_threshold) & (df["R"] < r_threshold),
        (df["S"] < s_threshold) & (df["R"] < r_threshold),
        (df["S"] >= s_threshold) & (df["R"] >= r_threshold),
        (df["S"] < s_threshold) & (df["R"] >= r_threshold)
    ]
    choices = [
        "High S, Low R (Unburdened IT)",
        "Low S, Low R (Supported Student)",
        "High S, High R (Committed IT)",
        "Low S, High R (Working Student)"
    ]
    df["SR_Quadrant"] = np.select(conditions, choices, default="Low S, Low R (Supported Student)")
    
    return df

def compute_game_metrics(df):
    """
    Computes Gamble Propensity (GP), Known-Risk Share (KR), Ambiguity Share (AS),
    and Holt-Laury Safe Choices count.
    """
    decision_cols = [f"D{i}" for i in range(1, 16) if i != 8]
    
    is_safe = df[decision_cols].apply(lambda c: c == "A").astype(int)
    is_known = df[decision_cols].apply(lambda c: c == "B").astype(int)
    is_ambig = df[decision_cols].apply(lambda c: c == "C").astype(int)
    
    n_safe = is_safe.sum(axis=1)
    n_known = is_known.sum(axis=1)
    n_ambig = is_ambig.sum(axis=1)
    n_gambles = n_known + n_ambig
    
    df["GP"] = 100.0 * (n_gambles / len(decision_cols))
    df["KR"] = 100.0 * (n_known / len(decision_cols))
    df["AS"] = np.where(n_gambles > 0, 100.0 * (n_ambig / n_gambles), np.nan)
    
    hl_cols = [f"HL{i}" for i in range(1, 11)]
    df["HL_Safe_Count"] = df[hl_cols].apply(lambda c: c == "X").astype(int).sum(axis=1)
    
    crash_map = {"A": "Sell", "B": "Hold", "C": "Buy more"}
    df["Crash_Reaction"] = df["D8"].map(crash_map).fillna("Hold")
    
    return df

def cliffs_delta(lst1, lst2):
    lst1 = lst1.dropna().values
    lst2 = lst2.dropna().values
    m, n = len(lst1), len(lst2)
    if m == 0 or n == 0:
        return 0.0
    greater = sum(x > y for x in lst1 for y in lst2)
    less = sum(x < y for x in lst1 for y in lst2)
    return (greater - less) / (m * n)

# ==========================================
# 2. QUADRANT-ALIGNED PLOTTING FUNCTIONS
# ==========================================

def cohort_ambiguity_test(df):
    """H2: Mann-Whitney U on Ambiguity Share, IT Professionals vs. Students, with Cliff's delta."""
    it_as = df.loc[df["Cohort"] == "IT Professional", "AS"].dropna()
    student_as = df.loc[df["Cohort"] == "Student", "AS"].dropna()
    if len(it_as) == 0 or len(student_as) == 0:
        return np.nan, np.nan, np.nan
    u, p = stats.mannwhitneyu(it_as, student_as, alternative="two-sided")
    return u, p, cliffs_delta(it_as, student_as)

def chi2_with_cramers_v(ct):
    """Chi-square test of independence with Cramer's V. Returns NaNs when the table cannot be tested."""
    ct = ct.loc[ct.sum(axis=1) > 0, ct.sum(axis=0) > 0]
    if min(ct.shape) < 2:
        return np.nan, np.nan, np.nan
    try:
        chi2, p, dof, _ = stats.chi2_contingency(ct)
    except ValueError:  # expected counts contain a zero, so the approximation is undefined
        return np.nan, np.nan, np.nan
    n = ct.values.sum()
    cramers_v = np.sqrt(chi2 / (n * (min(ct.shape) - 1)))
    return chi2, p, cramers_v

def cohort_crash_test(df):
    """H3: Chi-square of Crash Reaction by Cohort, with Cramer's V."""
    categories = ["Sell", "Hold", "Buy more"]
    ct = pd.crosstab(df["Cohort"], df["Crash_Reaction"]).reindex(columns=categories, fill_value=0)
    return chi2_with_cramers_v(ct)

def add_confidence_ellipse(ax, x, y, color):
    """95% covariance ellipse (chi-square, 2 dof) around a group's (x, y) points."""
    cov = np.cov(x, y)
    vals, vecs = np.linalg.eigh(cov)
    order = vals.argsort()[::-1]
    vals, vecs = vals[order], vecs[:, order]
    angle = np.degrees(np.arctan2(vecs[1, 0], vecs[0, 0]))
    width, height = 2 * np.sqrt(vals * 5.991)
    ax.add_patch(Ellipse(xy=(np.mean(x), np.mean(y)), width=width, height=height, angle=angle,
                         fill=False, edgecolor=color, linewidth=2, linestyle="--", zorder=5))

def plot_fig1_sr_landscape(df, filename="fig1_sr_landscape.png"):
    fig, ax = plt.subplots(figsize=(9.5, 7.5), dpi=300)
    
    # Quadrant dividing lines
    ax.axvline(0.65, color="#7F8C8D", linestyle="--", alpha=0.5, lw=1.2)
    ax.axhline(0.35, color="#7F8C8D", linestyle="--", alpha=0.5, lw=1.2)
    
    # Quadrant Text Labels
    ax.text(0.30, 0.85, "Q4: Low S, High R\n(Working Students)", fontsize=11, fontweight="bold",
            color="#D35400", ha="center", va="center", bbox=dict(boxstyle="round,pad=0.4", fc="white", alpha=0.9, ec="#D35400"))
    ax.text(0.30, 0.15, "Q1: Low S, Low R\n(Supported Students)", fontsize=11, fontweight="bold",
            color="#2980B9", ha="center", va="center", bbox=dict(boxstyle="round,pad=0.4", fc="white", alpha=0.9, ec="#2980B9"))
    ax.text(0.85, 0.85, "Q3: High S, High R\n(Committed IT Pros)", fontsize=11, fontweight="bold",
            color="#8E44AD", ha="center", va="center", bbox=dict(boxstyle="round,pad=0.4", fc="white", alpha=0.9, ec="#8E44AD"))
    ax.text(0.85, 0.15, "Q2: High S, Low R\n(Unburdened IT Pros)", fontsize=11, fontweight="bold",
            color="#27AE60", ha="center", va="center", bbox=dict(boxstyle="round,pad=0.4", fc="white", alpha=0.9, ec="#27AE60"))
    
    # Scatter points colored by continuous Gamble Propensity
    scatter = ax.scatter(
        df["S"], df["R"], 
        c=df["GP"], 
        cmap="coolwarm", s=115, alpha=0.88, edgecolors="black", linewidth=0.6
    )
    cbar = plt.colorbar(scatter, ax=ax, pad=0.02)
    cbar.set_label("Gamble Propensity (% Gambles Chosen)", fontsize=11)
    
    # Centroids per Quadrant
    for quad, color in QUADRANT_PALETTE.items():
        sub = df[df["SR_Quadrant"] == quad].dropna(subset=["S", "R"])
        if len(sub) < 2:
            continue
        mean_s, mean_r = sub["S"].mean(), sub["R"].mean()
        ax.scatter(mean_s, mean_r, marker="*", s=380, color=color, edgecolor="black", lw=1.2,
                   label=f"Centroid ({mean_s:.2f}, {mean_r:.2f})", zorder=6)
        if len(sub) >= 3:
            add_confidence_ellipse(ax, sub["S"], sub["R"], color)

    # Fitted Logistic Boundary (GP >= 50%)
    try:
        y_bin = (df["GP"] >= 50.0).astype(float).values
        s_arr = df["S"].values
        r_arr = df["R"].values
        X = np.column_stack([np.ones_like(s_arr), s_arr, r_arr])
        
        def neg_log_lik(w):
            z = np.clip(X @ w, -20, 20)
            p = 1 / (1 + np.exp(-z))
            return -np.sum(y_bin * np.log(p + 1e-12) + (1 - y_bin) * np.log(1 - p + 1e-12))
            
        opt = minimize(neg_log_lik, x0=[0.0, 1.0, -1.0])
        w0, w1, w2 = opt.x
        if abs(w2) > 1e-3:
            s_vals = np.linspace(0, 1, 100)
            r_boundary = -(w0 + w1 * s_vals) / w2
            valid_mask = (r_boundary >= 0) & (r_boundary <= 1)
            if np.any(valid_mask):
                ax.plot(s_vals[valid_mask], r_boundary[valid_mask], color="#2C3E50", 
                        linestyle="-.", linewidth=2.5, label="50% Gamble Boundary", zorder=7)
    except Exception:
        pass

    ax.set_title("Figure 1: (S, R) Four-Quadrant Landscape & Risk Boundaries", fontsize=13, fontweight="bold")
    ax.set_xlabel("Income Stability Score (S) [0 = Volatile Inflows, 1 = Fixed Dependable Salary]", fontsize=11)
    ax.set_ylabel("Financial Responsibility Score (R) [0 = Low Bills, 1 = Heavy Debt / Bills]", fontsize=11)
    ax.set_xlim(-0.02, 1.02)
    ax.set_ylim(-0.02, 1.02)
    ax.legend(loc="upper left", bbox_to_anchor=(0.01, 0.72), frameon=True, fontsize=9.5)
    plt.savefig(filename, bbox_inches="tight")
    plt.close()

def plot_fig2_ambiguity_share(df, filename="fig2_ambiguity_share.png"):
    fig, ax = plt.subplots(figsize=(9.5, 6), dpi=300)
    
    clean_df = df.dropna(subset=["AS"])
    order = list(QUADRANT_PALETTE.keys())
    
    sns.boxplot(data=clean_df, x="SR_Quadrant", y="AS", order=order, palette=QUADRANT_PALETTE,
                hue="SR_Quadrant", legend=False, width=0.45, boxprops=dict(alpha=0.75), ax=ax)
    sns.stripplot(data=clean_df, x="SR_Quadrant", y="AS", order=order, color="black", 
                  alpha=0.45, jitter=0.2, s=6, ax=ax)
    
    ax.axhline(50.0, color="#7F8C8D", linestyle="--", linewidth=1.5, label="Neutrality (AS = 50%)")

    u, p_u, delta = cohort_ambiguity_test(df)
    ax.text(0.5, 0.97, f"Mann-Whitney U (IT vs. Student) = {u:.0f}, p = {p_u:.2e}\nCliff's delta = {delta:+.2f}",
            transform=ax.transAxes, ha="center", va="top", fontsize=9.5,
            bbox=dict(boxstyle="round,pad=0.4", fc="white", ec="#7F8C8D", alpha=0.9))

    ax.set_title("Figure 2: Ambiguity Share Across (S, R) Financial Profiles", fontsize=13, fontweight="bold")
    ax.set_ylabel("Ambiguity Share (% Gambles on Option C)", fontsize=11)
    ax.set_xlabel("Financial Profile Quadrant", fontsize=11)
    ax.set_xticks(range(len(order)))
    ax.set_xticklabels(["High S, Low R\n(Unburdened IT)", 
                        "Low S, Low R\n(Supported Student)", 
                        "High S, High R\n(Committed IT)", 
                        "Low S, High R\n(Working Student)"], fontsize=9.5, fontweight="bold")
    ax.set_ylim(-5, 115)
    ax.legend(loc="upper left")
    plt.savefig(filename, bbox_inches="tight")
    plt.close()

def plot_fig3_crash_reaction(df, filename="fig3_crash_reaction.png"):
    fig, ax = plt.subplots(figsize=(9.5, 6), dpi=300)
    
    categories = ["Sell", "Hold", "Buy more"]
    order = list(QUADRANT_PALETTE.keys())
    ct_raw = pd.crosstab(df["SR_Quadrant"], df["Crash_Reaction"]).reindex(index=order, columns=categories, fill_value=0)
    ct_pct = ct_raw.div(ct_raw.sum(axis=1), axis=0) * 100
    
    chi2, p, cramers_v = chi2_with_cramers_v(ct_raw)
    
    colors = ["#E74C3C", "#7F8C8D", "#27AE60"] # Sell (Red), Hold (Gray), Buy (Green)
    ct_pct.plot(kind="bar", stacked=True, color=colors, ax=ax, edgecolor="white", width=0.55)
    
    ax.set_title(f"Figure 3: Reaction to -40% Crash Across (S, R) Quadrants (Chi2 = {chi2:.2f}, p = {p:.4f}, V = {cramers_v:.2f})", 
                 fontsize=12.5, fontweight="bold")
    ax.set_ylabel("Proportion within Profile (%)", fontsize=11)
    ax.set_xlabel("Financial Profile Quadrant", fontsize=11)
    ax.set_xticks(range(len(order)))
    ax.set_xticklabels(["High S, Low R\n(Unburdened)", 
                        "Low S, Low R\n(Supported)", 
                        "High S, High R\n(Committed)", 
                        "Low S, High R\n(Working)"], rotation=0, fontsize=9.5, fontweight="bold")
    ax.set_ylim(0, 100)
    ax.legend(title="Action", bbox_to_anchor=(1.02, 1), loc="upper left")
    plt.savefig(filename, bbox_inches="tight")
    plt.close()

def plot_fig4_validation_anchor(df, filename="fig4_validation_anchor.png"):
    fig, ax = plt.subplots(figsize=(9, 6.5), dpi=300)
    
    # Regression line
    sns.regplot(data=df, x="HL_Safe_Count", y="GP", scatter=False, 
                line_kws={"color": "#2C3E50", "linewidth": 2.2, "linestyle": "-"}, ax=ax)
    
    for quad, color in QUADRANT_PALETTE.items():
        sub = df[df["SR_Quadrant"] == quad]
        ax.scatter(sub["HL_Safe_Count"], sub["GP"], color=color, alpha=0.85, s=85, 
                   edgecolor="white", linewidth=0.5, label=quad)
        
    r, p = stats.pearsonr(df["HL_Safe_Count"], df["GP"])
    
    ax.set_title(f"Figure 4: Game Risk Validation vs. Holt-Laury Anchor (r = {r:.2f}, p = {p:.4e})", 
                 fontsize=13, fontweight="bold")
    ax.set_xlabel("Holt-Laury Safe Choices Count (0 = High Risk-Seeking, 10 = High Aversion)", fontsize=11)
    ax.set_ylabel("Game Gamble Propensity (% Gambles Chosen)", fontsize=11)
    ax.axvline(4, color="gray", linestyle="--", label="Risk Neutral Anchor (HL = 4)")
    
    ax.legend(loc="upper right", frameon=True, fontsize=9.5, title="Participant (S, R) Profile")
    plt.savefig(filename, bbox_inches="tight")
    plt.close()

# ==========================================
# 3. STRUCTURAL SIMULATION GENERATOR
# ==========================================

def simulate_v2_data(n=120):
    """
    Simulates mock participants using a rigorous Structural Neuroeconomic Latent Utility Model.
    Risk tolerance and Ambiguity tolerance are mathematically driven by S and R:
    - High S (stability) increases willingness to gamble.
    - High R (bills/debts) forces participants to play safe.
    """
    np.random.seed(42)
    cohorts = ["Student"] * (n // 2) + ["IT Professional"] * (n // 2)
    data = []
    
    for i, c in enumerate(cohorts):
        # 1. Demographics & Controls
        age = np.random.randint(19, 24) if c == "Student" else np.random.randint(23, 40)
        gender = np.random.choice(["Woman", "Man", "Non-binary"], p=[0.45, 0.50, 0.05])
        work_years = 0 if c == "Student" else np.random.randint(1, 15)
        invest_exp = np.random.choice([0, 1, 2, 3], p=[0.5, 0.3, 0.15, 0.05] if c == "Student" else [0.1, 0.25, 0.45, 0.2])
        risk_will = np.random.randint(2, 8)
        
        fl1 = np.random.choice([1, 0], p=[0.6 if c == "Student" else 0.85, 0.4 if c == "Student" else 0.15])
        fl2 = np.random.choice([1, 0], p=[0.55 if c == "Student" else 0.8, 0.45 if c == "Student" else 0.2])
        fl3 = np.random.choice([1, 0], p=[0.65 if c == "Student" else 0.85, 0.35 if c == "Student" else 0.15])
        
        # 2. Intake generating clean S and R
        if c == "Student":
            # 65% supported students (low R), 35% working students (high R)
            is_working = (np.random.rand() < 0.35)
            if is_working:
                # Working Student: erratic earnings, low savings, no family buffer, high living bills
                s1 = np.random.choice([1, 2], p=[0.6, 0.4])
                s2 = np.random.choice([2, 3, 4], p=[0.3, 0.5, 0.2])
                s3 = np.random.uniform(0.1, 0.8)
                s4 = np.random.choice([0.0, 0.33], p=[0.8, 0.2]) # Low family backstop
                s0_val = "Part-time work / Freelance"
                
                r1 = np.random.choice([0, 1], p=[0.8, 0.2])
                r2 = np.random.uniform(8000, 18000)
                r3 = np.random.uniform(7000, 16000) # High essential living costs
                r4 = np.random.choice([0, 2000], p=[0.6, 0.4])
            else:
                # Supported / Stipend Student:
                is_stipend = (np.random.rand() < 0.40)
                if is_stipend:
                    s1 = np.random.choice([4, 5], p=[0.4, 0.6]) # Regular monthly stipend
                    s2 = 0                                       # No gaps in last 12 months
                    s3 = np.random.uniform(0.8, 2.5)
                    s4 = np.random.choice([0.67, 1.0], p=[0.3, 0.7])
                    s0_val = "Scholarship / Stipend"
                else:
                    s1 = np.random.choice([1, 2, 3], p=[0.25, 0.55, 0.20])
                    s2 = np.random.choice([1, 2, 3], p=[0.4, 0.4, 0.2])
                    s3 = np.random.uniform(0.3, 1.2)
                    s4 = np.random.choice([0.67, 1.0], p=[0.4, 0.6]) # High family backstop
                    s0_val = "Parental allowance"
                
                r1 = 0
                r2 = np.random.uniform(10000, 25000)
                r3 = np.random.uniform(1200, 3800) # Low essential costs paid personally
                r4 = 0
        else: # IT Professional
            # 55% unburdened early IT (low R), 45% committed IT with loans/dependents (high R)
            s0_val = "Full-time salary"
            is_committed = (np.random.rand() < 0.45)
            if is_committed:
                # Committed IT: High steady salary, 3-6 months savings, but heavy EMIs & family dependents
                s1 = np.random.choice([4, 5], p=[0.4, 0.6])
                s2 = np.random.choice([0, 1], p=[0.9, 0.1])
                s3 = np.random.uniform(2.5, 6.0)
                s4 = np.random.choice([0.0, 0.33], p=[0.6, 0.4])
                
                r1 = np.random.choice([1, 2, 3], p=[0.4, 0.4, 0.2]) # Dependents
                r2 = np.random.uniform(80000, 220000)
                r3 = np.random.uniform(40000, 95000) # High rent/mortgage
                r4 = np.random.uniform(15000, 55000) # High debt EMI
            else:
                # Unburdened IT: High steady salary, good savings, 0 dependents, low debt
                s1 = np.random.choice([4, 5], p=[0.3, 0.7])
                s2 = 0
                s3 = np.random.uniform(3.5, 8.0)
                s4 = np.random.choice([0.0, 0.33, 0.67], p=[0.4, 0.4, 0.2])
                
                r1 = 0
                r2 = np.random.uniform(70000, 160000)
                r3 = np.random.uniform(15000, 35000)
                r4 = np.random.choice([0, 5000], p=[0.8, 0.2])
                
        # Calculate individual S and R immediately to drive the structural choices
        p_comp = (s1 - 1.0) / 4.0
        d_comp = 1.0 - (s2 / 12.0)
        b_own_val = min(1.0, s3 / 12.0)
        b_back_val = s4
        buffer_val = 1.0 - (1.0 - b_own_val) * (1.0 - b_back_val)
        raw_s_indiv = (p_comp + d_comp + buffer_val) / 3.0
        # Cap S for students at 0.50 to reflect non-career income stability
        s_indiv = min(raw_s_indiv, 0.5) if c == "Student" else raw_s_indiv
        
        dep_val = min(1.0, r1 / 3.0)
        cash_ratio_val = min(1.0, (r3 + r4) / max(1.0, r2))
        r_indiv = (dep_val + cash_ratio_val) / 2.0
        
        row = {
            "id": i + 1, "Cohort": c, "age": age, "gender": gender,
            "work_years": work_years, "invest_exp": invest_exp, "risk_willingness": risk_will,
            "FL1": fl1, "FL2": fl2, "FL3": fl3,
            "S0": s0_val,
            "S1": s1, "S2": s2, "S3": s3, "S4": s4,
            "R1": r1, "R2": r2, "R3": r3, "R4": r4,
        }
        
        # ==============================================================
        # STRUCTURAL NEUROECONOMIC LATENT UTILITY MODEL
        # ==============================================================
        # Latent Risk Propensity (theta):
        # Driven POSITIVELY by Stability (S), NEGATIVELY by Responsibility (R)
        # theta = baseline + beta_S * S - beta_R * R + noise
        theta_latent = 0.35 + (0.52 * s_indiv) - (0.48 * r_indiv) + np.random.normal(0, 0.05)
        theta = float(np.clip(theta_latent, 0.12, 0.92))
        
        # Holt-Laury Safe Choices directly mirrors latent risk tolerance
        # HL Safe Choices: High aversion -> 7-9 safe choices; High tolerance -> 2-4 safe choices
        hl_safe = int(np.clip(np.round(10.5 * (1.0 - theta) + np.random.normal(0, 0.5)), 1, 9))
        for row_idx in range(1, 11):
            row[f"HL{row_idx}"] = "X" if row_idx <= hl_safe else "Y"
            
        # Ambiguity Share preference:
        # High stability + unburdened income drives willingness to embrace unknown odds
        ambig_latent = 0.18 + (0.42 * s_indiv) - (0.22 * r_indiv) + (0.08 if c == "IT Professional" else 0.0) + np.random.normal(0, 0.06)
        ambig_prop = float(np.clip(ambig_latent, 0.15, 0.85))
        
        # 14 Decision Days:
        # Probability of choosing Gamble (B or C) vs Safe (A) on Day d
        # EV calibration offsets: fair days, premium days, negative premium days
        ev_offsets = {
            1: 0.00, 2: 0.08, 3: -0.06, 4: 0.05, 5: 0.07, 6: -0.10, 7: 0.00,
            9: 0.12, 10: -0.02, 11: 0.09, 12: -0.08, 13: 0.00, 14: -0.05, 15: 0.10
        }
        
        for d in range(1, 16):
            if d == 8:
                # Day 8 Crash Reaction:
                # Unburdened IT buy dip; Working students panic-sell; Supported students hold
                if s_indiv >= 0.70 and r_indiv < 0.35: # Unburdened IT
                    probs = [0.10, 0.40, 0.50] # Mostly Buy the dip
                elif s_indiv < 0.70 and r_indiv >= 0.35: # Working Student
                    probs = [0.65, 0.25, 0.10] # Mostly Panic-Sell
                elif s_indiv < 0.70 and r_indiv < 0.35: # Supported Student
                    probs = [0.35, 0.50, 0.15] # Mostly Hold
                else: # Committed IT
                    probs = [0.25, 0.45, 0.30] # Balanced
                row["D8"] = np.random.choice(["A", "B", "C"], p=probs)
            else:
                p_gamble_d = float(np.clip(theta + ev_offsets.get(d, 0.0), 0.05, 0.95))
                choice_gamble = (np.random.rand() < p_gamble_d)
                if not choice_gamble:
                    row[f"D{d}"] = "A" # Safe Option
                else:
                    # Choose between Known-Risk (B) and Ambiguous (C)
                    choice_ambig = (np.random.rand() < ambig_prop)
                    row[f"D{d}"] = "C" if choice_ambig else "B"
                    
        data.append(row)
        
    return pd.DataFrame(data)

# ==========================================
# 4. REAL DATA LOADER
# ==========================================

# The game stores these answers as text (see flatRow() and submitProfile() in js/game.js).
# The loader converts them to the numeric encoding the scoring functions expect.
FL_CORRECT = {"FL1": "More than ₹1,200", "FL2": "Less than today", "FL3": "False"}
S4_TEXT_TO_NUM = {"No": 0.0, "Partially": 0.5, "Yes": 1.0}
NUMERIC_COLS = ["S1", "S2", "S3", "R1", "R2", "R3", "R4"]
DECISION_COLS = [f"D{i}" for i in range(1, 16)]
HL_COLS = [f"HL{i}" for i in range(1, 11)]

def load_real_data(path):
    """
    Loads the exported Google Sheet (.xlsx or .csv) and returns a DataFrame in the same
    schema as simulate_v2_data(), so compute_intake_scores and compute_game_metrics work on it.
    Incomplete responses (missing scoring inputs or any decision/HL answer) are dropped.
    """
    path = Path(path)
    if path.suffix.lower() in (".xlsx", ".xls"):
        df = pd.read_excel(path)
    elif path.suffix.lower() == ".csv":
        df = pd.read_csv(path)
    else:
        raise ValueError(f"Unsupported file type: {path.suffix} (use .xlsx or .csv)")
    return clean_responses(df, path.name)

def clean_responses(df, source):
    """Shared cleaning for file and live data: encodings, required columns, incomplete rows."""
    df = df.rename(columns={"cohort": "Cohort"}).replace("", np.nan)

    required = ["Cohort", "S4", "FL1", "FL2", "FL3"] + NUMERIC_COLS + DECISION_COLS + HL_COLS
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"{source} is missing columns: {missing}")

    n_total = len(df)
    df["S4"] = df["S4"].map(lambda v: S4_TEXT_TO_NUM.get(str(v).strip(), v))
    for c in NUMERIC_COLS + ["S4"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    for c, correct in FL_CORRECT.items():
        df[c] = (df[c].astype(str).str.strip() == correct).astype(int)

    df = df.dropna(subset=NUMERIC_COLS + ["S4"])
    df = df.dropna(subset=DECISION_COLS + HL_COLS)
    print(f"Loaded {len(df)} complete responses from {source} ({n_total - len(df)} incomplete dropped).")
    return df.reset_index(drop=True)

def load_live_data():
    """
    Fetches every response straight from the Apps Script read endpoint (doGet in apps_script/Code.gs).
    The URL comes from WEBHOOK_URL in js/config.js. The read key comes from the
    NEUROECO_READ_KEY environment variable, so it never lands in the repo.
    """
    read_key = os.environ.get("NEUROECO_READ_KEY")
    if not read_key:
        raise SystemExit("Set the NEUROECO_READ_KEY environment variable to your READ_KEY from apps_script/Code.gs.")

    config = (Path(__file__).resolve().parent / "js" / "config.js").read_text(encoding="utf-8")
    match = re.search(r'WEBHOOK_URL:\s*"([^"]+)"', config)
    if not match or not match.group(1).strip():
        raise SystemExit("WEBHOOK_URL is empty in js/config.js.")

    url = f"{match.group(1).strip()}?{urllib.parse.urlencode({'key': read_key})}"
    with urllib.request.urlopen(url, timeout=60) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    if not payload.get("ok"):
        raise SystemExit(f"Apps Script refused the request: {payload.get('error', 'unknown error')}")

    df = pd.DataFrame(payload["rows"])
    return clean_responses(df, "live Google Sheet")

# ==========================================
# 5. HYPOTHESIS TESTS
# ==========================================

def run_hypothesis_tests(df):
    print("\n[3] Hypothesis Tests:")

    r_sgp, p_sgp = stats.pearsonr(df["S"], df["GP"])
    r_rgp, p_rgp = stats.pearsonr(df["R"], df["GP"])
    print(f"  H1a Stability -> GP (Pearson): r = {r_sgp:+.3f}, p = {p_sgp:.4e} (Stability increases gambling)")
    print(f"  H1b Responsibility -> GP (Pearson): r = {r_rgp:+.3f}, p = {p_rgp:.4e} (Debt/bills suppress gambling)")

    lr = stats.linregress(df["S"], df["GP"])
    h1_ok = lr.pvalue < 0.05 and lr.slope > 0
    print(f"  H1 Stability -> GP (OLS): beta = {lr.slope:+.2f}, p = {lr.pvalue:.4e} -> {'supported' if h1_ok else 'not supported'}")

    u, p_u, delta = cohort_ambiguity_test(df)
    if np.isnan(p_u):
        print("  H2 Cohort -> AS: not computable (one cohort has no complete responses yet)")
    else:
        h2_ok = p_u < 0.05 and delta > 0
        print(f"  H2 Cohort -> AS (Mann-Whitney U, IT vs. Student): U = {u:.0f}, p = {p_u:.4e}, Cliff's delta = {delta:+.3f} -> {'supported' if h2_ok else 'not supported'}")

    chi2, p_chi, v = cohort_crash_test(df)
    if np.isnan(p_chi):
        print("  H3 Cohort -> Crash Reaction: not computable (crash table too sparse for chi-square)")
    else:
        print(f"  H3 Cohort -> Crash Reaction (chi-square): chi2 = {chi2:.2f}, p = {p_chi:.4e}, Cramer's V = {v:.2f}")
        print("      (Chi-square approximation: some cells may be small, so treat p as indicative.)")

    r_hl, p_hl = stats.pearsonr(df["HL_Safe_Count"], df["GP"])
    val_ok = r_hl < -0.30 and p_hl < 0.001
    print(f"  External Validation (HL -> GP): r = {r_hl:+.3f}, p = {p_hl:.4e} -> {'pass' if val_ok else 'fail'} (criterion: r < -0.30, p < 0.001)")

# ==========================================
# 6. EXECUTION
# ==========================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Score, test, and plot the 15 Days of Payday responses.")
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--data", help="Exported responses (.xlsx or .csv).")
    source.add_argument("--live", action="store_true", help="Fetch the current responses from the Google Sheet.")
    args = parser.parse_args()

    print("=============================================================")
    if args.live or args.data:
        print("RUNNING NEUROECONOMICS ANALYSIS ON REAL DATA")
        df = load_live_data() if args.live else load_real_data(args.data)
        print(f"Cohort counts: {df['Cohort'].value_counts().to_dict()}")
    else:
        print("RUNNING NEUROECONOMICS STRUCTURAL SIMULATION ENGINE")
        df = simulate_v2_data(n=120)
    print("=============================================================")

    df = compute_intake_scores(df)
    df = compute_game_metrics(df)
    
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 1000)
    
    print("\n[1] Distribution Across the 4 (S, R) Quadrants:")
    print(df["SR_Quadrant"].value_counts())
    
    print("\n[2] Mean Behavioral Metrics by (S, R) Quadrant:")
    print("-------------------------------------------------------------------------------------------------")
    print(f"{'Quadrant':<34} | {'S (Stab)':<8} | {'R (Resp)':<8} | {'GP (% Gamble)':<13} | {'AS (% Ambig)':<12} | {'HL Safe (Aversion)':<18}")
    print("-------------------------------------------------------------------------------------------------")
    for quad in ["High S, Low R (Unburdened IT)", "Low S, Low R (Supported Student)", "High S, High R (Committed IT)", "Low S, High R (Working Student)"]:
        sub = df[df["SR_Quadrant"] == quad]
        s_m, r_m = sub["S"].mean(), sub["R"].mean()
        gp_m = sub["GP"].mean()
        as_m = sub["AS"].mean()
        hl_m = sub["HL_Safe_Count"].mean()
        print(f"{quad:<34} | {s_m:<8.2f} | {r_m:<8.2f} | {gp_m:<13.1f} | {as_m:<12.1f} | {hl_m:<18.2f}")
    print("-------------------------------------------------------------------------------------------------")
    print("NOTE: 'GP' is Gamble Propensity (Higher = More Gambling). Expected: Q2 > Q1 >= Q3 > Q4")
    print("NOTE: 'HL Safe' is Holt-Laury Safe Choices (Higher = MORE RISK AVERSE = Less Gambling).")
    
    run_hypothesis_tests(df)

    print(f"\n[4] Generating High-Resolution Publication Figures in {PLOTS_DIR} ...")
    PLOTS_DIR.mkdir(exist_ok=True)
    plot_fig1_sr_landscape(df, PLOTS_DIR / "fig1_sr_landscape.png")
    plot_fig2_ambiguity_share(df, PLOTS_DIR / "fig2_ambiguity_share.png")
    plot_fig3_crash_reaction(df, PLOTS_DIR / "fig3_crash_reaction.png")
    plot_fig4_validation_anchor(df, PLOTS_DIR / "fig4_validation_anchor.png")
    print("All 4 figures updated and saved successfully!")
