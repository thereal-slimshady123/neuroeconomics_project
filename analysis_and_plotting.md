# Neuroeconomics Analysis & Visualization Blueprint (v2.0)
**Project:** Preferences Toward Risk, Uncertainty, and Safety in Financial Decisions (Students vs. IT Professionals)  
**Authors:** Parth Dhodapkar & Joshua Koilpillai  
**Reference Document:** [questionnaire.md](file:///c:/Users/Parth%20Dhodapkar/Downloads/Sem-5/Neuroeconomics/project/questionnaire.md) (v2.0) | [map.md](file:///c:/Users/Parth%20Dhodapkar/Downloads/Sem-5/Neuroeconomics/project/map.md)

---

## 1. Metric Computation Pipeline (v2.0)

### 1.1 Baseline Covariates: Income Stability ($S$) & Financial Responsibility ($R$)

#### A. Income Stability Score ($S \in [0.0, 1.0]$)
Captures monthly predictability ($P$), dependability over the past 6 months ($D$), and non-linear liquid/family buffer:
$$P = \frac{S1 - 1}{4} \qquad D = 1 - \frac{S2}{6}$$
$$B_{own} = \min\left(1.0, \frac{S3}{6.0}\right) \qquad B_{back} = \text{S4 score} \in \{0.0, 0.33, 0.67, 1.0\}$$
$$\text{Buffer} = 1 - (1 - B_{own})(1 - B_{back})$$
$$S = \frac{P + D + \text{Buffer}}{3}$$

*Why the non-linear buffer matters:* A student with ₹0 personal savings ($B_{own}=0$) whose parents cover emergencies ($B_{back}=1.0$) receives $\text{Buffer} = 1.0$. This prevents students from being misclassified as financially vulnerable.

#### B. Financial Responsibility Score ($R \in [0.0, 1.0]$)
Combines moral obligations with monthly cash-flow constraints:
$$\text{Dep} = \min\left(1.0, \frac{R1}{3.0}\right) \qquad \text{Cash} = \min\left(1.0, \frac{R3 + R4}{R2}\right)$$
$$R = \frac{\text{Dep} + \text{Cash}}{2}$$

---

### 1.2 Decision Metrics Across the 14 Standard Trials

Let $n_A, n_B, n_C$ be the number of Safe, Known-Risk, and Ambiguous choices selected across the 14 standard days (Days 1–7 and Days 9–15):

| Metric | Formula | Range | Interpretation |
| :--- | :---: | :---: | :--- |
| **Gamble Propensity (GP)** | $100 \times \frac{n_B + n_C}{14}$ | `[0, 100]` | General risk appetite (willingness to leave sure Option A) |
| **Known-Risk Share (KR)** | $100 \times \frac{n_B}{14}$ | `[0, 100]` | Preference for transparent, verified gambles |
| **Ambiguity Share (AS)** | $100 \times \frac{n_C}{n_B + n_C}$ | `[0, 100]` | Preference for unstated odds among gambles (Neutral = 50%) |
| **Holt-Laury Safe Count (HL)** | Count of X choices in Part 3 | `[0, 10]` | External baseline risk aversion benchmark (Neutral = 4) |
| **Crash Reaction** | Day 8 selection | Categorical | `Sell` vs. `Hold` vs. `Buy more` |

---

## 2. Statistical Hypotheses & Test Framework

| Hypothesis | Test Type | Target Statistic | Interpretation |
| :--- | :--- | :--- | :--- |
| **$H_1$: Stability $\rightarrow$ Risk** | Linear / Logistic Regression | $r, \beta, p < 0.05$ | Tests whether higher $S$ increases Gamble Propensity ($GP$) |
| **$H_2$: Cohort $\rightarrow$ Ambiguity** | Mann-Whitney $U$ Test | Cliff's delta ($\delta$), $p < 0.05$ | Tests whether IT professionals have higher Ambiguity Share ($AS$) |
| **$H_3$: Panic Aversion** | Pearson $\chi^2$ / Fisher-Freeman-Halton | $\chi^2$, Cramér's $V$, $p < 0.05$ | Tests whether IT pros are less likely to sell during the 40% crash |
| **External Validation** | Pearson Correlation | $r < -0.30, p < 0.001$ | Validates game $GP$ against the Holt-Laury price list benchmark |

---

## 3. Publication Visualizations Generated

- **Figure 1: (S, R) Landscape, Cohort Centroids & Gamble Propensity (`fig1_sr_landscape.png`)**  
  Displays individual participants in $(S, R)$ coordinates colored by continuous Gamble Propensity. Displays cohort centroids with 95% confidence covariance ellipses and fitted logistic decision boundary.
- **Figure 2: Ambiguity Share by Cohort (`fig2_ambiguity_share.png`)**  
  Split violin plot with overlaid boxplots, data jitter, a horizontal neutral benchmark line at $AS = 50\%$, and an annotated Mann-Whitney $U$ test with Cliff's delta.
- **Figure 3: Reaction to -40% Crash (`fig3_crash_reaction.png`)**  
  100% stacked bar chart displaying the distribution of `Sell`, `Hold`, and `Buy more` across cohorts with Pearson's $\chi^2$ and Cramér's $V$.
- **Figure 4: External Validation vs. Holt-Laury Anchor (`fig4_validation_anchor.png`)**  
  Regression scatter plot showing the strong negative correlation between the Holt-Laury safe count and the game's Gamble Propensity, demonstrating that the game successfully measures psychometric risk aversion.

---

## 4. Execution Command
To run the full analysis engine and generate all figures:
```bash
python analyze_results.py
```
