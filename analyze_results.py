"""
analyze_results.py
Neuroeconomics Data Analysis & Simulation Engine (v2.0 - Structurally Grounded)
Project: Preferences Toward Risk, Uncertainty, and Safety in Financial Decisions
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
from scipy import special, stats
from scipy.optimize import minimize
from matplotlib.patches import Ellipse
from matplotlib.lines import Line2D

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
    # Any dependent is a binding obligation: 1 -> 0.70, 2 -> 0.85, 3+ -> 1.0.
    # Dep >= 0.70 guarantees R >= 0.35 (the High-R threshold) even with Cash = 0.
    df["Dep"] = np.where(df["R1"] > 0, (0.7 + 0.15 * (df["R1"] - 1)).clip(upper=1.0), 0.0)
    cash_ratio = (df["R3"] + df["R4"]) / df["R2"].replace(0, np.nan)
    df["Cash"] = cash_ratio.fillna(0.0).clip(0.0, 1.0)
    df["R"] = (df["Dep"] + df["Cash"]) / 2.0
    
    # Financial Literacy
    df["FL_Score"] = (df["FL1"] == 1).astype(int) + (df["FL2"] == 1).astype(int) + (df["FL3"] == 1).astype(int)
    
    # Assign (S, R) Quadrants cleanly
    # High S means S above 0.5. Strictly above, because students are capped at exactly 0.5.
    s_threshold = 0.5
    r_threshold = 0.35
    high_s = df["S"] > s_threshold
    conditions = [
        high_s & (df["R"] < r_threshold),
        ~high_s & (df["R"] < r_threshold),
        high_s & (df["R"] >= r_threshold),
        ~high_s & (df["R"] >= r_threshold)
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
# 1b. DESIGN CONSTANTS & STATISTICAL HELPERS
# ==========================================

# EV(B) - EV(A) per day, from the calibration table in questionnaire_2.md (Section 7).
EV_PREMIUM = {1: 0, 2: 120, 3: -50, 4: 66, 5: 100, 6: -150, 7: 0,
              9: 200, 10: 0, 11: 250, 12: -500, 13: 0, 14: 30, 15: 750}
PREMIUM_GROUPS = {
    "Negative": [d for d, v in EV_PREMIUM.items() if v < 0],
    "Zero": [d for d, v in EV_PREMIUM.items() if v == 0],
    "Positive": [d for d, v in EV_PREMIUM.items() if v > 0],
}
LOSS_DAYS = {7, 10, 13}
SCORED_DAYS = sorted(EV_PREMIUM)
CRASH_ORDER = ["Sell", "Hold", "Buy more"]

def is_it(df):
    return (df["Cohort"] == "IT Professional").astype(float)

def quadrant_ticklabels(df, order):
    counts = df["SR_Quadrant"].value_counts()
    return [q.replace(" (", "\n(") + f"\nn = {counts.get(q, 0)}" for q in order]

def holm(pvals):
    """Holm step-down adjusted p-values."""
    pvals = np.asarray(pvals, dtype=float)
    adj, running, m = np.empty_like(pvals), 0.0, len(pvals)
    for rank, i in enumerate(np.argsort(pvals)):
        running = max(running, min(1.0, (m - rank) * pvals[i]))
        adj[i] = running
    return adj

def ffh_exact_test(ct, n_perm=20000, seed=0):
    """
    Fisher-Freeman-Halton exact test for an r x c table (the r x c extension of Fisher's exact test).
    Tables with the observed margins are sampled by permutation (Monte Carlo); p is the share of
    sampled tables that are at most as probable as the observed one.
    """
    ct = ct.loc[ct.sum(axis=1) > 0, ct.sum(axis=0) > 0]
    if min(ct.shape) < 2:
        return np.nan
    table = ct.values.astype(int)
    r, c = table.shape
    rows = np.repeat(np.repeat(np.arange(r), c), table.ravel())
    cols = np.repeat(np.tile(np.arange(c), r), table.ravel())
    rng = np.random.default_rng(seed)
    perm_cols = rng.permuted(np.tile(cols, (n_perm, 1)), axis=1)
    flat = (np.arange(n_perm)[:, None] * (r * c) + rows[None, :] * c + perm_cols).ravel()
    counts = np.bincount(flat, minlength=n_perm * r * c).reshape(n_perm, r * c)
    # Under fixed margins, P(table) is proportional to 1 / prod(n_ij!).
    log_prob = lambda t: -special.gammaln(np.asarray(t, dtype=float) + 1).sum(axis=-1)
    obs = log_prob(table.ravel())
    return (np.sum(log_prob(counts) <= obs + 1e-9) + 1) / (n_perm + 1)

def ols(y, X, names):
    """OLS with classical SEs. Returns (coefficient table, R^2, overall F-test p)."""
    n, k = X.shape
    b = np.linalg.lstsq(X, y, rcond=None)[0]
    e = y - X @ b
    dof = n - k
    se = np.sqrt(np.diag((e @ e) / dof * np.linalg.inv(X.T @ X)))
    q = stats.t.ppf(0.975, dof)
    r2 = 1 - (e @ e) / ((y - y.mean()) ** 2).sum()
    p_f = stats.f.sf((r2 / (k - 1)) / ((1 - r2) / dof), k - 1, dof)
    table = pd.DataFrame({"b": b, "CI low": b - q * se, "CI high": b + q * se,
                          "p": 2 * stats.t.sf(np.abs(b / se), dof)}, index=names)
    return table, r2, p_f

def logit_cluster(y, X, groups, names, max_iter=100):
    """
    Logistic regression with participant-clustered (sandwich) standard errors, i.e. a GEE logit with an
    independence working correlation. Returns odds ratios with 95% CIs.
    """
    b = np.zeros(X.shape[1])
    for _ in range(max_iter):
        p = special.expit(X @ b)
        step = np.linalg.solve(X.T @ (X * (p * (1 - p))[:, None]) + 1e-9 * np.eye(len(b)), X.T @ (y - p))
        b += step
        if np.max(np.abs(step)) < 1e-8:
            break
    p = special.expit(X @ b)
    bread = np.linalg.inv(X.T @ (X * (p * (1 - p))[:, None]))
    scores = pd.DataFrame(X * (y - p)[:, None]).groupby(np.asarray(groups)).sum().values
    n_groups = scores.shape[0]
    cov = bread @ (scores.T @ scores) @ bread * n_groups / (n_groups - 1)
    se = np.sqrt(np.diag(cov))
    return pd.DataFrame({"OR": np.exp(b), "CI low": np.exp(b - 1.96 * se), "CI high": np.exp(b + 1.96 * se),
                         "p": 2 * stats.norm.sf(np.abs(b / se))}, index=names)

def numerical_hessian(f, x, h=1e-4):
    n = len(x)
    H = np.zeros((n, n))
    for i in range(n):
        for j in range(i, n):
            ei, ej = np.zeros(n), np.zeros(n)
            ei[i], ej[j] = h, h
            H[i, j] = H[j, i] = (f(x + ei + ej) - f(x + ei - ej) - f(x - ei + ej) + f(x - ei - ej)) / (4 * h * h)
    return H

def ordinal_logit(y, X, names):
    """
    Proportional-odds (cumulative logit) model for an ordered outcome coded 0 < 1 < ... < k-1.
    OR > 1 means a shift toward higher categories. Returns odds ratios with 95% Wald CIs.
    """
    k = int(y.max()) + 1
    idx = np.arange(len(y))

    def nll(w):
        thresholds = np.cumsum(np.concatenate([[w[0]], np.exp(w[1:k - 1])]))
        cdf = special.expit(thresholds[None, :] - (X @ w[k - 1:])[:, None])
        cdf = np.column_stack([np.zeros(len(y)), cdf, np.ones(len(y))])
        return -np.sum(np.log(np.clip(cdf[idx, y + 1] - cdf[idx, y], 1e-12, None)))

    res = minimize(nll, np.zeros(k - 1 + X.shape[1]), method="BFGS")
    se = np.sqrt(np.diag(np.linalg.inv(numerical_hessian(nll, res.x))))[k - 1:]
    b = res.x[k - 1:]
    return pd.DataFrame({"OR": np.exp(b), "CI low": np.exp(b - 1.96 * se), "CI high": np.exp(b + 1.96 * se),
                         "p": 2 * stats.norm.sf(np.abs(b / se))}, index=names)

def build_trials(df):
    """Long format: one row per participant x scored day, with person-level covariates (Section 6.2)."""
    person = pd.DataFrame({
        "pid": np.arange(len(df)),
        "S": df["S"].values, "R": df["R"].values, "IT": is_it(df).values,
        "FL": df["FL_Score"].values,
        "age": pd.to_numeric(df.get("age"), errors="coerce"),
        "male": df.get("gender", pd.Series("", index=df.index)).astype(str).str.strip().str.lower().isin(["male", "man"]).astype(float).values,
        "invest": (~df.get("invest_exp", pd.Series("None", index=df.index)).astype(str).str.strip().isin(["None", "0", "nan"])).astype(float).values,
        "risk_will": pd.to_numeric(df.get("risk_willingness"), errors="coerce"),
    })
    for c in ["age", "risk_will"]:
        person[c] = np.asarray(person[c], dtype=float)
        person[c] = (person[c] - np.nanmean(person[c])) / np.nanstd(person[c])
    trials = []
    for d in SCORED_DAYS:
        t = person.copy()
        t["choice"] = df[f"D{d}"].values
        t["prem_neg"] = float(EV_PREMIUM[d] < 0)
        t["prem_pos"] = float(EV_PREMIUM[d] > 0)
        t["loss"] = float(d in LOSS_DAYS)
        trials.append(t)
    return pd.concat(trials, ignore_index=True).dropna()

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
    """H3: Fisher-Freeman-Halton exact test of Crash Reaction by Cohort, with Cramer's V as effect size."""
    ct = pd.crosstab(df["Cohort"], df["Crash_Reaction"]).reindex(columns=CRASH_ORDER, fill_value=0)
    _, _, cramers_v = chi2_with_cramers_v(ct)
    return ffh_exact_test(ct), cramers_v, ct

def add_confidence_ellipse(ax, x, y, color, linestyle="--"):
    """95% covariance ellipse (chi-square, 2 dof) around a group's (x, y) points.
    Edge only (no fill) so the ellipse never tints the Gamble-Propensity colour of the points."""
    cov = np.cov(x, y)
    vals, vecs = np.linalg.eigh(cov)
    order = vals.argsort()[::-1]
    vals, vecs = vals[order], vecs[:, order]
    angle = np.degrees(np.arctan2(vecs[1, 0], vecs[0, 0]))
    width, height = 2 * np.sqrt(vals * 5.991)
    ax.add_patch(Ellipse(xy=(np.mean(x), np.mean(y)), width=width, height=height, angle=angle,
                         fill=False, edgecolor=color, linewidth=2.6, linestyle=linestyle, zorder=5))

# Per-quadrant encoding for Figure 1: each cluster differs in colour, marker shape and
# ellipse line style, so clusters can be told apart even where ellipses overlap
# (and in greyscale / for colour-blind readers).
QUADRANT_STYLE = {
    "Low S, Low R (Supported Student)": dict(code="Q1", name="Supported Students", marker="o", ls="-"),
    "High S, Low R (Unburdened IT)":    dict(code="Q2", name="Unburdened IT Pros", marker="s", ls=(0, (6, 3))),
    "High S, High R (Committed IT)":    dict(code="Q3", name="Committed IT Pros",  marker="D", ls=(0, (1.5, 2))),
    "Low S, High R (Working Student)":  dict(code="Q4", name="Working Students",   marker="^", ls=(0, (7, 2.5, 1.5, 2.5))),
}

def plot_fig1_sr_landscape(df, filename="fig1_sr_landscape.png"):
    fig, ax = plt.subplots(figsize=(9.5, 7.5), dpi=300)
    
    # Quadrant dividing lines
    ax.axvline(0.5, color="#7F8C8D", linestyle="--", alpha=0.5, lw=1.2)
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
    
    # Add slight jitter for visualization so coinciding/overlapping dots are visible
    rng = np.random.RandomState(42)
    s_plot = df["S"] + rng.uniform(-0.007, 0.007, size=len(df))
    r_plot = df["R"] + rng.uniform(-0.007, 0.007, size=len(df))

    # Per quadrant: tinted 95% ellipse, then points whose FILL encodes Gamble Propensity
    # and whose SHAPE encodes quadrant membership (neutral black outline so the fill reads true).
    gp_norm = plt.Normalize(vmin=0, vmax=100)
    legend_handles = []
    scatter = None
    for quad, style in QUADRANT_STYLE.items():  # Q1..Q4 order, so the legend reads in order
        color = QUADRANT_PALETTE[quad]
        mask =(df["SR_Quadrant"] == quad) & df["S"].notna() & df["R"].notna()
        sub = df[mask]
        if len(sub) < 1:
            continue
        if len(sub) >= 3:
            add_confidence_ellipse(ax, sub["S"], sub["R"], color, linestyle=style["ls"])
        scatter = ax.scatter(s_plot[mask], r_plot[mask], c=sub["GP"], cmap="coolwarm", norm=gp_norm,
                             marker=style["marker"], s=130, alpha=0.95,
                             edgecolors="black", linewidths=0.9, zorder=6)

        # Centroid star with a quadrant tag beside it, drawn above the points
        mean_s, mean_r = sub["S"].mean(), sub["R"].mean()
        ax.scatter(mean_s, mean_r, marker="*", s=420, color=color, edgecolor="black", lw=1.3, zorder=8)
        ax.annotate(style["code"], (mean_s, mean_r), xytext=(9, 7), textcoords="offset points",
                    fontsize=10, fontweight="bold", color="black", zorder=9,
                    bbox=dict(boxstyle="round,pad=0.15", fc=color, ec="black", lw=0.8, alpha=0.9))

        legend_handles.append(Line2D(
            [0], [0], color=color, linestyle=style["ls"], linewidth=2.6,
            marker=style["marker"], markersize=9, markerfacecolor="white",
            markeredgecolor="black", markeredgewidth=1.2,
            label=f"{style['code']} {style['name']} (n = {len(sub)}) · centroid ({mean_s:.2f}, {mean_r:.2f})"))

    if scatter is not None:
        cbar = plt.colorbar(plt.cm.ScalarMappable(norm=gp_norm, cmap="coolwarm"), ax=ax, pad=0.02)
        cbar.set_label("Gamble Propensity (% Gambles Chosen) - point fill", fontsize=11)
    legend_handles.append(Line2D([0], [0], linestyle="none", marker="*", markersize=15,
                                 markerfacecolor="#BBBBBB", markeredgecolor="black",
                                 label="Quadrant centroid (star)"))

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
                        linestyle="-.", linewidth=2.5, zorder=7)
                legend_handles.append(Line2D([0], [0], color="#2C3E50", linestyle="-.", linewidth=2.5,
                                             label="Fitted 50% gamble boundary"))
    except Exception:
        pass

    ax.set_title("Figure 1: (S, R) Four-Quadrant Landscape & Risk Boundaries", fontsize=13, fontweight="bold")
    ax.set_xlabel("Income Stability Score (S) [0 = Volatile Inflows, 1 = Fixed Dependable Salary]", fontsize=11)
    ax.set_ylabel("Financial Responsibility Score (R) [0 = Low Bills, 1 = Heavy Debt / Bills]", fontsize=11)
    ax.set_xlim(-0.02, 1.02)
    ax.set_ylim(-0.02, 1.02)
    # Legend sits below the axes so it never hides points or ellipses
    ax.legend(handles=legend_handles, loc="upper center", bbox_to_anchor=(0.5, -0.11), ncol=2,
              frameon=True, fontsize=9, handlelength=3.2,
              title="Cluster = marker shape + ellipse colour/line style (95% ellipse); point fill = Gamble Propensity",
              title_fontsize=9.5)
    plt.savefig(filename, bbox_inches="tight")
    plt.close()

