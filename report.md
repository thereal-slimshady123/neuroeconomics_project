# 15 Days to Payday: Does Your Money Situation Change How Much Risk You Take?

**Parth Dhodapkar · Joshua Koilpillai** — Neuroeconomics project report

## 1. Research question

People differ in how much financial risk they take. We asked whether two features of a person's real-life money situation explain part of that difference:

- **S, income stability:** how steady a person's income is and how much backup they have.
- **R, money responsibility:** how much of their income is already spoken for by dependents, living costs and debt.

Our expectation was that stable income makes people bolder and heavy obligations make them more careful. We also asked whether IT professionals and university students differ in how they handle *hidden* odds and in their reaction to a market crash.

## 2. Methodology

### 2.1 Participants and data

The study ran as a web game hosted on GitHub Pages, with each completed response saved to a Google Sheet. We received 43 submissions between 29 October and 13 November 2026. One was a developer test run (placeholder choices, always at screen position 1) and was excluded, leaving **N = 42: 22 students and 20 IT professionals**. No other participant was excluded.

| | Students (n = 22) | IT professionals (n = 20) |
|---|---|---|
| Age, mean (SD, range) | 20.0 (1.3, 18–23) | 33.6 (12.8, 21–59) |
| Gender | 18 male, 2 female, 2 other/undisclosed | 12 female, 8 male |
| Main income | 16 parental allowance, 3 part-time, 3 scholarship | 19 full-time salary, 1 other |
| No investing experience | 13 | 1 |
| Willingness to take financial risks (1–5), mean | 2.7 | 3.5 |
| Financial literacy (0–3 correct), mean | 2.7 | 2.8 |

*Table 1. Participant characteristics.*

### 2.2 The game

Participants gave consent, answered a profile questionnaire, completed a standard risk test, played 15 "days" and finished with a short reflection. The profile covered demographics, three financial-literacy questions, the S and R questions, and four comprehension/attention checks (C4 had to be answered correctly to continue).

