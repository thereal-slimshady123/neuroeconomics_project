# Neuroeconomics Decision Game: "15 Days of Payday" (v2)

**Project:** Preferences Toward Risk, Uncertainty, and Safety in Financial Decisions (Students vs. IT Professionals)
**Authors:** Parth Dhodapkar & Joshua Koilpillai
**Version:** 2.0 (revised after methodological review)

---

## 0. How This Document Is Organised

| Part | Content | Purpose |
| :--- | :--- | :--- |
| 1 | Participant instructions and consent text | What participants see first |
| 2 | Pre-game profile (controls, S, R, comprehension checks) | Real-life covariates |
| 3 | Baseline risk anchor (10-row price list) | Validated risk measure independent of the game |
| 4 | The 15 daily scenarios | Main behavioural data |
| 5 | Post-game checks and debrief | Credibility and familiarity checks |
| 6 | Scoring and analysis specification | Metrics, models, tests |
| 7 | Design notes and changes from v1 | Rationale |

**Design logic in one paragraph.** Every scenario offers exactly three options: **A** (sure outcome), **B** (gamble with stated chances), **C** (the *same prizes as B*, but the chance is not stated). Because B and C differ only in whether the chance is stated, the choice between them isolates ambiguity attitude. Because the expected value of B relative to A is deliberately varied (below, equal to, and above A), the choice between A and B identifies risk attitude instead of merely rewarding risk-neutral play.

---

## 1. Participant Instructions and Consent Text

> **Welcome.** This study looks at how people make money decisions. It takes about 15–20 minutes. You will answer some background questions and then work through 15 short "days". Each day presents one money decision with three options.
>
> **Important rules of the game:**
> 1. Every day is a **separate, independent situation**. What you choose on one day does **not** change the amounts you are given on any other day.
> 2. Amounts are in **credits**. Where an option shows a percentage or "chance", that is the real chance used by the game.
> 3. Where an option says **"chance not stated"**, the chance is fixed in advance and is simply not shown to you.
> 4. Results are shown only at the **end** of the game.
> 5. There are no right or wrong answers. Choose what you would actually prefer.
> 6. [OPTIONAL INCENTIVE] One day will be selected at random and your outcome on that day will be paid at **[conversion rate, e.g. 100 credits = ₹X]**.
>
> **Privacy.** Responses are anonymous. Income and expense answers are used only for research and are reported in aggregate. You may stop at any time.
>
> ☐ I have read this and agree to take part.

**Implementation requirements (not shown to participants):**
- Randomise the on-screen order of the three options each day, and store both the underlying code (A/B/C) and the shown position.
- Record response time per day.
- All chances must be genuinely implemented as stated. Pre-fix the unstated chances before the session (see Part 7).

---

## 2. Pre-Game Profile

### 2A. Cohort and Background (controls)

| # | Question | Response format |
| :--- | :--- | :--- |
| P1 | Which group describes you best? | ☐ University student ☐ IT professional ☐ Other (exclude) |
| P2 | Age | Number |
| P3 | Gender (optional) | ☐ Woman ☐ Man ☐ Non-binary ☐ Prefer not to say |
| P4 | Field of study or work | Free text |
| P5 | For IT professionals: years of full-time work | Number (0 for students) |
| P6 | Investing experience (stocks, mutual funds, crypto, etc.) | ☐ None ☐ Under 1 year ☐ 1–3 years ☐ More than 3 years |
| P7 | **General risk willingness.** "How willing are you to take risks in financial matters?" | 0 (not at all) to 10 (fully) |

**Financial literacy (three items):**

| # | Question | Options | Correct |
| :--- | :--- | :--- | :--- |
| FL1 | Suppose you have 100 in a savings account earning 2% interest per year. After 5 years, how much would you have? | More than 102 / Exactly 102 / Less than 102 / Do not know | More than 102 |
| FL2 | Suppose your savings account earns 1% per year and inflation is 2% per year. After 1 year, with the money in this account, you could buy... | More than today / Exactly the same / Less than today / Do not know | Less than today |
| FL3 | True or false: buying a single company's stock usually gives a safer return than a stock mutual fund. | True / False / Do not know | False |

---

### 2B. Income Stability Profile (computes S)

Answer for your **own real life**, not for the game.