def plot_fig2_ambiguity_share(df, filename="fig2_ambiguity_share.png", show_stats=True):
    fig, ax = plt.subplots(figsize=(9.5, 6), dpi=300)
    
    # People who never gambled have no gambles to split (AS undefined); they never chose hidden odds,
    # so they are plotted at 0 and counted in n. The statistical tests still leave them out.
    clean_df = df.assign(AS=df["AS"].fillna(0.0))
    order = list(QUADRANT_PALETTE.keys())
    
    sns.boxplot(data=clean_df, x="SR_Quadrant", y="AS", order=order, palette=QUADRANT_PALETTE,
                hue="SR_Quadrant", legend=False, width=0.45, boxprops=dict(alpha=0.75), ax=ax)
    sns.stripplot(data=clean_df, x="SR_Quadrant", y="AS", order=order, color="black", 
                  alpha=0.45, jitter=0.2, s=6, ax=ax)
    
    ax.axhline(50.0, color="#7F8C8D", linestyle="--", linewidth=1.5, label="Neutrality (AS = 50%)")

    if show_stats:  # off for presentation copies
        u, p_u, delta = cohort_ambiguity_test(df)
        ax.text(0.5, 0.97, f"Mann-Whitney U (IT vs. Student) = {u:.0f}, p = {p_u:.2e}\nCliff's delta = {delta:+.2f}",
                transform=ax.transAxes, ha="center", va="top", fontsize=9.5,
                bbox=dict(boxstyle="round,pad=0.4", fc="white", ec="#7F8C8D", alpha=0.9))

    ax.set_title("Figure 2: Ambiguity Share Across (S, R) Financial Profiles", fontsize=13, fontweight="bold")
    ax.set_ylabel("Ambiguity Share (% Gambles on Option C)", fontsize=11)
    ax.set_xlabel("Financial Profile Quadrant", fontsize=11)
    ax.set_xticks(range(len(order)))
    ax.set_xticklabels(quadrant_ticklabels(clean_df, order), fontsize=9.5, fontweight="bold")
    ax.set_ylim(-5, 115)
    ax.legend(loc="upper left")
    plt.savefig(filename, bbox_inches="tight")
    plt.close()

