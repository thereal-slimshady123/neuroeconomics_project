/**
 * Complete Scenario & Questionnaire Definitions (v2.0)
 * Directly matches questionnaire_2.md & map.md
 */

const EXPERIMENT_DATA = {
  // PART 1: Instructions & Consent
  consent: {
    title: "15 Days of Payday: Financial Decision Study",
    instructions: [
      "Welcome. This study investigates how individuals make financial decisions across varying conditions of risk and uncertainty. It takes approximately 15–20 minutes to complete.",
      "You will complete a brief background profile followed by 15 short consecutive \"days\". Each day presents a realistic financial decision scenario with three options.",
      "Important Rules:",
      "1. Every day is an independent situation. What you choose on one day does NOT change the credits you are allocated on any other day.",
      "2. Amounts are displayed in credits. Where a percentage or \"chance\" is shown, that is the exact probability implemented by the experiment.",
      "3. Where an option states \"chance not stated\", the probability was pre-fixed before this session and is simply hidden from view.",
      "4. Results across all days are calculated and revealed only at the very end of the study.",
      "5. There are no right or wrong answers. Select what you would genuinely prefer in your own financial life.",
      "6. Privacy: All data is anonymized and used solely for neuroeconomics research reported in aggregate."
    ]
  },

  // PART 2: Pre-Game Profile
  profile: {
    controls: [
      { id: "P1", label: "Which group describes you best?", type: "select", options: ["University student", "IT professional", "Other"] },
      { id: "P2", label: "Age", type: "number", min: 18, max: 99, placeholder: "e.g. 23" },
      { id: "P3", label: "Gender (optional)", type: "select", options: ["Prefer not to say", "Woman", "Man", "Non-binary"] },
      { id: "P4", label: "Field of study or work specialization", type: "text", placeholder: "e.g. Computer Science, Fullstack Dev, Economics" },
      { id: "P5", label: "For IT professionals: years of full-time professional work experience (Enter 0 if student)", type: "number", min: 0, max: 50, placeholder: "Years" },
      { id: "P6", label: "Investing experience (stocks, mutual funds, crypto, FDs, etc.)", type: "select", options: ["None", "Under 1 year", "1–3 years", "More than 3 years"] },
      { id: "P7", label: "General financial risk willingness: \"How willing are you to take risks in financial matters?\" (0 = Not at all willing, 10 = Fully willing)", type: "range", min: 0, max: 10, default: 5 }
    ],

    financialLiteracy: [
      {
        id: "FL1",
        question: "Suppose you have 100 credits in a savings account earning 2% interest per year. After 5 years, how much would you have in the account?",
        options: ["More than 102 credits", "Exactly 102 credits", "Less than 102 credits", "Do not know"],
        correct: "More than 102 credits"
      },
      {
        id: "FL2",
        question: "Suppose your savings account earns 1% interest per year, and inflation is 2% per year. After 1 year, with the money in this account, you could buy...",
        options: ["More than today", "Exactly the same as today", "Less than today", "Do not know"],
        correct: "Less than today"
      },
      {
        id: "FL3",
        question: "True or False: Buying a single company's stock usually provides a safer return than a diversified stock mutual fund.",
        options: ["True", "False", "Do not know"],
        correct: "False"
      }
    ],

    incomeStability: [
      { id: "S0", label: "Main source of your monthly money / income:", type: "select", options: ["Salary", "Parental allowance", "Scholarship / stipend", "Part-time / freelance", "Mixed"] },
      { id: "S1", label: "Predictability: How predictable is the amount of money you receive each month?", type: "select", options: ["1 = Very unpredictable", "2 = Somewhat unpredictable", "3 = Neither", "4 = Fairly predictable", "5 = Fully predictable"] },
      { id: "S2", label: "Recent Gaps: In the last 12 months, in how many months was your money late, missing, or noticeably lower than expected?", type: "number", min: 0, max: 12, placeholder: "0 to 12 months" },
      { id: "S3", label: "Liquid Runway: If your income stopped today, for how many months could your own personal savings cover your essential living expenses?", type: "number", min: 0, max: 120, step: 0.5, placeholder: "Number of months (enter 0 if none)" },
      { id: "S4", label: "Support Backstop: If your income stopped today, could family or relatives cover your essential expenses?", type: "select", options: ["No", "Partly, under 3 months", "Mostly, 3+ months", "Fully, 3+ months"] }
    ],

    financialResponsibility: [
      { id: "R1", label: "Dependents: How many people (children, parents, siblings) rely on you for regular financial support?", type: "number", min: 0, max: 20, placeholder: "Number of people (0 if none)" },
      { id: "R2", label: "Total Monthly Money: Your approximate monthly personal income or allowance (in your local currency, e.g. ₹ INR):", type: "number", min: 1, placeholder: "e.g. 35000" },
      { id: "R3", label: "Essential Costs: Monthly rent, food, utilities, bills that YOU pay personally:", type: "number", min: 0, placeholder: "e.g. 15000" },
      { id: "R4", label: "Debt Repayments: Monthly loan EMIs, education debt, or credit card minimums YOU pay:", type: "number", min: 0, placeholder: "e.g. 0" }
    ],

    comprehensionChecks: [
      { id: "C1", question: "An option states: \"60% chance of +800 credits\". Do you know the exact chance of winning?", options: ["Yes", "No"], correct: "Yes" },
      { id: "C2", question: "An option states: \"Chance not stated\". Do you know the exact chance of winning?", options: ["Yes", "No"], correct: "No" },
      { id: "C3", question: "If you win credits on Day 1, will you have more credits available to use on Day 2?", options: ["Yes", "No (days are independent)"], correct: "No (days are independent)" },
      { id: "C4", question: "Attention check: To show that you are reading questions carefully, please select \"Sometimes\".", options: ["Always", "Never", "Sometimes", "Often"], correct: "Sometimes" }
    ]
  },

  // PART 3: Baseline Risk Anchor (Holt-Laury Multiple Price List)
  holtLaury: [
    { row: 1, p: 0.10, probStr: "10%", xStr: "10% chance of 200 credits, 90% chance of 160 credits", yStr: "10% chance of 385 credits, 90% chance of 10 credits" },
    { row: 2, p: 0.20, probStr: "20%", xStr: "20% chance of 200 credits, 80% chance of 160 credits", yStr: "20% chance of 385 credits, 80% chance of 10 credits" },
    { row: 3, p: 0.30, probStr: "30%", xStr: "30% chance of 200 credits, 70% chance of 160 credits", yStr: "30% chance of 385 credits, 70% chance of 10 credits" },
    { row: 4, p: 0.40, probStr: "40%", xStr: "40% chance of 200 credits, 60% chance of 160 credits", yStr: "40% chance of 385 credits, 60% chance of 10 credits" },
    { row: 5, p: 0.50, probStr: "50%", xStr: "50% chance of 200 credits, 50% chance of 160 credits", yStr: "50% chance of 385 credits, 50% chance of 10 credits" },
    { row: 6, p: 0.60, probStr: "60%", xStr: "60% chance of 200 credits, 40% chance of 160 credits", yStr: "60% chance of 385 credits, 40% chance of 10 credits" },
    { row: 7, p: 0.70, probStr: "70%", xStr: "70% chance of 200 credits, 30% chance of 160 credits", yStr: "70% chance of 385 credits, 30% chance of 10 credits" },
    { row: 8, p: 0.80, probStr: "80%", xStr: "80% chance of 200 credits, 20% chance of 160 credits", yStr: "80% chance of 385 credits, 20% chance of 10 credits" },
    { row: 9, p: 0.90, probStr: "90%", xStr: "90% chance of 200 credits, 10% chance of 160 credits", yStr: "90% chance of 385 credits, 10% chance of 10 credits" },
    { row: 10, p: 1.00, probStr: "100%", xStr: "100% chance of 200 credits", yStr: "100% chance of 385 credits" }
  ],

  // PART 4: 15 Daily Scenarios
  days: [
    {
      day: 1,
      title: "Payday Allocation",
      location: "Central Bank & Treasury",
      buildingType: "bank",
      context: "You have 4,000 credits to place for a 3-day horizon.",
      options: {
        A: { badge: "Sure Outcome", text: "+320 credits for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "60% chance: +800 credits.\n40% chance: −400 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "+800 credits or −400 credits.\nChance of +800: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: true,
      beliefQuestion: "In Option C, how likely do you think the +800 winning outcome is? (0% to 100%)",
      evDiff: "EV(B) - EV(A) = 0 (Risk Neutral Indifference)"
    },
    {
      day: 2,
      title: "Idle Cash Cushion",
      location: "City Safe Deposit Vault",
      buildingType: "vault",
      context: "You have 3,000 credits of idle cash for 3 days.",
      options: {
        A: { badge: "Sure Outcome", text: "Keep it as cash: 0 change, for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "80% chance: +180 credits.\n20% chance: −120 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "+180 credits or −120 credits.\nChance of +180: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: false,
      evDiff: "EV(B) - EV(A) = +120 (Mild Premium)"
    },
    {
      day: 3,
      title: "Sponsor Challenge",
      location: "Plaza Arena Stage",
      buildingType: "arena",
      context: "A sponsor offers an immediate one-time payout. No initial stake needed.",
      options: {
        A: { badge: "Sure Outcome", text: "Receive 300 credits for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "50% chance: 500 credits.\n50% chance: 0 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "500 credits or 0 credits.\nChance of 500: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: true,
      beliefQuestion: "In Option C, how likely do you think the 500 credits outcome is? (0% to 100%)",
      evDiff: "EV(B) - EV(A) = -50 (Detects Pure Risk Seeking)"
    },
    {
      day: 4,
      title: "Lending Window",
      location: "Micro-Credit Guild",
      buildingType: "guild",
      context: "You have 3,000 credits available to lend for 3 days.",
      options: {
        A: { badge: "Sure Outcome", text: "+150 credits for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "85% chance: +360 credits.\n15% chance: −600 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "+360 credits or −600 credits.\nChance of +360: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: false,
      evDiff: "EV(B) - EV(A) = +66 (Small Premium)"
    },
    {
      day: 5,
      title: "The Two Urns (Classic Ellsberg Experiment)",
      location: "Decision Laboratory",
      buildingType: "lab",
      context: "A token will be drawn from an urn. Before the draw, you choose your winning token colour. If the drawn token matches your colour, you win 800 credits; otherwise 0 credits. No stake needed.",
      isEllsberg: true,
      options: {
        A: { badge: "Sure Outcome", text: "Take 300 credits for sure and skip the draw.", tag: "Safe" },
        B: { badge: "Stated Mix (Urn 1)", text: "Draw from Urn 1: Exactly 50 Red and 50 Blue tokens.", tag: "Known Risk" },
        C: { badge: "Unstated Mix (Urn 2)", text: "Draw from Urn 2: 100 Red and Blue tokens, the number of each is not stated (pre-fixed before session).", tag: "Ambiguous" }
      },
      hasBeliefProbe: true,
      beliefQuestion: "In Urn 2, how many of the 100 tokens do you believe match your chosen colour? (0 to 100)",
      evDiff: "EV(B) - EV(A) = +100 (Clean Ellsberg Pair)"
    },
    {
      day: 6,
      title: "Long-Term Venture",
      location: "Startup Incubator Hub",
      buildingType: "tech",
      context: "You have 5,000 credits to place into a venture for 6 days.",
      options: {
        A: { badge: "Sure Outcome", text: "+993 credits for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "60% chance: +2,000 credits.\n40% chance: −1,000 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "+2,000 credits or −1,000 credits.\nChance of +2,000: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: false,
      evDiff: "EV(B) - EV(A) = -193 (Detects Pure Risk Seeking)"
    },
    {
      day: 7,
      title: "Insurance Offer (Loss Domain)",
      location: "Shield Insurance Agency",
      buildingType: "insurance",
      context: "An item you own, unrelated to any market, is at risk of loss. If lost, you lose 1,000 credits.",
      options: {
        A: { badge: "Sure Outcome", text: "Pay 200 credits for insurance. You lose 0 more, for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "No insurance.\n20% chance: lose 1,000 credits.\n80% chance: lose 0 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "No insurance.\nYou lose 1,000 credits or 0 credits.\nChance of losing 1,000: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: false,
      evDiff: "EV(B) - EV(A) = 0 (Fair Insurance)"
    },
    {
      day: 8,
      title: "Market Crash (-40% Sudden Exogenous Shock)",
      location: "Stock Exchange Trading Floor",
      buildingType: "exchange",
      isCrashDay: true,
      context: "Everyone in this study holds the same standard position: 4,000 credits in a broad index fund, plus 2,000 credits in cash.\n\nOVERNIGHT, THE INDEX PLUNGES 40%.\nYour fund position is now worth 2,400 credits (down from 4,000). What happens next in the market is not stated.",
      options: {
        A: { badge: "Liquidate", text: "Sell all of the fund and lock in 2,400 credits in cash.", action: "Sell" },
        B: { badge: "Maintain", text: "Hold the fund. Do nothing.", action: "Hold" },
        C: { badge: "Deploy Cash", text: "Buy more: Use your 2,000 credits of cash to buy more fund units at the lower price.", action: "Buy more" }
      },
      hasBeliefProbe: false
    },
    {
      day: 9,
      title: "Private Placement",
      location: "Angel Investor Lounge",
      buildingType: "lounge",
      context: "You have 4,000 credits to place into a private syndicate for 4 days.",
      options: {
        A: { badge: "Sure Outcome", text: "+240 credits for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "70% chance: +800 credits.\n30% chance: −400 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "+800 credits or −400 credits.\nChance of +800: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: false,
      evDiff: "EV(B) - EV(A) = +200 (Large Risk Premium)"
    },
    {
      day: 10,
      title: "Unexpected Expense (Loss Domain)",
      location: "City Emergency Repair Shop",
      buildingType: "garage",
      context: "An unexpected emergency bill of 2,000 credits must be paid today. You are choosing how to finance it. The total amount you pay is shown.",
      options: {
        A: { badge: "Sure Outcome", text: "Pay a fixed total of 2,100 credits for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "50% chance: pay 1,700 credits.\n50% chance: pay 2,500 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "Pay 1,700 or 2,500 credits.\nChance of 1,700: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: false,
      evDiff: "EV(B) - EV(A) = 0 (Loss Domain Indifference)"
    },
    {
      day: 11,
      title: "Achievement Bonus",
      location: "Civic Hall Auditorium",
      buildingType: "civic",
      context: "You have won an achievement grant. Choose how your award is paid out.",
      options: {
        A: { badge: "Sure Outcome", text: "Receive 2,500 credits for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "50% chance: 4,500 credits.\n50% chance: 1,000 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "4,500 or 1,000 credits.\nChance of 4,500: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: false,
      evDiff: "EV(B) - EV(A) = +250 (Risk Premium, Single Horizon)"
    },
    {
      day: 12,
      title: "Short Contract",
      location: "Freelance Guild Office",
      buildingType: "contract",
      context: "You choose how a 3-day consulting contract pays you. The outcome is decided by one draw for the entire contract.",
      options: {
        A: { badge: "Sure Outcome", text: "Receive 7,000 credits in total for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "50% chance: 10,000 credits.\n50% chance: 3,000 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "10,000 or 3,000 credits.\nChance of 10,000: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: true,
      beliefQuestion: "In Option C, how likely do you think the 10,000 credits outcome is? (0% to 100%)",
      evDiff: "EV(B) - EV(A) = -500 (Detects Pure Risk Seeking)"
    },
    {
      day: 13,
      title: "A Holding That Has Fallen",
      location: "Secondary Asset Market",
      buildingType: "market",
      context: "A financial holding you own has fallen 30%, down from 5,000 credits to 3,500 credits.",
      options: {
        A: { badge: "Sure Outcome", text: "Sell now and receive 3,500 credits for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "Keep it.\n50% chance: worth 5,000 credits.\n50% chance: worth 2,000 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "Swap into a different holding worth 5,000 or 2,000 credits.\nChance of 5,000: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: false,
      evDiff: "EV(B) - EV(A) = 0 (Fair Gamble, Downside to 2000)"
    },
    {
      day: 14,
      title: "Speculation Club (Lottery Domain)",
      location: "Neon Night Arcade & Exchange at the Speculation Club",
      buildingType: "arcade",
      context: "You have 4,000 credits available to place overnight.",
      options: {
        A: { badge: "Sure Outcome", text: "+40 credits for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "10% chance: +1,600 credits.\n90% chance: −100 credits.", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "+1,600 or −100 credits.\nChance of +1,600: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: false,
      evDiff: "EV(B) - EV(A) = +30 (Detects Skewness / Lottery Appetite)"
    },
    {
      day: 15,
      title: "Final Settlement Proposition",
      location: "Payday!",
      buildingType: "penthouse",
      context: "Your final wealth for this game is benchmarked at 10,000 credits. You may keep it or make one final mixed gamble before settlement.",
      options: {
        A: { badge: "Sure Outcome", text: "Keep 10,000 credits for sure.", tag: "Safe" },
        B: { badge: "Stated Chances", text: "50% chance: +4,000 credits (total 14,000).\n50% chance: −2,500 credits (total 7,500).", tag: "Known Risk" },
        C: { badge: "Unstated Chances", text: "+4,000 credits or −2,500 credits.\nChance of +4,000: not stated.", tag: "Ambiguous" }
      },
      hasBeliefProbe: false,
      evDiff: "EV(B) - EV(A) = +750 (Mixed-Gamble Acceptance)"
    }
  ],

  // PART 5: Post-Game Checks & Debrief
  postGame: [
    { id: "E1", label: "How much did you believe the chances stated in the game were real?", type: "select", options: ["1 = Not at all", "2 = Slightly", "3 = Moderately", "4 = Very much", "5 = Completely"] },
    { id: "E2", label: "How much did you believe the \"not stated\" chances were fair (neither rigged against you nor in your favour)?", type: "select", options: ["1 = Very unfavourable (rigged)", "2 = Somewhat unfavourable", "3 = Neutral / fair", "4 = Somewhat favourable", "5 = Very favourable"] },
    { id: "E3", label: "Did you treat the game credits like real money?", type: "select", options: ["1 = Not at all", "2 = Slightly", "3 = Moderately", "4 = Mostly", "5 = Completely"] },
    { id: "E4", label: "How familiar were you with the financial situations described?", type: "select", options: ["1 = Completely unfamiliar", "2 = Slightly familiar", "3 = Moderately familiar", "4 = Familiar", "5 = Highly experienced"] },
    { id: "E5", label: "What decision strategy, if any, did you follow throughout the 15 days?", type: "textarea", placeholder: "Describe how you weighed safe payouts vs stated risks vs unstated odds..." }
  ]
};