| # | Question | Response format |
| :--- | :--- | :--- |
| S0 | Main source of your monthly money | ☐ Salary ☐ Parental allowance ☐ Scholarship/stipend ☐ Part-time/freelance ☐ Mixed (*descriptive only, not scored*) |
| S1 | **Predictability.** How predictable is the amount you receive each month? | 1 = Very unpredictable, 2 = Somewhat unpredictable, 3 = Neither, 4 = Fairly predictable, 5 = Fully predictable |
| S2 | **Recent gaps.** In the last 6 months, in how many months was your money late, missing, or noticeably lower than expected? | 0, 1, 2, 3, 4, 5, or 6 months |
| S3 | **Own savings.** If your income stopped today, for how many months could your own liquid savings cover your essential expenses? | Number of months (decimals allowed; enter 0 if none) |
| S4 | **Support backstop.** If your income stopped today, could family or others cover your essential expenses? | ☐ No (0) ☐ Partly, under 3 months (0.33) ☐ Mostly, 3+ months (0.67) ☐ Fully, 3+ months (1.0) |

**Scoring:**

$$P = \frac{S1 - 1}{4} \qquad D = 1 - \frac{S2}{6} \qquad B_{own} = \min\left(1, \frac{S3}{6}\right) \qquad B_{back} = \text{S4 score}$$

$$\text{Buffer} = 1 - (1 - B_{own})(1 - B_{back})$$

$$S_{raw} = \frac{P + D + \text{Buffer}}{3} \qquad S_{raw} \in [0, 1]$$

$$S = \begin{cases} \min(S_{raw}, 0.50) & \text{if Cohort} = \text{Student} \\ S_{raw} & \text{if Cohort} = \text{IT Professional} \end{cases}$$

*Student Income Stability Cap:* Student income (whether from stipends, fellowships, or parental allowances) is transitory, degree-contingent, and non-equity generating. Capping student $S$ at $0.50$ prevents students on regular monthly stipends from scoring $S \ge 0.65$ and being misclassified into the "High S, Low R (Unburdened IT)" quadrant, correctly anchoring them in the "Low S, Low R (Supported Student)" quadrant. Report P, D, Buffer, and S_raw separately as well.



---

### 2C. Financial Responsibility Profile (computes R)

| # | Question | Response format |
| :--- | :--- | :--- |
| R1 | **Dependents.** How many people (children, parents, siblings, others) rely on you for regular money? | Number |
| R2 | **Monthly money.** Your total monthly income or allowance, in your own currency | Number (M) |
| R3 | **Essential costs you pay yourself.** Monthly rent, food, utilities, transport, insurance that **you** pay (exclude costs paid directly by parents or others) | Number (E) |
| R4 | **Debt repayments.** Monthly EMIs, loan repayments and credit-card minimums that you pay | Number (L) |

**Scoring:**

$$\text{Dep} = \min\left(1, \frac{R1}{3}\right) \qquad \text{Cash} = \min\left(1, \frac{R3 + R4}{R2}\right)$$

$$R = \frac{\text{Dep} + \text{Cash}}{2} \qquad R \in [0, 1]$$

Rent and debt are combined into one cash-commitment ratio because both draw on the same monthly money. Dependents are kept separate because they capture obligation to other people. Report Dep and Cash separately as well.

---

### 2D. Comprehension and Attention Checks

| # | Check | Correct answer |
| :--- | :--- | :--- |
| C1 | "An option says *'60% chance of +800'*. Do you know the chance of winning?" | Yes |
| C2 | "An option says *'chance not stated'*. Do you know the chance of winning?" | No |
| C3 | "If you win credits on Day 1, will you have more credits to use on Day 2?" | No (days are independent) |
| C4 | *(Attention)* "To show you are reading, please select 'Sometimes'." | Sometimes |

Participants who fail C1–C3 are shown the instructions again once. Record the number of failures. Exclude (or flag) failures of C4.

---

## 3. Baseline Risk Anchor (10-Row Price List)

This is the Holt & Laury (2002) multiple price list, with amounts in credits. It provides a standard risk measure that does not depend on the 15-day game.

For each row, choose **Option X** or **Option Y**. The chance of the higher prize is shown.

- **Option X:** 200 credits with chance *p*, otherwise 160 credits.
- **Option Y:** 385 credits with chance *p*, otherwise 10 credits.