def plot_fig3_crash_reaction(df, filename="fig3_crash_reaction.png", show_stats=True):
    fig, ax = plt.subplots(figsize=(9.5, 6), dpi=300)
    
    order = list(QUADRANT_PALETTE.keys())
    ct_raw = pd.crosstab(df["SR_Quadrant"], df["Crash_Reaction"]).reindex(index=order, columns=CRASH_ORDER, fill_value=0)
    ct_pct = ct_raw.div(ct_raw.sum(axis=1).replace(0, np.nan), axis=0) * 100

    # Expected cell counts are far below 5 here, so the chi-square approximation is invalid
    # (Section 6.2, item 4): use the Fisher-Freeman-Halton exact test instead.
    p_exact = ffh_exact_test(ct_raw)
    _, _, cramers_v = chi2_with_cramers_v(ct_raw)
    overall = df["Crash_Reaction"].value_counts(normalize=True).reindex(CRASH_ORDER, fill_value=0) * 100

    colors = ["#E74C3C", "#7F8C8D", "#27AE60"] # Sell (Red), Hold (Gray), Buy (Green)
    ct_pct.plot(kind="bar", stacked=True, color=colors, ax=ax, edgecolor="white", width=0.55)

    ax.set_title("Figure 3: Reaction to -40% Crash by (S, R) Quadrant (exploratory)", fontsize=13, fontweight="bold")
    test_txt = f"Fisher-Freeman-Halton exact p = {p_exact:.3f}, Cramer's V = {cramers_v:.2f}." if show_stats else ""
    ax.text(0.5, -0.30,
            f"Whole sample: Sell {overall['Sell']:.0f}%, Hold {overall['Hold']:.0f}%, Buy more {overall['Buy more']:.0f}%.   "
            f"{test_txt}\n"
            "Cells are small; quadrant differences are descriptive only.",
            transform=ax.transAxes, ha="center", va="top", fontsize=9.5)
    ax.set_ylabel("Proportion within Profile (%)", fontsize=11)
    ax.set_xlabel("Financial Profile Quadrant", fontsize=11)
    ax.set_xticks(range(len(order)))
    ax.set_xticklabels(quadrant_ticklabels(df, order), rotation=0, fontsize=9.5, fontweight="bold")
    ax.set_ylim(0, 100)
    ax.legend(title="Action", bbox_to_anchor=(1.02, 1), loc="upper left")
    plt.savefig(filename, bbox_inches="tight")
    plt.close()

