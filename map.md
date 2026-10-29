# Metric to Question Mapping & Theoretical Calibration Guide (v2)
**Project:** Preferences Toward Risk, Uncertainty, and Safety in Financial Decisions (Students vs. IT Professionals)  
**Authors:** Parth Dhodapkar & Joshua Koilpillai  
**Reference Document:** [questionnaire.md](file:///c:/Users/Parth%20Dhodapkar/Downloads/Sem-5/Neuroeconomics/project/questionnaire.md) (v2.0)

---

## 1. Real-Life Baseline Profiling: S, R, and Controls

All individual covariates are collected in **Part 2** of the questionnaire before participants enter the game.

### 1.1 Income Stability Score ($S \in [0.0, 1.0]$)
Derived from four specific items (S1 to S4) measuring cash flow predictability, recent shocks, personal liquid runway, and external family backstops:

1. **Predictability Component ($P$):**
   $$P = \frac{S1 - 1}{4} \in [0.0, 1.0]$$
2. **Dependability Component ($D$):**
   $$D = 1 - \frac{S2}{6} \in [0.0, 1.0]$$
   *(Where $S2 \in \{0, 1, 2, 3, 4, 5, 6\}$ is the number of months with late or missing income in the last 6 months).*
3. **Financial Buffer Interaction ($\text{Buffer}$):**
   Captures the economic complementarity between personal liquid savings and family backstops:
   $$B_{own} = \min\left(1.0, \frac{S3}{6.0}\right) \qquad B_{back} = \text{S4 score} \in \{0.0, 0.33, 0.67, 1.0\}$$
   $$\text{Buffer} = 1 - (1 - B_{own})(1 - B_{back}) \in [0.0, 1.0]$$
4. **Composite Income Stability ($S$):**
   $$S_{raw} = \frac{P + D + \text{Buffer}}{3} \in [0.0, 1.0]$$
   $$S = \begin{cases} \min(S_{raw}, 0.50) & \text{if Cohort} = \text{Student} \\ S_{raw} & \text{if Cohort} = \text{IT Professional} \end{cases}$$
   *Student Stability Ceiling:* Student inflows (stipends/scholarships/allowances) lack permanent career tenure and equity accumulation. Capping student $S$ at $0.50$ prevents stipend recipients from crossing $s\_threshold = 0.65$, preserving clean separation between "Low S, Low R (Supported Student)" and "High S, Low R (Unburdened IT)".

---

### 1.2 Financial Responsibility Score ($R \in [0.0, 1.0]$)
Separates moral dependency obligations from direct cash-flow commitments:

1. **Dependency Burden ($\text{Dep}$):**
   $$\text{Dep} = \min\left(1.0, \frac{R1}{3.0}\right) \in [0.0, 1.0]$$
2. **Cashflow Commitment Ratio ($\text{Cash}$):**
   $$\text{Cash} = \min\left(1.0, \frac{R3 + R4}{R2}\right) \in [0.0, 1.0]$$
   *(Where $R2 = \text{monthly money/income}$, $R3 = \text{fixed living costs paid personally}$, and $R4 = \text{monthly debt repayments/EMIs}$).*
3. **Composite Financial Responsibility ($R$):**
   $$R = \frac{\text{Dep} + \text{Cash}}{2} \in [0.0, 1.0]$$

---

### 1.3 Baseline Risk Anchor: Holt & Laury (2002) Multiple Price List (HL)
* **Location:** Part 3 (10 binary lottery pairs X vs. Y).
* **Metric:** Number of safe (X) choices, $HL \in [0, 10]$.
* **Diagnostic Meaning:**
  - $HL = 4$: **Risk-Neutral**
  - $HL > 4$: **Risk-Averse** (e.g., $HL = 6$ indicates standard moderate risk aversion)
  - $HL < 4$: **Risk-Seeking**
* **Purpose:** Validates whether game behavior correlates with standard experimental economics benchmarks.

---

## 2. Decision Metrics Across the 15 Daily Scenarios

Every daily scenario presents three standardized choices:
- **Option A:** Sure outcome (Safe).
- **Option B:** Stated-chance gamble (Known Risk).
- **Option C:** Identical prizes as Option B, but the chance is not stated (Ambiguous).

Let $n_A, n_B, n_C$ be the total counts of A, B, and C selected across the **14 standard days** (Days 1–7 and Days 9–15; Day 8 is analyzed separately as an exogenous shock).

### 2.1 Gamble Propensity ($GP \in [0, 100]$)
$$GP = 100 \times \frac{n_B + n_C}{14}$$
* **Construct:** General willingness to abandon guaranteed capital for variance. Replaces the flawed, arbitrary 50-point RAS score.

### 2.2 Known-Risk Share ($KR \in [0, 100]$)
$$KR = 100 \times \frac{n_B}{14}$$
* **Construct:** Propensity to take calculated gambles with fully transparent, quantified odds.

### 2.3 Ambiguity Share ($AS \in [0, 100]$)
$$AS = 100 \times \frac{n_C}{n_B + n_C}$$
* **Construct:** Pure ambiguity attitude among participants who are willing to gamble.
* **Neutral Benchmark:** $AS = 50\%$ (at indifference, B and C are chosen equally).
  - $AS < 50\%$: **Ambiguity Averse**
  - $AS = 50\%$: **Ambiguity Neutral**
  - $AS > 50\%$: **Ambiguity Seeking**
* **Important:** Undefined if $n_B + n_C = 0$. Strictly risk-averse participants who never gamble are not misclassified as ambiguity-averse.

### 2.4 Day 8 Crash Reaction (Categorical)
* **Standardized Setup:** All participants hold a standardized portfolio (4,000 credits in fund + 2,000 cash). Fund drops 40% to 2,400 credits.
* **Action Categories:**
  - `Sell`: Liquidate entire fund into cash (locks in 2,400 cash).
  - `Hold`: Maintain fund untouched.
  - `Buy more`: Deploy 2,000 cash into the fund at the discounted price.
* **Analysis:** Ordinal logistic regression (`Sell < Hold < Buy more`) and Fisher–Freeman–Halton exact test.

---

## 3. Expected-Value (EV) Calibration Across the 15 Days

| Day | Domain | EV(A) | EV(B) | EV(B) − EV(A) | Role in Design |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **Day 1** | Gain | +320 | +320 | **0** | Fair gamble / Risk-neutral indifference |
| **Day 2** | Gain/Mixed | 0 | +120 | **+120** | Mild risk premium |
| **Day 3** | Gain | +300 | +250 | **−50** | **Detects pure risk seeking** |
| **Day 4** | Gain/Mixed | +150 | +216 | **+66** | Small risk premium |
| **Day 5** | Gain (Urn) | +300 | +400 | **+100** | **Clean Ellsberg Pair (color pre-chosen)** |
| **Day 6** | Gain/Mixed | +993 | +800 | **−193** | **Detects pure risk seeking** |
| **Day 7** | Loss | −200 | −200 | **0** | Fair insurance (loss domain) |
| **Day 8** | Crash | — | — | — | **Exogenous Crisis Reaction (Sell/Hold/Buy)** |
| **Day 9** | Gain/Mixed | +240 | +440 | **+200** | Large risk premium |
| **Day 10** | Loss | −2,100 | −2,100 | **0** | Loss-domain gamble |
| **Day 11** | Gain | +2,500 | +2,750 | **+250** | Risk premium (single time horizon) |
| **Day 12** | Gain | +7,000 | +6,500 | **−500** | **Detects pure risk seeking** |
| **Day 13** | Loss | +3,500 | +3,500 | **0** | Fair gamble; active downside to 2,000 |
| **Day 14** | Skewed | +40 | +70 | **+30** | Skewness / Lottery seeking |
| **Day 15** | Mixed | 0 | +750 | **+750** | Mixed-gamble acceptance at final settlement |

---

## 4. Belief Probes on Ambiguity Days

On Days 1, 3, 5, and 12, participants answer a post-choice belief probe:  
*"In Option C, how likely do you think the winning outcome is? (0–100%)"*

* **Methodological Function:** Distinguishes **pessimistic prior beliefs** (e.g., assuming the researcher rigged the box to 20%) from **true ambiguity aversion** (disliking unknown odds even when expecting 50%).