| Row | Chance of higher prize (*p*) | Choose X or Y |
| :--- | :--- | :--- |
| 1 | 10% | ☐ X ☐ Y |
| 2 | 20% | ☐ X ☐ Y |
| 3 | 30% | ☐ X ☐ Y |
| 4 | 40% | ☐ X ☐ Y |
| 5 | 50% | ☐ X ☐ Y |
| 6 | 60% | ☐ X ☐ Y |
| 7 | 70% | ☐ X ☐ Y |
| 8 | 80% | ☐ X ☐ Y |
| 9 | 90% | ☐ X ☐ Y |
| 10 | 100% | ☐ X ☐ Y |

**Scoring:** the number of X (safe) choices. A risk-neutral person chooses X in rows 1–4 and Y from row 5 (4 safe choices). More than 4 safe choices indicates risk aversion, fewer than 4 indicates risk seeking. Flag participants who switch back from Y to X (inconsistent) or choose X in row 10.

---

## 4. The 15 Daily Scenarios

**HUD shown to the participant:** `Day X of 15` and the stake for that day. No wallet or net worth is shown, because days are independent.

**Option template.** Every option is described neutrally:
- **Stated chances:** "Chance of this outcome: 60%".
- **Unstated chances:** "Chance of this outcome: not stated".

**Day-specific stake scale (k).** All credit amounts below are for k = 1. For a stake-scale condition (e.g. 1x vs 5x), multiply every credit amount by k.

---

### Day 1: Payday Allocation (gain, 3-day horizon)
*You have **4,000 credits** to place for 3 days.*

| Option | Outcome |
| :--- | :--- |
| **A** | **+320** credits for sure. |
| **B** | **60% chance: +800** credits. **40% chance: −400** credits. |
| **C** | **+800** credits or **−400** credits. Chance of +800: **not stated**. |

*Belief probe after choice:* "In Option C, how likely do you think the +800 outcome is? (0–100%)"

---

### Day 2: Idle Cash Cushion
*You have **3,000 credits** of idle cash for 3 days.*

| Option | Outcome |
| :--- | :--- |
| **A** | Keep it as cash: **0** change, for sure. |
| **B** | **80% chance: +180** credits. **20% chance: −120** credits. |
| **C** | **+180** credits or **−120** credits. Chance of +180: **not stated**. |

---

### Day 3: Sponsor Challenge (instant payout)
*A sponsor offers a one-time payout. No stake needed.*

| Option | Outcome |
| :--- | :--- |
| **A** | Receive **300** credits for sure. |
| **B** | **50% chance: 500** credits. **50% chance: 0** credits. |
| **C** | **500** credits or **0** credits. Chance of 500: **not stated**. |

*Belief probe after choice:* "In Option C, how likely do you think the 500 outcome is? (0–100%)"

---

### Day 4: Lending Window
*You have **3,000 credits** to lend for 3 days.*

| Option | Outcome |
| :--- | :--- |
| **A** | **+150** credits for sure. |
| **B** | **85% chance: +360** credits. **15% chance: −600** credits. |
| **C** | **+360** credits or **−600** credits. Chance of +360: **not stated**. |

---

### Day 5: Two Urns (classic Ellsberg test)
*A token is drawn from an urn. **Before the draw, you choose a colour (Red or Blue).** If the drawn token matches your colour, you win **800** credits; otherwise you win 0. No stake needed.*

| Option | Outcome |
| :--- | :--- |
| **A** | Take **300** credits for sure and skip the draw. |
| **B** | Draw from **Urn 1**: exactly **50 red** and **50 blue** tokens. |
| **C** | Draw from **Urn 2**: 100 tokens, red and blue, **the number of each is not stated**. The mix was set before the session and is not changed. |

*Belief probe after choice:* "In Urn 2, how many of the 100 tokens do you think are your chosen colour? (0–100)"

---

### Day 6: Long-Term Venture
*You have **5,000 credits** to place for 6 days.*

| Option | Outcome |
| :--- | :--- |
| **A** | **+993** credits for sure. |
| **B** | **60% chance: +2,000** credits. **40% chance: −1,000** credits. |
| **C** | **+2,000** credits or **−1,000** credits. Chance of +2,000: **not stated**. |

