# 15 Days to Payday: Does Your Money Situation Change How Much Risk You Take?

**Parth Dhodapkar · Joshua Koilpillai** — Neuroeconomics project report

## 1. Research question

Does a person's real-life money situation explain how much financial risk they take? We looked at two things: **S**, income stability (how steady income is and how much backup there is), and **R**, money responsibility (how much income is already committed to dependents, living costs and debt). We expected stable income to make people bolder and heavy obligations to make them more careful. We also compared IT professionals and students on hidden odds and on a market crash.

## 2. Methodology

### 2.1 Participants

A web game saved each response to a Google Sheet. We got 43 submissions between 29 October and 13 November 2026 and dropped one developer test run, leaving **N = 42: 22 students and 20 IT professionals**.

| | Students (n = 22) | IT professionals (n = 20) |
|---|---|---|
| Age, mean (range) | 20.0 (18–23) | 33.6 (21–59) |
| Gender | 18 male, 2 female, 2 other/undisclosed | 12 female, 8 male |
| No investing experience | 13 | 1 |

*Table 1. Participant characteristics.*

### 2.2 The game

After consent, participants filled in a profile (demographics, financial literacy, the S and R questions, comprehension and attention checks), did a 10-row Holt–Laury risk test (safe choices counted: 4 is risk-neutral, more is risk-averse), played 15 "days" and answered a short reflection.

- **Daily decisions.** Each day offers **A**, a sure amount; **B**, a gamble with stated odds; or **C**, the *same prizes as B* with the odds hidden. The order is random, days are independent, and no outcomes are shown.
- **Design.** The gamble beats the sure option on average on seven days, ties on four and loses on three (Days 3, 6, 12). Day 5 is an Ellsberg urn pair and Day 8 is a 40% market crash (sell, hold or buy more). Four days also asked for the person's estimated chance in the hidden option.

### 2.3 Measures

**S (0–1)** averages three parts: *predictability* = (S1 − 1) ÷ 4; *no big drops* = 1 − S2 ÷ 12, where S2 is the months in the last 12 that income fell by over 20%; and *safety net* = 1 − (1 − min(1, S3 ÷ 12)) × (1 − S4), where S3 is months of savings and S4 is family help (0, 0.5 or 1).

**R (0–1)** averages *dependents* (0 if none, else min(1, 0.70 + 0.15 × (R1 − 1))) and *spoken for* = min(1, (fixed costs + debt) ÷ income). One dependent alone gives R ≥ 0.35, which we treat as high R.

**Student cap.** Student S is capped at 0.50 (the uncapped score is kept as S_raw) for the sake of plotting the graphs. This was a conscious decision: student income (allowances, stipends) is not a stable career income, and without the cap 16 of 22 students would score above 0.5 and be classed as High S alongside IT professionals. The cap is what produces the column of student points at S = 0.5 in the S–R landscape (Figure 1). For our analysis, we use the uncapped S_raw values. <!--Because it is a choice, we checked that our conclusions do not depend on it (Section 3.4).-->

**Groups and behaviour.** We split people at S > 0.5 and R ≥ 0.35 into four groups. *Gamble propensity* (GP) is the share of the 14 standard days (Day 8 excluded) on which B or C was chosen. *Hidden-odds share* (AS) is C choices ÷ (B + C choices); 50 means no preference.

### 2.4 Analysis

Three headline tests, Holm-corrected: **H1**, GP on S, R and their interaction (OLS); **H2**, IT professionals vs students on AS (Mann–Whitney U); **H3**, Day 8 reaction by cohort (exact test). Secondary checks are Holm-corrected within each family of related tests. Correcting all 20 together would keep the R and hidden-odds results significant, but not the IT-versus-student gambling gap or student-only correlations. We also ran a power analysis (80% power, α = 0.05).

## 3. Results

**3.1 Validity.** People who made more safe Holt–Laury choices gambled less in the game (**r = −0.46**, p = 0.002, Holm p = 0.006). This meets our r < −0.30 benchmark but not the p < 0.001 in our analysis script. All 42 passed the attention check, and the median "treated credits like real money" rating was 4 of 5.

**3.2 Main result (H1).** From the least to the most stable income (S, 0 to 1), the gamble rate rises by about **63 percentage points** (95% CI 36 to 91, p < 0.001). From the least to the most responsibility (R, 0 to 1), it falls by about **43 points** (CI −63 to −22, p < 0.001). Each estimate holds the other factor at its average. Together they explain **59%** of the variation in GP (R² = 0.59, Holm p < 0.001). The S × R interaction was not significant (p = 0.35), so the effects simply add up. Using S_raw instead of the capped S barely changes the figures (S +63, R −42 points) and does not affect our results; the most notable change is R², from 0.59 to 0.55.