def plot_fig4_validation_anchor(df, filename="fig4_validation_anchor.png", show_stats=True):
    fig, ax = plt.subplots(figsize=(9, 6.5), dpi=300)
    
    # Regression line
    sns.regplot(data=df, x="HL_Safe_Count", y="GP", scatter=False, 
                line_kws={"color": "#2C3E50", "linewidth": 2.2, "linestyle": "-"}, ax=ax)
    
    # People with identical (HL, GP) would hide behind each other: spread each stack side by side
    # (HL is a whole number, so a small sideways shift can't be misread). The fit uses exact values.
    pos = df[["HL_Safe_Count", "GP"]].round(6)
    rank = pos.groupby(["HL_Safe_Count", "GP"]).cumcount()
    size = pos.groupby(["HL_Safe_Count", "GP"])["GP"].transform("size")
    hl_plot = df["HL_Safe_Count"] + (rank - (size - 1) / 2) * 0.17

    for quad, color in QUADRANT_PALETTE.items():
        m = df["SR_Quadrant"] == quad
        ax.scatter(hl_plot[m], df.loc[m, "GP"], color=color, alpha=0.9, s=85,
                   edgecolor="white", linewidth=0.8, label=f"{quad} (n = {m.sum()})")
        
    r, p = stats.pearsonr(df["HL_Safe_Count"], df["GP"])
    
    stats_txt = f" (r = {r:.2f}, p = {p:.4e})" if show_stats else ""  # no r or p on presentation copies
    ax.set_title(f"Figure 4: Game Risk Validation vs. Holt-Laury Anchor{stats_txt}",
                 fontsize=13, fontweight="bold")
    ax.set_xlabel("Holt-Laury Safe Choices Count (0 = High Risk-Seeking, 10 = High Aversion)", fontsize=11)
    ax.set_ylabel("Game Gamble Propensity (% Gambles Chosen)", fontsize=11)
    ax.axvline(4, color="gray", linestyle="--", label="Risk Neutral Anchor (HL = 4)")
    
    ax.legend(loc="upper right", frameon=True, fontsize=9.5, title="Participant (S, R) Profile")
    plt.savefig(filename, bbox_inches="tight")
    plt.close()

def premium_split(df):
    """Per-participant gamble rate (%) on days where the gamble's EV is below, equal to, or above the sure option."""
    return pd.DataFrame({g: df[[f"D{d}" for d in days]].isin(["B", "C"]).mean(axis=1) * 100
                         for g, days in PREMIUM_GROUPS.items()}, index=df.index)

def plot_fig5_premium_split(df, filename="fig5_premium_split.png"):
    fig, ax = plt.subplots(figsize=(9.5, 6), dpi=300)
    split = premium_split(df)
    groups = list(PREMIUM_GROUPS)
    cohorts = [("IT Professional", "#2ECC71"), ("Student", "#3498DB")]
    x = np.arange(len(groups))
    width = 0.36
    for i, (cohort, color) in enumerate(cohorts):
        sub = split[df["Cohort"] == cohort]
        if sub.empty:
            continue
        means = sub.mean()
        sems = sub.std(ddof=1) / np.sqrt(len(sub))
        bars = ax.bar(x + (i - 0.5) * width, means, width, yerr=sems, capsize=4, color=color,
                      edgecolor="black", linewidth=0.6, label=f"{cohort} (n = {len(sub)})")
        for bar, m, se in zip(bars, means, sems.fillna(0)):
            ax.text(bar.get_x() + bar.get_width() / 2, m + se + 2, f"{m:.0f}%", ha="center", va="bottom", fontsize=9.5)

    ax.set_xticks(x)
    ax.set_xticklabels([f"{g} premium\n(days {', '.join(map(str, PREMIUM_GROUPS[g]))})" for g in groups], fontsize=10)
    ax.set_ylabel("Gamble rate (% of days choosing B or C)", fontsize=11)
    ax.set_title("Figure 5: Gambling by EV Premium of the Gamble over the Sure Option", fontsize=13, fontweight="bold")
    ax.text(0.5, -0.18, "Negative premium: the gamble has LOWER expected value than the sure option. Error bars: +/- 1 SE.",
            transform=ax.transAxes, ha="center", va="top", fontsize=9.5)
    ax.set_ylim(0, 110)
    ax.legend(loc="upper left")
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
        
        dep_val = min(1.0, 0.7 + 0.15 * (r1 - 1)) if r1 > 0 else 0.0
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