---

### Day 7: Insurance Offer (loss domain)
*An item you own, unrelated to any market, may be lost. If lost, you lose **1,000** credits.*

| Option | Outcome |
| :--- | :--- |
| **A** | Pay **200** credits for insurance. You lose **0** more, for sure. |
| **B** | No insurance. **20% chance: lose 1,000** credits. **80% chance: lose 0.** |
| **C** | No insurance. You lose **1,000** credits or **0**. Chance of losing 1,000: **not stated**. |

---

### Day 8: Market Crash
*Everyone in this study holds the same standard position: **4,000 credits** in a broad market index fund, plus **2,000 credits** in cash. **Overnight, the index falls 40%.** Your fund position is now worth **2,400 credits**. What happens next is not stated.*

| Option | Action |
| :--- | :--- |
| **A** | **Sell** all of the fund and keep **2,400 credits** in cash. |
| **B** | **Hold** the fund. Do nothing. |
| **C** | **Buy more:** use the **2,000 credits** of cash to buy more of the fund at the lower price. |

*Neutral labels in the data:* A = Sell, B = Hold, C = Buy more. These are not described to participants as "panic" or "opportunistic".

---

### Day 9: Private Placement
*You have **4,000 credits** to place for 4 days.*

| Option | Outcome |
| :--- | :--- |
| **A** | **+240** credits for sure. |
| **B** | **70% chance: +800** credits. **30% chance: −400** credits. |
| **C** | **+800** credits or **−400** credits. Chance of +800: **not stated**. |

---

### Day 10: Unexpected Expense (loss domain)
*An unexpected bill of **2,000 credits** must be paid today. You are choosing how to finance it. The total you pay is shown.*

| Option | Outcome |
| :--- | :--- |
| **A** | Pay a fixed total of **2,100** credits for sure. |
| **B** | **50% chance: pay 1,700** credits. **50% chance: pay 2,500** credits. |
| **C** | Pay **1,700** or **2,500** credits. Chance of 1,700: **not stated**. |

---

### Day 11: Achievement Bonus
*You have won an achievement grant. Choose how your award is paid out.*

| Option | Outcome |
| :--- | :--- |
| **A** | Receive **2,500** credits for sure. |
| **B** | **50% chance: 4,500** credits. **50% chance: 1,000** credits. |
| **C** | **4,500** or **1,000** credits. Chance of 4,500: **not stated**. |

---

### Day 12: Short Contract
*You choose how a 3-day contract pays you. The result is **one draw for the whole contract**.*

| Option | Outcome |
| :--- | :--- |
| **A** | Receive **7,000** credits in total for sure. |
| **B** | **50% chance: 10,000** credits. **50% chance: 3,000** credits. |
| **C** | **10,000** or **3,000** credits. Chance of 10,000: **not stated**. |

*Belief probe after choice:* "In Option C, how likely do you think the 10,000 outcome is? (0–100%)"

---

### Day 13: A Holding That Has Dropped
*A holding you own has fallen 30%, from 5,000 to **3,500** credits.*

| Option | Outcome |
| :--- | :--- |
| **A** | **Sell now** and receive **3,500** credits for sure. |
| **B** | **Keep it.** **50% chance: worth 5,000** credits. **50% chance: worth 2,000** credits. |
| **C** | **Swap** into a different holding worth **5,000** or **2,000** credits. Chance of 5,000: **not stated**. |

---

### Day 14: Overnight Long Shot
*You have **4,000 credits** to place overnight.*

| Option | Outcome |
| :--- | :--- |
| **A** | **+40** credits for sure. |
| **B** | **10% chance: +1,600** credits. **90% chance: −100** credits. |
| **C** | **+1,600** or **−100** credits. Chance of +1,600: **not stated**. |

---

### Day 15: Final Proposition
*Your final wealth for this game is set at **10,000 credits** for everyone. You may keep it or take a final gamble.*

| Option | Outcome |
| :--- | :--- |
| **A** | Keep **10,000** credits for sure. |
| **B** | **50% chance: +4,000** (final wealth 14,000). **50% chance: −2,500** (final wealth 7,500). |
| **C** | **+4,000** or **−2,500**. Chance of +4,000: **not stated**. |

---

### Expected-Value Calibration (researcher-only, not shown to participants)