**3.3 Four groups.**

| Group (S, R) | n | S (capped) | S_raw | R | GP % | Median AS |
|---|---|---|---|---|---|---|
| Unburdened IT pros (high S, low R) | 9 | 0.96 | 0.96 | 0.04 | 96.0 | 42.9 |
| Supported students (low S, low R) | 13 | 0.49 | 0.67 | 0.08 | 61.5 | 22.2 |
| Committed IT pros (high S, high R) | 10 | 0.78 | 0.78 | 0.66 | 51.4 | 5.6 |
| Working students (low S, high R) | 10 | 0.42 | 0.56 | 0.62 | 27.9 | 0.0 |

*Table 2. Groups follow S and R, not job title: one IT professional (S = 0.40) is in "Working students". Two working students never gambled, so their AS is undefined.*

**3.4 Is it just IT professionals vs students?** With S_raw and cohort added as a control, R stays strongly negative (−54, Holm p < 0.001) and S_raw is positive but borderline (+32, Holm p = 0.066). Within each cohort, the Spearman correlations with GP are +0.66 (S_raw) and −0.79 (R) for IT professionals, and +0.44 and −0.52 for students (all four Holm p < 0.05). R holds up everywhere; S points the same way but is weaker.

**3.5 Gambling when the gamble was worse.** On Days 3, 6 and 12 the sure option had the higher expected value. IT professionals still gambled on **58%** of these choices (35 of 60) and students on **30%** (20 of 66; Holm p = 0.04). More responsibility went with fewer such gambles (Spearman ρ = −0.52, Holm p = 0.001).

**3.6 Hidden odds (H2).** Most people avoided hidden odds: the median AS was **23.6** (n = 40, Holm p < 0.001 against 50). The medians were 31.7 for IT professionals and 20.0 for students, but the gap is not significant (p = 0.21, Holm p = 0.41). On Day 5, those who chose the hidden urn had a median belief of 75 (out of 100) tokens matching their colour, against 50 for the rest (Holm p = 0.009).

**3.7 Market crash (H3).** IT professionals: 2 sold, 8 held, 10 bought more. Students: 6, 8 and 8. The difference is not significant (exact p = 0.43, Cramér's V = 0.23).

**3.8 Was 42 people enough?**

| Test | People needed (medium effect) | Smallest effect we can detect | What we found | Verdict |
|---|---|---|---|---|
| S and R → gambling | 77 | f² = 0.29 | f² = 1.44 | Enough |
| IT vs students: hidden odds | 67 per group | d = 0.91 | d = 0.42 | Too few |
| IT vs students: crash | 108 | w = 0.48 | w = 0.23 | Too few |

*Table 3. Power analysis. "Smallest effect" is what this sample detects 80% of the time.*

The main result is well above what 42 people can detect. The IT-versus-student gaps are not, so they are inconclusive.

## 4. Limitations

- **Small, self-selected sample.** 42 volunteers can only reveal large effects. The cohorts also differ in age, gender mix and investing experience, so cohort effects are mixed up with these.
- **Play money.** Credits were not paid out and no outcome was shown, so real decisions may differ.
- **Our choices.** S and R weight their parts equally, and the cut-offs (S > 0.5, R ≥ 0.35), the student cap and the one-dependent rule are ours.<!-- - **Understanding and data quality.** 17 of 42 participants misanswered at least one comprehension question (13 on C1); the game reminded them and continued. We made no exclusions beyond the test run: 5 reported zero income, 1 entered a negative number of dependents (scored as none), 6 switched back from Y to X on the Holt–Laury list, 3 chose X on the final row, and 5 had a median response time under 3 s. The first seven responses (29–30 October) came before the 12-month wording of S2 and S3 was committed; all but one reported no income gaps, and that one is a capped student, so no group changes.-->
- **Position effect.** The middle option was picked more often (241 of 630 choices vs 204 top and 185 bottom; Holm p = 0.02), despite shuffling.

## 5. Conclusion

Stable income went with more gambling and heavier obligations with less, together explaining about 59% of the differences between people. The responsibility effect was the sturdier one. Whether IT professionals and students differ on hidden odds and crash reaction needs about 67 people per group or more.