def load_real_data(path, sheet=None):
    """
    Loads the exported Google Sheet (.xlsx or .csv) and returns a DataFrame in the same
    schema as simulate_v2_data(), so compute_intake_scores and compute_game_metrics work on it.
    Incomplete responses (missing scoring inputs or any decision/HL answer) are dropped.
    """
    path = Path(path)
    if path.suffix.lower() in (".xlsx", ".xls"):
        if sheet is None:
            # Check if "Responses" exists; if so default to it, else use the first sheet (0)
            xl = pd.ExcelFile(path)
            sheet = "Responses" if "Responses" in xl.sheet_names else 0
        df = pd.read_excel(path, sheet_name=sheet)
    elif path.suffix.lower() == ".csv":
        df = pd.read_csv(path)
    else:
        raise ValueError(f"Unsupported file type: {path.suffix} (use .xlsx or .csv)")
    source_name = f"{path.name} (sheet: {sheet})" if path.suffix.lower() in (".xlsx", ".xls") else path.name
    return clean_responses(df, source_name)

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
    
    # Deduplicate participants by unique ID and timestamp
    n_before_dedup = len(df)
    if "id" in df.columns:
        df = df.drop_duplicates(subset=["id"], keep="first")
    if "timestamp" in df.columns:
        df = df.drop_duplicates(subset=["timestamp"], keep="first")
    n_dropped_dups = n_before_dedup - len(df)
    if n_dropped_dups > 0:
        print(f"Dropped {n_dropped_dups} duplicate response(s). Retained {len(df)} unique participants.")

    df = drop_dev_skip_rows(df)

    print(f"Loaded {len(df)} complete responses from {source} ({n_total - len(df)} dropped: incomplete, duplicate, or test runs).")
    return df.reset_index(drop=True)

# The developer "Skip Stages" tool (devEnsureDummyDays in js/game.js) fills every skipped day with this
# fixed pattern, always at screen position 1. Option order is randomized, so a real participant picking
# position 1 on all 15 days has probability (1/3)^15; rows with this fingerprint are test runs.
DEV_SKIP_PATTERN = np.array(list("BCABCBABBCABCBA"))

def drop_dev_skip_rows(df):
    pos_cols = [f"pos_D{d}" for d in range(1, 16)]
    if not all(c in df.columns for c in pos_cols):
        return df
    choices = df[DECISION_COLS].astype(str).apply(lambda c: c.str.strip()).values
    all_pos_1 = (df[pos_cols].apply(pd.to_numeric, errors="coerce") == 1).all(axis=1).values
    flagged = (choices == DEV_SKIP_PATTERN).all(axis=1) & all_pos_1
    if flagged.any():
        ids = df.loc[flagged, "id"].tolist() if "id" in df.columns else list(np.where(flagged)[0])
        print(f"Excluded {flagged.sum()} Skip Stages test run(s) (placeholder choices, all at screen position 1): {ids}")
    return df.loc[~flagged]