Expected value (EV) of B minus the sure outcome of A. C has the same prizes as B and, when its hidden chance is set equal to B's chance, the same EV.

| Day | Domain | EV(A) | EV(B) | EV(B) − EV(A) | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Gain | +320 | +320 | **0** | Risk-neutral indifference |
| 2 | Gain/mixed | 0 | +120 | **+120** | Mild premium |
| 3 | Gain | 300 | 250 | **−50** | Detects risk seeking |
| 4 | Gain/mixed | +150 | +216 | **+66** | Small premium |
| 5 | Gain (urn) | 300 | 400 | **+100** | Clean Ellsberg pair |
| 6 | Gain/mixed | +600 | +450 | **−150** | Detects risk seeking |
| 7 | Loss | −200 | −200 | **0** | Fair insurance |
| 8 | Crash | n/a | n/a | n/a | Categorical (Sell/Hold/Buy) |
| 9 | Gain/mixed | +240 | +440 | **+200** | Large premium |
| 10 | Loss | −2,100 | −2,100 | **0** | Loss-domain gamble |
| 11 | Gain | 2,500 | 2,750 | **+250** | Premium |
| 12 | Gain | 7,000 | 6,500 | **−500** | Detects risk seeking |
| 13 | Loss | 3,500 | 3,500 | **0** | Fair; no dominance |
| 14 | Skewed | +40 | +70 | **+30** | Skewness seeking |
| 15 | Mixed | 0 | +750 | **+750** | Mixed-gamble acceptance |

Three days have a negative premium, four are neutral, and seven are positive, so risk-averse, risk-neutral and risk-seeking people choose differently across days.

---

## 5. Post-Game Checks and Debrief

| # | Question | Response format |
| :--- | :--- | :--- |
| E1 | "How much did you believe the chances stated in the game were real?" | 1 (not at all) to 5 (completely) |
| E2 | "How much did you believe the 'not stated' chances were fair (neither favourable nor unfavourable to you)?" | 1 (very unfavourable) to 5 (very favourable) |
| E3 | "Did you treat the game credits like real money?" | 1 (not at all) to 5 (completely) |
| E4 | "How familiar were you with the types of investments described?" | 1 to 5 |
| E5 | "What strategy, if any, did you use?" | Free text |

**Debrief (shown at the end):**
1. Results for all days are revealed.
2. The actual unstated chances and Urn 2 composition are disclosed.
3. If incentives are used, the randomly selected payment day is shown.
4. The purpose of the study is explained and contact details are given.

---

## 6. Scoring and Analysis Specification

Let $n_A, n_B, n_C$ be the number of A, B and C choices across the **14 standard days** (Days 1–7 and 9–15).

### 6.1 Metrics

| Metric | Formula | Meaning |
| :--- | :--- | :--- |
| **Gamble Propensity (GP)** | $100 \times \dfrac{n_B + n_C}{14}$ | Willingness to leave the sure option |
| **Known-Risk Share (KR)** | $100 \times \dfrac{n_B}{14}$ | Preference for stated-chance gambles |
| **Ambiguity Share (AS)** | $100 \times \dfrac{n_C}{n_B + n_C}$ | Among gamble choices, preference for unstated chances (undefined if $n_B + n_C = 0$) |
| **Safe-choice count (HL)** | Number of X choices in Part 3 | Baseline risk aversion |
| **Crash Reaction** | Day 8: A = Sell, B = Hold, C = Buy more | Categorical |
| **S, R** | Parts 2B and 2C | Real-life stability and responsibility |

**Reference value for AS:** a person indifferent between B and C chooses C about 50% of the time, so AS = 50 is the neutral point. AS below 50 indicates ambiguity aversion, above 50 ambiguity seeking. Test AS against 50 within the sample (e.g. one-sample Wilcoxon), instead of using fixed bands.

**Day 5 (clean Ellsberg pair):** analyse separately as B vs C.

### 6.2 Models

