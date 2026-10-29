/**
 * Neuroeconomics Experiment Configuration: "15 Days of Payday" (v2.0)
 * Authors: Parth Dhodapkar & Joshua Koilpillai
 */
const CONFIG = {
  // Paste your Google Apps Script / Excel PowerAutomate Webhook URL here
  // e.g.: "https://script.google.com/macros/s/AKfycb.../exec"
  WEBHOOK_URL: "https://script.google.com/macros/s/AKfycbwi_lroHuzpcf5eCjDAD_cA8RmGswQEvpzZGQBs4CO2df-jL2LuIaJw-7USeQB-jPZAeg/exec",

  // Shared token the Apps Script checks before saving a row. Visible in the source,
  // so it only stops casual junk submissions. Must match WRITE_TOKEN in apps_script/Code.gs.
  WRITE_TOKEN: "change-me-write-token",

  // Stake scaling parameter k (default = 1.0; see questionnaire_2.md Section 7)
  STAKE_SCALE_K: 1.0,

  // Enable immediate local CSV & JSON backup download on the debrief screen
  ENABLE_LOCAL_BACKUP: true,

  // Pre-fixed unstated probabilities for Option C and Urn 2 (Section 7 design mandate)
  // These are pre-fixed and revealed at debrief
  UNSTATED_CHANCES: {
    D1: 60,   // Matched to Option B (60%)
    D2: 80,   // Matched to Option B (80%)
    D3: 50,   // Matched to Option B (50%)
    D4: 85,   // Matched to Option B (85%)
    D5_URN2_RED: 50, // 50 red, 50 blue
    D6: 60,   // Matched to Option B (60%)
    D7: 20,   // Matched to Option B (20%)
    D8_CRASH: "Fixed -40% shock",
    D9: 70,   // Matched to Option B (70%)
    D10: 50,  // Matched to Option B (50%)
    D11: 50,  // Matched to Option B (50%)
    D12: 50,  // Matched to Option B (50%)
    D13: 50,  // Matched to Option B (50%)
    D14: 10,  // Matched to Option B (10%)
    D15: 50   // Matched to Option B (50%)
  }
};