def load_dotenv(path=Path(__file__).resolve().parent / ".env"):
    """Loads KEY=VALUE lines from .env into os.environ without overriding variables already set."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

def load_live_data():
    """
    Fetches every response straight from the Apps Script read endpoint (doGet in apps_script/Code.gs).
    The read key comes from NEUROECO_READ_KEY and the URL from NEUROECO_WEBHOOK_URL, both read
    from the local .env file (or the shell environment). The URL falls back to js/config.js.
    """
    load_dotenv()
    read_key = os.environ.get("NEUROECO_READ_KEY")
    if not read_key:
        raise SystemExit("Set NEUROECO_READ_KEY in .env to the READ_KEY Script Property of the Apps Script.")

    webhook_url = os.environ.get("NEUROECO_WEBHOOK_URL", "").strip()
    if not webhook_url:
        config = (Path(__file__).resolve().parent / "js" / "config.js").read_text(encoding="utf-8")
        match = re.search(r'WEBHOOK_URL:\s*"([^"]+)"', config)
        if not match or not match.group(1).strip():
            raise SystemExit("Set NEUROECO_WEBHOOK_URL in .env (WEBHOOK_URL in js/config.js is empty too).")
        webhook_url = match.group(1).strip()

    url = f"{webhook_url}?{urllib.parse.urlencode({'key': read_key})}"
    with urllib.request.urlopen(url, timeout=60) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    if not payload.get("ok"):
        raise SystemExit(f"Apps Script refused the request: {payload.get('error', 'unknown error')}")

    df = pd.DataFrame(payload["rows"])
    return clean_responses(df, "live Google Sheet")

# ==========================================
# 5. HYPOTHESIS TESTS
# ==========================================

def print_table(table, indent="      "):
    for line in table.to_string(float_format=lambda v: f"{v:.3g}").splitlines():
        print(indent + line)

def run_hypothesis_tests(df):
    print("\n[3] Headline Hypotheses (Holm-corrected across H1-H3):")

    # H1 (coupled): S and R jointly shape gambling, including their interaction. Predictors are centered.
    s = df["S"] - df["S"].mean()
    r = df["R"] - df["R"].mean()
    y = df["GP"].values.astype(float)
    h1, h1_r2, p_h1 = ols(y, np.column_stack([np.ones(len(df)), s, r, s * r]), ["Intercept", "S", "R", "S x R"])

    u, p_h2, delta = cohort_ambiguity_test(df)
    p_h3, crash_v, crash_ct = cohort_crash_test(df)

    raw_p = [p_h1, p_h2, p_h3]
    valid = [i for i, p in enumerate(raw_p) if not np.isnan(p)]
    adj = np.full(3, np.nan)
    adj[valid] = holm([raw_p[i] for i in valid])

    print(f"  H1 Coupled (S, R) -> GP (OLS: GP ~ S + R + S x R): R^2 = {h1_r2:.2f}, "
          f"F-test p = {p_h1:.3g}, Holm p = {adj[0]:.3g}")
    print_table(h1)
    if np.isnan(p_h2):
        print("  H2 Cohort -> AS: not computable (one cohort has no complete responses yet)")
    else:
        print(f"  H2 Cohort -> AS (Mann-Whitney U, IT vs. Student): U = {u:.0f}, p = {p_h2:.3g}, "
              f"Holm p = {adj[1]:.3g}, Cliff's delta = {delta:+.2f}")
    if np.isnan(p_h3):
        print("  H3 Cohort -> Crash Reaction: not computable (crash table too sparse)")
    else:
        print(f"  H3 Cohort -> Crash Reaction (Fisher-Freeman-Halton exact): p = {p_h3:.3g}, "
              f"Holm p = {adj[2]:.3g}, Cramer's V = {crash_v:.2f}")
        print_table(crash_ct)

    print("\n[4] Robustness and Planned Secondary Analyses:")

    # Stability without the student cap, with cohort controlled (Section 6.2 lists S, R and cohort together).
    sr = df["S_raw"] - df["S_raw"].mean()
    rob, rob_r2, _ = ols(y, np.column_stack([np.ones(len(df)), sr, r, sr * r, is_it(df)]),
                         ["Intercept", "S_raw", "R", "S_raw x R", "IT (vs Student)"])
    print(f"  (a) GP ~ S_raw + R + S_raw x R + cohort (uncapped S, cohort controlled): R^2 = {rob_r2:.2f}")
    print_table(rob)
    for cohort in ["IT Professional", "Student"]:
        sub = df[df["Cohort"] == cohort]
        if len(sub) >= 5:
            rho_s, p_s = stats.spearmanr(sub["S_raw"], sub["GP"])
            rho_r, p_r = stats.spearmanr(sub["R"], sub["GP"])
            print(f"      Within {cohort} (n = {len(sub)}): rho(S_raw, GP) = {rho_s:+.2f} (p = {p_s:.3g}), "
                  f"rho(R, GP) = {rho_r:+.2f} (p = {p_r:.3g})")

    # Gambling by EV premium: separates risk attitude from EV-maximizing.
    split = premium_split(df)
    print("  (b) Gamble rate by EV premium of the gamble (B/C) over the sure option (A):")
    for g in PREMIUM_GROUPS:
        it_vals, st_vals = split.loc[df["Cohort"] == "IT Professional", g], split.loc[df["Cohort"] == "Student", g]
        line = f"      {g:<8} premium (days {PREMIUM_GROUPS[g]}): all {split[g].mean():5.1f}%"
        if len(it_vals) and len(st_vals):
            p_g = stats.mannwhitneyu(it_vals, st_vals).pvalue
            line += (f" | IT {it_vals.mean():5.1f}% vs Student {st_vals.mean():5.1f}%, "
                     f"Cliff's delta = {cliffs_delta(it_vals, st_vals):+.2f}, p = {p_g:.3g}")
        rho, p_rho = stats.spearmanr(df["R"], split[g])
        print(line + f" | rho(R, rate) = {rho:+.2f} (p = {p_rho:.3g})")

    # Section 6.2 model 1: trial-level gamble vs safe, clustered by participant.
    trials = build_trials(df)
    covars = ["S", "R", "IT", "prem_neg", "prem_pos", "loss", "FL", "age", "male", "invest", "risk_will"]
    labels = ["S", "R", "IT (vs Student)", "Negative premium (vs zero)", "Positive premium (vs zero)",
              "Loss domain", "Financial literacy (0-3)", "Age (per SD)", "Male", "Any investing experience",
              "Risk willingness (per SD)"]
    keep = [c for c in covars if trials[c].nunique() > 1]
    names = ["Intercept"] + [labels[covars.index(c)] for c in keep]
    gamble = trials["choice"].isin(["B", "C"]).astype(float).values
    X = np.column_stack([np.ones(len(trials))] + [trials[c].values for c in keep])
    try:
        print(f"  (c) Trial-level logit, gamble vs safe ({len(trials)} choices, {trials['pid'].nunique()} participants, "
              "participant-clustered SEs):")
        print_table(logit_cluster(gamble, X, trials["pid"], names))
    except np.linalg.LinAlgError:
        print("  (c) Trial-level logit: not estimable on this sample.")

    # Section 6.2 model 2: among gamble choices, ambiguous (C) vs known risk (B). Premium is identical for B and C.
    amb = trials[trials["choice"].isin(["B", "C"])]
    keep_a = [c for c in keep if c not in ("prem_neg", "prem_pos") and amb[c].nunique() > 1]
    names_a = ["Intercept"] + [labels[covars.index(c)] for c in keep_a]
    try:
        print(f"  (d) Trial-level logit, ambiguous C vs known-risk B ({len(amb)} gamble choices):")
        print_table(logit_cluster((amb["choice"] == "C").astype(float).values,
                                  np.column_stack([np.ones(len(amb))] + [amb[c].values for c in keep_a]),
                                  amb["pid"], names_a))
    except np.linalg.LinAlgError:
        print("  (d) Ambiguity logit: not estimable on this sample.")

    # Ambiguity Share against the neutral point of 50 (Section 6.1).
    print("  (e) Ambiguity Share vs neutral 50 (one-sample Wilcoxon; < 50 = ambiguity averse):")
    for label, sub in [("All", df), ("IT Professional", df[df["Cohort"] == "IT Professional"]),
                       ("Student", df[df["Cohort"] == "Student"])]:
        vals = sub["AS"].dropna()
        if len(vals) >= 5 and (vals != 50).any():
            print(f"      {label:<16} median AS = {vals.median():5.1f} (n = {len(vals)}), "
                  f"p = {stats.wilcoxon(vals - 50).pvalue:.3g}")

    # Day 5: the clean Ellsberg pair, analysed on its own (Section 6.1).
    d5 = df[df["D5"].isin(["B", "C"])]
    if len(d5):
        it5 = d5["Cohort"] == "IT Professional"
        n_c = int((d5["D5"] == "C").sum())
        print(f"  (f) Day 5 Ellsberg urn: {n_c}/{len(d5)} gamblers chose the unstated urn "
              f"(binomial vs 50%: p = {stats.binomtest(n_c, len(d5)).pvalue:.3g}); "
              f"{int((df['D5'] == 'A').sum())} took the sure 300.")
        if it5.any() and (~it5).any():
            table = pd.crosstab(it5, d5["D5"] == "C").reindex(index=[True, False], columns=[True, False], fill_value=0)
            print(f"      IT {table.loc[True, True]}/{table.loc[True].sum()} vs Student {table.loc[False, True]}/"
                  f"{table.loc[False].sum()} chose the unstated urn (Fisher exact p = {stats.fisher_exact(table.values).pvalue:.3g})")

    # Section 6.2 model 4: ordinal crash reaction (Sell < Hold < Buy more) by cohort.
    crash_y = df["Crash_Reaction"].map({c: i for i, c in enumerate(CRASH_ORDER)}).values.astype(int)
    if len(np.unique(crash_y)) == 3 and is_it(df).nunique() == 2:
        print("  (g) Ordinal logit, crash reaction (Sell < Hold < Buy more); OR > 1 = more buying:")
        print_table(ordinal_logit(crash_y, np.column_stack([is_it(df).values, df["R"].values]),
                                  ["IT (vs Student)", "R"]))

    r_hl, p_hl = stats.pearsonr(df["HL_Safe_Count"], df["GP"])
    val_ok = r_hl < -0.30 and p_hl < 0.001
    print(f"  (h) External validation (Holt-Laury -> GP): r = {r_hl:+.3f}, p = {p_hl:.3g} -> "
          f"{'pass' if val_ok else 'fail'} (pre-set criterion: r < -0.30, p < 0.001)")

# Power analysis (questionnaire.md, Section 6.4). Cohen's conventions for a medium effect: d = 0.5, w = 0.3, f2 = 0.15.
# Mann-Whitney is treated as a t-test with asymptotic relative efficiency 0.955 (normal data).
POWER, ALPHA, MW_ARE = 0.80, 0.05, 0.955

def power_ttest(d, n1, n2, alpha=ALPHA):
    df_ = n1 + n2 - 2
    nc = d * np.sqrt(MW_ARE * n1 * n2 / (n1 + n2))
    crit = stats.t.ppf(1 - alpha / 2, df_)
    return 1 - stats.nct.cdf(crit, df_, nc) + stats.nct.cdf(-crit, df_, nc)

def power_chi2(w, n, dof, alpha=ALPHA):
    return 1 - stats.ncx2.cdf(stats.chi2.ppf(1 - alpha, dof), dof, w * w * n)

def power_ftest(f2, n, k, alpha=ALPHA):
    df2 = n - k - 1
    return 1 - stats.ncf.cdf(stats.f.ppf(1 - alpha, k, df2), k, df2, f2 * n) if df2 > 0 else np.nan

def solve_min(fn, grid):
    """First value on the grid where fn reaches the target power."""
    return next((x for x in grid if fn(x) >= POWER), np.nan)

def cliffs_to_d(delta):
    """Cliff's delta to Cohen's d, assuming two normal groups with equal variance."""
    return np.sqrt(2) * stats.norm.ppf((delta + 1) / 2)

def run_power_analysis(df):
    print(f"\n[3b] Power and Sensitivity (alpha = {ALPHA}, two-sided, target power = {POWER:.0%}):")
    n = len(df)
    n_it = int((df["Cohort"] == "IT Professional").sum())
    n_st = int((df["Cohort"] == "Student").sum())
    holm_alpha = ALPHA / 3   # strictest Holm step across H1-H3

    # Observed effects, on the same scale as the power calculations.
    s, r = df["S"] - df["S"].mean(), df["R"] - df["R"].mean()
    _, r2, _ = ols(df["GP"].values.astype(float), np.column_stack([np.ones(n), s, r, s * r]), ["I", "S", "R", "SxR"])
    _, _, delta = cohort_ambiguity_test(df)
    _, crash_v, crash_ct = cohort_crash_test(df)
    obs = {"H1": r2 / (1 - r2), "H2": abs(cliffs_to_d(delta)) if not np.isnan(delta) else np.nan,
           "H3": crash_v * np.sqrt(min(crash_ct.shape) - 1) if not np.isnan(crash_v) else np.nan}

    rows = [
        ("H1 S, R -> GP (OLS, 3 predictors)", "f2", 0.15,
         solve_min(lambda m: power_ftest(0.15, m, 3), range(10, 2000)),
         solve_min(lambda m: power_ftest(0.15, m, 3, holm_alpha), range(10, 2000)),
         f"N = {n}", power_ftest(0.15, n, 3),
         solve_min(lambda e: power_ftest(e, n, 3), np.arange(0.01, 5, 0.01)), obs["H1"]),
        ("H2 Cohort -> AS (Mann-Whitney)", "d", 0.5,
         solve_min(lambda m: power_ttest(0.5, m, m), range(5, 2000)),
         solve_min(lambda m: power_ttest(0.5, m, m, holm_alpha), range(5, 2000)),
         f"{n_it} vs {n_st}", power_ttest(0.5, n_it, n_st) if n_it and n_st else np.nan,
         solve_min(lambda e: power_ttest(e, n_it, n_st), np.arange(0.01, 5, 0.01)) if n_it and n_st else np.nan,
         obs["H2"]),
        ("H3 Cohort -> Crash (2 x 3 table)", "w", 0.3,
         solve_min(lambda m: power_chi2(0.3, m, 2), range(10, 2000)),
         solve_min(lambda m: power_chi2(0.3, m, 2, holm_alpha), range(10, 2000)),
         f"N = {n}", power_chi2(0.3, n, 2),
         solve_min(lambda e: power_chi2(e, n, 2), np.arange(0.01, 2, 0.01)), obs["H3"]),
    ]
    print(f"  {'Hypothesis':<36} | {'Needed (medium)':<16} | {'Holm-strict':<11} | {'Have':<9} | "
          f"{'Power now':<9} | {'Smallest detectable':<19} | {'Observed':<8} | Verdict")
    for name, metric, medium, need, need_holm, have, pw, mde, seen in rows:
        unit = "/group" if metric == "d" else ""
        verdict = ("n/a" if np.isnan(seen) else
                   "effect above detectable size" if seen >= mde else "underpowered for this effect")
        print(f"  {name:<36} | {f'{need}{unit} ({metric}={medium})':<16} | {f'{need_holm}{unit}':<11} | {have:<9} | "
              f"{pw:<9.2f} | {f'{metric} = {mde:.2f}':<19} | {f'{metric} = {seen:.2f}':<8} | {verdict}")
    print("  NOTE: 'Observed' H2 converts Cliff's delta to d (normal approximation); H3 uses Cohen's w = Cramer's V here.")
    print("  NOTE: an underpowered non-significant result is inconclusive, not evidence of no effect.")

def run_data_quality_checks(df):
    """Attention, response time, screen position, beliefs and debrief credibility. Skips fields the data lacks."""
    print("\n[5] Data Quality and Instrument Checks:")
    n = len(df)

    if "C4" in df.columns:
        passed = int((df["C4"].astype(str).str.strip() == "Sometimes").sum())
        print(f"  Attention check (C4): {passed}/{n} correct. The game does not let participants continue "
              "until it is answered correctly, so no exclusions are needed.")

    rt_cols = [f"rt_D{d}" for d in range(1, 16)]
    if all(c in df.columns for c in rt_cols):
        rt = df[rt_cols].apply(pd.to_numeric, errors="coerce") / 1000.0
        person_median = rt.median(axis=1)
        print(f"  Response times: median {np.nanmedian(rt.values):.1f} s per decision; "
              f"{int((person_median < 3).sum())}/{n} participants with a median under 3 s (possible rushing).")
        safe_rt, gamble_rt = [], []
        for i in df.index:
            choices = df.loc[i, [f"D{d}" for d in SCORED_DAYS]].values
            times = rt.loc[i, [f"rt_D{d}" for d in SCORED_DAYS]].values
            is_safe = choices == "A"
            if is_safe.any() and (~is_safe).any():
                safe_rt.append(np.nanmedian(times[is_safe]))
                gamble_rt.append(np.nanmedian(times[~is_safe]))
        if len(safe_rt) >= 5:
            print(f"      Safe vs gamble choices (within person, n = {len(safe_rt)}): median {np.median(safe_rt):.1f} s vs "
                  f"{np.median(gamble_rt):.1f} s, Wilcoxon p = {stats.wilcoxon(safe_rt, gamble_rt).pvalue:.3g}")

    pos_cols = [f"pos_D{d}" for d in range(1, 16)]
    if all(c in df.columns for c in pos_cols):
        pos = pd.Series(df[pos_cols].apply(pd.to_numeric, errors="coerce").values.ravel()).dropna().astype(int)
        counts = pos.value_counts().reindex([1, 2, 3], fill_value=0)
        print(f"  Screen position of chosen option (randomized order): top {counts[1]}, middle {counts[2]}, "
              f"bottom {counts[3]}; chi-square vs equal = {stats.chisquare(counts.values).pvalue:.3g} "
              "(non-significant = no position bias).")

    if "belief_D5" in df.columns:
        b5 = pd.to_numeric(df["belief_D5"], errors="coerce")
        chose_c, chose_b = b5[df["D5"] == "C"].dropna(), b5[df["D5"] == "B"].dropna()
        line = f"  Day 5 belief (own colour in the unstated urn, of 100): median {b5.median():.0f}"
        if len(chose_c) >= 3 and len(chose_b) >= 3:
            line += (f"; chose unstated urn {chose_c.median():.0f} vs stated urn {chose_b.median():.0f}, "
                     f"Mann-Whitney p = {stats.mannwhitneyu(chose_c, chose_b).pvalue:.3g}")
        print(line)

    debrief = {"E1": "stated chances believable", "E2": "unstated chances fair", "E3": "treated credits as real money",
               "E4": "familiar with the investments"}
    if all(c in df.columns for c in debrief):
        print("  Debrief (1-5 scale): " + "; ".join(
            f"{c} {label} median {pd.to_numeric(df[c], errors='coerce').median():.0f}" for c, label in debrief.items()))

# ==========================================
# 6. EXECUTION
# ==========================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Score, test, and plot the 15 Days of Payday responses.")
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--data", help="Exported responses (.xlsx or .csv).")
    source.add_argument("--live", action="store_true", help="Fetch the current responses from the Google Sheet.")
    parser.add_argument("--sheet", default=None, help="Sheet name when reading an Excel workbook (e.g. 'Responses', 'Simulation Runs'). Defaults to 'Responses' if present, else first sheet.")
    parser.add_argument("--no-stats", action="store_true", help="Presentation copies: leave r, p and test values off every figure.")
    args = parser.parse_args()
    show = not args.no_stats

    print("=============================================================")
    if args.live:
        print("RUNNING NEUROECONOMICS ANALYSIS ON REAL DATA (LIVE GOOGLE SHEET: 'Responses')")
        df = load_live_data()
        print(f"Cohort counts: {df['Cohort'].value_counts().to_dict()}")
    elif args.data:
        print(f"RUNNING NEUROECONOMICS ANALYSIS ON REAL DATA (EXPORTED FILE: {args.data})")
        df = load_real_data(args.data, sheet=args.sheet)
        print(f"Cohort counts: {df['Cohort'].value_counts().to_dict()}")
    else:
        print("RUNNING NEUROECONOMICS STRUCTURAL SIMULATION ENGINE (120 Synthetic Participants)")
        print("(Note: To run on your live Google Sheet responses, use: python analyze_results.py --live)")
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
    print(f"{'Quadrant':<34} | {'n':<3} | {'S (Stab)':<8} | {'S_raw':<6} | {'R (Resp)':<8} | {'GP (% Gamble)':<13} | {'AS (% Ambig)':<12} | {'HL Safe (Aversion)':<18}")
    print("-------------------------------------------------------------------------------------------------")
    for quad in ["High S, Low R (Unburdened IT)", "Low S, Low R (Supported Student)", "High S, High R (Committed IT)", "Low S, High R (Working Student)"]:
        sub = df[df["SR_Quadrant"] == quad]
        s_m, sraw_m, r_m = sub["S"].mean(), sub["S_raw"].mean(), sub["R"].mean()
        gp_m = sub["GP"].mean()
        as_m = sub["AS"].mean()
        hl_m = sub["HL_Safe_Count"].mean()
        print(f"{quad:<34} | {len(sub):<3} | {s_m:<8.2f} | {sraw_m:<6.2f} | {r_m:<8.2f} | {gp_m:<13.1f} | {as_m:<12.1f} | {hl_m:<18.2f}")
    print("-------------------------------------------------------------------------------------------------")
    print("NOTE: S caps students at 0.50 (questionnaire_2.md, Section 2B); S_raw is the uncapped score.")
    print("NOTE: 'GP' is Gamble Propensity (Higher = More Gambling). Expected: Q2 > Q1 >= Q3 > Q4")
    print("NOTE: 'HL Safe' is Holt-Laury Safe Choices (Higher = MORE RISK AVERSE = Less Gambling).")
    
    run_hypothesis_tests(df)
    run_power_analysis(df)
    run_data_quality_checks(df)

    print(f"\n[6] Generating High-Resolution Publication Figures in {PLOTS_DIR} ...")
    PLOTS_DIR.mkdir(exist_ok=True)
    plot_fig1_sr_landscape(df, PLOTS_DIR / "fig1_sr_landscape.png")
    plot_fig2_ambiguity_share(df, PLOTS_DIR / "fig2_ambiguity_share.png", show_stats=show)
    plot_fig3_crash_reaction(df, PLOTS_DIR / "fig3_crash_reaction.png", show_stats=show)
    plot_fig4_validation_anchor(df, PLOTS_DIR / "fig4_validation_anchor.png", show_stats=show)
    plot_fig5_premium_split(df, PLOTS_DIR / "fig5_premium_split.png")
    print("All 5 figures updated and saved successfully!")