1. **Gamble vs safe (risk):** logistic regression with GEE (exchangeable correlation) or a mixed-effects logit, clustered by participant. Outcome: A vs (B or C) per day. Predictors: S, R, cohort, day fixed effects, EV(B) − EV(A), domain (gain/loss), controls (age, gender, investing experience, financial literacy, P7).
2. **Ambiguity (matched):** same structure on days where the participant chose B or C. Outcome: C vs B. Predictors as above, plus belief (where measured).
3. **Cohort and stake scale (if used):** include cohort × scale interaction.
4. **Crash reaction:** ordinal logistic regression (Sell < Hold < Buy more) with cohort and controls. Use the Fisher–Freeman–Halton exact test instead of the chi-square test if any expected cell count is below 5.
5. **S and R across cohorts:** Hotelling's $T^2$ or MANOVA on $(S, R)$; check overlap (common support) between cohorts.

### 6.3 Effect sizes and corrections
- Report Cliff's delta (or rank-biserial) for GP and AS differences, Cramér's $V$ for the crash table, odds ratios with confidence intervals for regressions.
- Apply Holm correction across the three headline hypotheses.

### 6.4 Sample size
- About 64 per group for a medium effect ($d = 0.5$, 80% power); about 108 total for a chi-square with $w = 0.3$, df = 2.
- If using the stake-scale condition (1x vs 5x), the per-cell size falls, so plan for roughly twice as many participants.

### 6.5 Data dictionary (one row per participant)

`id, cohort, age, gender, work_years, invest_exp, risk_willingness, FL1, FL2, FL3, S0, S1, S2, S3, S4, P, D, Buffer, S, R1, R2, R3, R4, Dep, Cash, R, C1, C2, C3, C4, HL1..HL10, D1..D15 (A/B/C), pos_D1..pos_D15, rt_D1..rt_D15, belief_D1, belief_D3, belief_D5, belief_D12, E1..E5, scale_k`

---

## 7. Design Notes and Changes from v1

**Main changes, with reasons:**

1. **Stake scaling.** v1 gave students 1,000 and IT professionals 5,000 with identical absolute amounts, which confounded cohort with stake size relative to wealth. v2 uses the same credit amounts for everyone and an optional stake-scale condition (k) to separate wealth effects from cohort effects. Differences in real-life stability and obligations enter through S and R.
2. **Independent days.** v1 carried money across days, so earlier outcomes changed later stakes (house-money effects) and stakes could exceed available cash. v2 gives a fixed stake each day and reveals outcomes only at the end.
3. **Expected-value calibration.** In v1, B beat A in expected value in almost every scenario, so risk-neutral and risk-seeking people looked identical. v2 varies EV(B) − EV(A) deliberately.
4. **Matched ambiguity.** In v1, C often differed from B in payoffs and downside. In v2, C has the same prizes as B, so B vs C isolates ambiguity.
5. **Removed riskless "risky" options.** v1 Days 2, 10 and 13 had options without a real downside or with a certain cost. In v2 every B has a genuine downside and the hold-versus-sell decision on Day 13 is no longer dominated.
6. **Contradiction removed.** v1 stated a 30% crash probability on Day 7 and then crashed everyone on Day 8, which weakens trust in stated odds. v2 makes Day 7 an unrelated insurance decision and states no crash probability anywhere.
7. **Day 8 standardised.** Everyone holds the same position and cash, and options use neutral labels (Sell, Hold, Buy more).
8. **Neutral wording.** Words such as "Verified", "Proven", "Unproven", "Opaque", "Black-Box" and "Mystery" were removed because they steer choices away from C regardless of ambiguity. Contextual familiarity (e.g. AI hedging contracts) is also removed because IT professionals may know more about it.
9. **Single time horizon where needed.** Day 11 pays out at one time for all options, removing the time-preference confound.
10. **S and R fixed.** One definition, scores in [0, 1], raw-number inputs, a family-support item (especially important for students), and separate reporting of components.
11. **New controls and checks.** Financial literacy, investing experience, general risk question, comprehension and attention checks, belief probes, credibility checks, and a Holt–Laury price list as a validated anchor.

**Pre-session tasks for the researchers:**
- Fix and record the hidden chances for all "chance not stated" options before any participant plays. A simple approach is to set each hidden chance equal to the matching B chance, or to draw it from a range centred on B, and publish the values at debrief.
- Draw outcomes with a seeded random number generator and store the seed.
- Obtain ethics approval and finalise the incentive and conversion rate.
- Pilot with 8–10 people and check the Part 3 inconsistency rate and the distribution of GP and AS for ceiling or floor effects.