- **Risk anchor.** Ten Holt–Laury rows, each a choice between a safer lottery (X) and a riskier one (Y). We count the safe (X) choices: 4 is risk-neutral, more is risk-averse.
- **Daily decisions.** Each day offers three options in random on-screen order: **A**, a sure amount; **B**, a gamble with stated odds; **C**, the *same prizes as B* but with odds not stated. Days are independent and credits reset daily. The game records choices only, so no outcomes are realised or shown.
- **Design features.** The expected value of B minus A is deliberately negative on Days 3, 6 and 12, zero on Days 1, 7, 10 and 13, and positive on the other seven standard days, so choosing the gamble is not simply rewarded. Day 5 is a classic Ellsberg urn pair. Day 8 is a 40% market crash (hold a fund worth 2,400 plus 2,000 cash: sell, hold or buy more). Belief probes (the participant's estimated chance in the hidden option) were asked on Days 1, 3, 5 and 12.

### 2.3 Measures

**S (0–1)** is the average of three parts: *Predictable* = (S1 − 1) ÷ 4 for a 1–5 rating; *No big drops* = 1 − S2 ÷ 12, with S2 the number of months in the last 12 that income fell by over 20%; *Safety net* = 1 − (1 − min(1, S3 ÷ 12)) × (1 − S4), with S3 months of personal savings and S4 family help (No 0, Partly 0.5, Yes 1).

**R (0–1)** is the average of *Dependents* (0 if none, otherwise min(1, 0.70 + 0.15 × (R1 − 1))) and *Spoken for* = min(1, (fixed costs + debt repayments) ÷ income). One dependent alone gives R ≥ 0.35, which we treat as high R.

**Student cap.** Student S is capped at 0.50 (the uncapped score is kept as S_raw) for the sake of plotting the graphs. This was a conscious decision: student income (allowances, stipends) is not a stable career income, and without the cap 16 of 22 students would score above 0.5 and be classed as High S alongside IT professionals. The cap is what produces the column of student points at S = 0.5 in the S–R landscape (Figure 1). For our analysis, we use the uncapped S_raw values. <!--Because it is a choice, we checked that our conclusions do not depend on it (Section 3.4).-->

**Groups.** We split participants at S > 0.5 and R ≥ 0.35 into four groups. **Behaviour:** *gamble propensity* GP = share of the 14 standard days (Day 8 excluded) on which B or C was chosen; *known-risk share* KR = share choosing B; *hidden-odds (ambiguity) share* AS = C choices ÷ (B + C choices), where 50 means no preference and AS is undefined for someone who never gambled.

### 2.4 Analysis

The three headline hypotheses were tested with Holm correction: **H1**, GP regressed on S, R and their interaction (OLS, predictors centred); **H2**, IT professionals versus students on AS (Mann–Whitney U, Cliff's delta); **H3**, Day 8 reaction by cohort (Fisher–Freeman–Halton exact test, Cramér's V). We validated the game against the Holt–Laury count (Pearson r) and ran robustness checks, exploratory splits by expected-value premium, a one-sample Wilcoxon test of AS against 50, and a power analysis (80% power, α = 0.05, two-sided; Cohen's medium effects f² = 0.15, d = 0.5, w = 0.3).

## 3. Results

### 3.1 Does the game measure risk taking?

Participants who made more safe choices on the Holt–Laury test gambled less in the game: **r = −0.46, p = 0.002**. This meets our benchmark of r < −0.30, but not the stricter p < 0.001 written into our analysis script. All 42 passed the attention check, the median time per choice was 10.1 s, and the median rating for "I treated credits like real money" was 4 of 5.

### 3.2 Main result (H1)

Steady income raised gambling and responsibility lowered it. For a full-range step in S (0 to 1) the gamble rate rises by about **63 percentage points** (95% CI 36 to 91, p < 0.001), and for a full-range step in R it falls by about **43 points** (CI −63 to −22, p < 0.001), each holding the other at its average. S and R together explain **59%** of the variation in GP (R² = 0.59, Holm-adjusted p < 0.001; f² = 1.44). The S × R interaction was not significant (−44, CI −138 to 49, p = 0.35), so the two effects simply add up.

### 3.3 The four groups

| Group (S, R) | n | S (capped) | S_raw | R | GP % | Median AS | HL safe |
|---|---|---|---|---|---|---|---|
| Unburdened IT pros (high S, low R) | 9 | 0.96 | 0.96 | 0.04 | 96.0 | 42.9 | 2.9 |
| Supported students (low S, low R) | 13 | 0.49 | 0.67 | 0.08 | 61.5 | 22.2 | 5.7 |
| Committed IT pros (high S, high R) | 10 | 0.78 | 0.78 | 0.66 | 51.4 | 5.6 | 4.8 |
| Working students (low S, high R) | 10 | 0.42 | 0.56 | 0.62 | 27.9 | 0.0 | 7.6 |

*Table 2. Behaviour by group. Groups are defined by S and R, not job title: one IT professional (S = 0.40) falls in "Working students", which is why the group sizes differ from the 22/20 cohort split. AS is undefined for two working students who never gambled (n = 8 for that median).*

### 3.4 Is it just IT professionals versus students? (checks on the cap)

We repeated the analysis with the **uncapped S_raw**. With S_raw in place of S, the main model gives almost the same effects (S +63, R −42 points, R² = 0.55). Adding cohort as a control, R remains strongly negative (−54, p < 0.001) and S_raw is positive but borderline (+32, CI −2 to +65, p = 0.066). Within each cohort separately (Spearman correlation with GP): IT professionals S_raw +0.66, R −0.79; students S_raw +0.44, R −0.52. R holds up everywhere; S points the same way but is weaker once job type is accounted for.

### 3.5 Gambling when the gamble was worse

On Days 3, 6 and 12 the sure option had the higher expected value. IT professionals still gambled on **58%** of these choices (35 of 60) and students on **30%** (20 of 66; Cliff's δ = +0.40, p = 0.02, uncorrected). More responsibility went with fewer such gambles (Spearman ρ = −0.52, p < 0.001).

### 3.6 Hidden odds (H2)

Most people avoided hidden odds: the median AS was **23.6** (n = 40; p < 0.001 against 50). IT professionals' median was 31.7 and students' 20.0, but this gap was not significant (U = 246, p = 0.21, Holm p = 0.41, δ = +0.23). On Day 5, 20 people took the sure 300, and the 22 who gambled split evenly (11 per urn). Those who chose the hidden urn had a median belief of 75 (of 100) tokens matching their colour, against 50 for the rest (p = 0.005).

### 3.7 Market crash (H3)

IT professionals: 2 sold, 8 held, 10 bought more. Students: 6, 8 and 8. The difference is not significant (exact p = 0.43, Cramér's V = 0.23; ordinal logit for IT professionals OR 2.71, CI 0.81–9.14, p = 0.11).

### 3.8 Was 42 people enough?

| Test | People needed (medium effect) | Smallest effect we could detect | What we found | Verdict |
|---|---|---|---|---|
| S and R → gambling | 77 | f² = 0.29 | f² = 1.44 | Enough |
| IT vs students: hidden odds | 67 per group | d = 0.91 | d = 0.42 | Too few |
| IT vs students: crash | 108 | w = 0.48 | w = 0.23 | Too few |

*Table 3. Power analysis. "Smallest effect" is what this sample detects 80% of the time; d is converted from Cliff's δ.*

The main result is far larger than the smallest effect 42 people can detect. The IT-versus-student gaps are smaller than that threshold, so those results are inconclusive, not evidence of no difference.

## 4. Limitations

- **Small, self-selected sample.** 42 volunteers can only reveal large effects. The cohorts also differ in age (20 vs 34 on average), gender mix and investing experience, so cohort differences are not cleanly separated from these.
- **Play money.** Credits were not paid out and no gamble outcome is realised or shown, so behaviour may differ from real decisions.
- **Our choices.** S and R weight their parts equally, and the cut-offs (S > 0.5, R ≥ 0.35), the student cap and the rule that one dependent counts as high R are ours.
<!-- - **Understanding and data quality.** 17 of 42 participants misanswered at least one comprehension question (13 on C1); the game reminded them and continued. We made no exclusions beyond the test run: 5 reported zero income, 1 entered a negative number of dependents (scored as none), 6 switched back from Y to X on the Holt–Laury list, 3 chose X on the final row, and 5 had a median response time under 3 s. The first seven responses (29–30 October) came before the 12-month wording of S2 and S3 was committed; all but one reported no income gaps, and that one is a capped student, so no group changes.
- **Position effect.** The middle option was chosen more often (241 of 630 choices vs 204 top and 185 bottom; p = 0.02), despite shuffling. -->
- **Exploratory tests.** The robustness checks and EV-premium splits are not Holm-corrected and should be read as supporting evidence.

## 5. Conclusion

In this small sample, a stable income went with more gambling and heavier obligations with less, and together they explained about 59% of the differences between people. The responsibility effect was the more robust, surviving the removal of the student cap, a cohort control and within-cohort analysis. Differences between IT professionals and students in hidden-odds preference and crash reaction look plausible but need a larger sample, roughly 67 per group or more, to settle.
