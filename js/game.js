/**
 * Game Controller & Neuroeconomics State Machine
 * Manages experiment phases, randomized trial displays, RT timers,
 * mathematical metric derivations, and data transmission to Webhooks / CSV.
 */

class ExperimentApp {
  constructor() {
    this.participantId = "SUBJ_" + Date.now().toString(36).toUpperCase() + "_" + Math.random().toString(36).substring(2, 6).toUpperCase();
    this.currentPhase = "CONSENT"; // CONSENT, PROFILE, HOLT_LAURY, DAY_INTRO, DAY_DECISION, BELIEF_PROBE, POST_GAME, DEBRIEF
    this.currentDayIndex = 0; // 0 to 14
    this.dayStartTime = 0;

    // Response Data Store
    this.data = {
      id: this.participantId,
      timestamp: new Date().toISOString(),
      scale_k: CONFIG.STAKE_SCALE_K,
      // Profile
      cohort: "",
      age: null,
      gender: "",
      work_years: 0,
      invest_exp: "",
      risk_willingness: 5,
      FL1: "", FL2: "", FL3: "",
      S0: "", S1: 3, S2: 0, S3: 0, S4: "No (0)",
      P: 0, D: 0, Buffer: 0, S: 0,
      R1: 0, R2: 0, R3: 0, R4: 0,
      Dep: 0, Cash: 0, R: 0,
      C1: "", C2: "", C3: "", C4: "",
      // Holt-Laury
      HL_choices: [], // X or Y
      HL_safe_count: 0,
      // Days 1..15
      dailyChoices: {}, // D1..D15: { choice: 'A'|'B'|'C', pos: 1|2|3, rt: ms }
      beliefProbes: {}, // belief_D1, belief_D3, belief_D5, belief_D12
      ellsbergToken: null, // 'Red' or 'Blue'
      crashReaction: null, // 'Sell' | 'Hold' | 'Buy more'
      // Post-game
      E1: "", E2: "", E3: "", E4: "", E5: "",
      // Calculated summary metrics
      GP: 0, KR: 0, AS: 0
    };

    this.world = null;
    this.init();
  }

  init() {
    this.world = new GameWorld("worldCanvas");
    this.renderConsentPhase();
  }

  // --- PHASE 1: CONSENT ---
  renderConsentPhase() {
    const mainEl = document.getElementById("gameContainer");
    mainEl.innerHTML = `
      <div class="card glass-panel fade-in">
        <div class="card-header">
          <div class="badge badge-primary">Neuroeconomics Study</div>
          <h2>${EXPERIMENT_DATA.consent.title}</h2>
          <div class="author-tag">Parth Dhodapkar & Joshua Koilpillai</div>
        </div>
        <div class="card-body">
          <div class="instruction-box">
            ${EXPERIMENT_DATA.consent.instructions.map(inst => `<p>${inst}</p>`).join("")}
          </div>
          <div class="form-check mt-4">
            <input type="checkbox" id="consentAgree" class="checkbox-input" />
            <label for="consentAgree">I have read the instructions and voluntarily agree to take part in this research.</label>
          </div>
        </div>
        <div class="card-footer text-right">
          <button id="btnStartConsent" class="btn btn-primary" disabled>Proceed to Profile →</button>
        </div>
      </div>
    `;

    const chk = document.getElementById("consentAgree");
    const btn = document.getElementById("btnStartConsent");
    chk.addEventListener("change", () => {
      btn.disabled = !chk.checked;
    });
    btn.addEventListener("click", () => {
      this.renderProfilePhase();
    });
  }

  // --- PHASE 2: PRE-GAME PROFILE ---
  renderProfilePhase() {
    const mainEl = document.getElementById("gameContainer");
    mainEl.innerHTML = `
      <div class="card glass-panel fade-in">
        <div class="card-header">
          <div class="badge badge-accent">Part 2 of 5</div>
          <h2>Background & Real-Life Financial Profile</h2>
          <p class="subtitle">Please provide accurate information for your own real-life situation. Data is completely anonymous.</p>
        </div>
        <div class="card-body">
          <form id="profileForm">
            <!-- 2A Controls -->
            <h3 class="section-title">2A. Background & Experience</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Which group describes you best? *</label>
                <select id="input_P1" class="form-control" required>
                  <option value="">-- Select Cohort --</option>
                  <option value="University student">University student</option>
                  <option value="IT professional">IT professional</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Age *</label>
                <input type="number" id="input_P2" class="form-control" min="18" max="99" required placeholder="Years" />
              </div>
              <div class="form-group">
                <label>Gender (optional)</label>
                <select id="input_P3" class="form-control">
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Woman">Woman</option>
                  <option value="Man">Man</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
              <div class="form-group">
                <label>Field of study or work *</label>
                <input type="text" id="input_P4" class="form-control" required placeholder="e.g. Software Dev, Data Science, Finance" />
              </div>
              <div class="form-group">
                <label>Years of full-time IT/work experience (0 if student) *</label>
                <input type="number" id="input_P5" class="form-control" min="0" max="50" value="0" required />
              </div>
              <div class="form-group">
                <label>Investing experience (stocks, mutual funds, crypto, FDs) *</label>
                <select id="input_P6" class="form-control" required>
                  <option value="None">None</option>
                  <option value="Under 1 year">Under 1 year</option>
                  <option value="1–3 years">1–3 years</option>
                  <option value="More than 3 years">More than 3 years</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>General risk willingness: "How willing are you to take risks in financial matters?" (0 to 10)</label>
                <div class="slider-wrapper">
                  <input type="range" id="input_P7" min="0" max="10" value="5" class="slider" />
                  <span id="p7Val" class="slider-val">5 / 10</span>
                </div>
              </div>
            </div>

            <!-- Financial Literacy -->
            <h3 class="section-title mt-4">Financial Literacy Check</h3>
            <div class="form-group">
              <label>${EXPERIMENT_DATA.profile.financialLiteracy[0].question}</label>
              <select id="input_FL1" class="form-control" required>
                <option value="">-- Choose Option --</option>
                ${EXPERIMENT_DATA.profile.financialLiteracy[0].options.map(o => `<option value="${o}">${o}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>${EXPERIMENT_DATA.profile.financialLiteracy[1].question}</label>
              <select id="input_FL2" class="form-control" required>
                <option value="">-- Choose Option --</option>
                ${EXPERIMENT_DATA.profile.financialLiteracy[1].options.map(o => `<option value="${o}">${o}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>${EXPERIMENT_DATA.profile.financialLiteracy[2].question}</label>
              <select id="input_FL3" class="form-control" required>
                <option value="">-- Choose Option --</option>
                ${EXPERIMENT_DATA.profile.financialLiteracy[2].options.map(o => `<option value="${o}">${o}</option>`).join("")}
              </select>
            </div>

            <!-- 2B Income Stability S -->
            <h3 class="section-title mt-4">2B. Real-Life Income Stability (Computes S)</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Main source of monthly money:</label>
                <select id="input_S0" class="form-control">
                  <option value="Salary">Salary</option>
                  <option value="Parental allowance">Parental allowance</option>
                  <option value="Scholarship / stipend">Scholarship / stipend</option>
                  <option value="Part-time / freelance">Part-time / freelance</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <div class="form-group">
                <label>Predictability of monthly money:</label>
                <select id="input_S1" class="form-control">
                  <option value="1">1 = Very unpredictable</option>
                  <option value="2">2 = Somewhat unpredictable</option>
                  <option value="3" selected>3 = Neither</option>
                  <option value="4">4 = Fairly predictable</option>
                  <option value="5">5 = Fully predictable</option>
                </select>
              </div>
              <div class="form-group">
                <label>Recent gaps (months in last 6 months money was late/missing):</label>
                <input type="number" id="input_S2" class="form-control" min="0" max="6" value="0" required />
              </div>
              <div class="form-group">
                <label>Personal liquid runway (months essential costs covered by own savings):</label>
                <input type="number" id="input_S3" class="form-control" min="0" max="100" step="0.5" value="1" required />
              </div>
              <div class="form-group full-width">
                <label>Support backstop: If your money stopped today, could family cover your essentials?</label>
                <select id="input_S4" class="form-control">
                  <option value="0.0">No (0)</option>
                  <option value="0.33">Partly, under 3 months (0.33)</option>
                  <option value="0.67">Mostly, 3+ months (0.67)</option>
                  <option value="1.0" selected>Fully, 3+ months (1.0)</option>
                </select>
              </div>
            </div>

            <!-- 2C Financial Responsibility R -->
            <h3 class="section-title mt-4">2C. Financial Responsibility (Computes R)</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Number of financial dependents reliant on you:</label>
                <input type="number" id="input_R1" class="form-control" min="0" max="20" value="0" required />
              </div>
              <div class="form-group">
                <label>Total personal monthly income or allowance (₹ / currency):</label>
                <input type="number" id="input_R2" class="form-control" min="1" value="25000" required />
              </div>
              <div class="form-group">
                <label>Essential monthly expenses YOU personally pay (rent, food, bills):</label>
                <input type="number" id="input_R3" class="form-control" min="0" value="8000" required />
              </div>
              <div class="form-group">
                <label>Monthly debt, EMIs, or loan repayments YOU pay:</label>
                <input type="number" id="input_R4" class="form-control" min="0" value="0" required />
              </div>
            </div>

            <!-- 2D Comprehension & Attention -->
            <h3 class="section-title mt-4">2D. Comprehension & Attention Verification</h3>
            <div class="form-group">
              <label>1. An option says: "60% chance of +800 credits". Do you know the chance of winning?</label>
              <select id="input_C1" class="form-control" required>
                <option value="">-- Choose --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div class="form-group">
              <label>2. An option says: "Chance not stated". Do you know the chance of winning?</label>
              <select id="input_C2" class="form-control" required>
                <option value="">-- Choose --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div class="form-group">
              <label>3. If you win credits on Day 1, will you have more credits available to use on Day 2?</label>
              <select id="input_C3" class="form-control" required>
                <option value="">-- Choose --</option>
                <option value="Yes">Yes</option>
                <option value="No (days are independent)">No (days are independent)</option>
              </select>
            </div>
            <div class="form-group">
              <label>4. Attention check: To confirm you are reading carefully, please choose "Sometimes":</label>
              <select id="input_C4" class="form-control" required>
                <option value="">-- Choose --</option>
                <option value="Always">Always</option>
                <option value="Never">Never</option>
                <option value="Sometimes">Sometimes</option>
                <option value="Often">Often</option>
              </select>
            </div>

            <div class="text-right mt-4">
              <button type="submit" class="btn btn-primary">Submit Profile & Proceed to Baseline Test →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const p7 = document.getElementById("input_P7");
    const p7Val = document.getElementById("p7Val");
    p7.addEventListener("input", () => {
      p7Val.innerText = `${p7.value} / 10`;
    });

    const form = document.getElementById("profileForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Check attention check C4
      const c4 = document.getElementById("input_C4").value;
      if (c4 !== "Sometimes") {
        alert("Attention check failed. Please read the questions carefully.");
        return;
      }

      // Check comprehension C1-C3
      const c1 = document.getElementById("input_C1").value;
      const c2 = document.getElementById("input_C2").value;
      const c3 = document.getElementById("input_C3").value;
      if (c1 !== "Yes" || c2 !== "No" || c3 !== "No (days are independent)") {
        alert("One or more comprehension answers were incorrect. Remember: days are completely independent, and unstated chances are hidden. Please review and re-submit.");
        return;
      }

      // Record profile data
      this.data.cohort = document.getElementById("input_P1").value;
      this.data.age = parseInt(document.getElementById("input_P2").value, 10);
      this.data.gender = document.getElementById("input_P3").value;
      this.data.work_years = parseInt(document.getElementById("input_P5").value, 10);
      this.data.invest_exp = document.getElementById("input_P6").value;
      this.data.risk_willingness = parseInt(p7.value, 10);

      this.data.FL1 = document.getElementById("input_FL1").value;
      this.data.FL2 = document.getElementById("input_FL2").value;
      this.data.FL3 = document.getElementById("input_FL3").value;

      this.data.S0 = document.getElementById("input_S0").value;
      const s1 = parseInt(document.getElementById("input_S1").value, 10);
      const s2 = parseFloat(document.getElementById("input_S2").value);
      const s3 = parseFloat(document.getElementById("input_S3").value);
      const s4Score = parseFloat(document.getElementById("input_S4").value);
      this.data.S1 = s1;
      this.data.S2 = s2;
      this.data.S3 = s3;
      this.data.S4 = document.getElementById("input_S4").options[document.getElementById("input_S4").selectedIndex].text;

      // Mathematical derivation of S
      const P = (s1 - 1) / 4.0;
      const D = 1.0 - (s2 / 6.0);
      const B_own = Math.min(1.0, s3 / 6.0);
      const B_back = s4Score;
      const Buffer = 1.0 - (1.0 - B_own) * (1.0 - B_back);
      const S = (P + D + Buffer) / 3.0;

      this.data.P = parseFloat(P.toFixed(4));
      this.data.D = parseFloat(D.toFixed(4));
      this.data.Buffer = parseFloat(Buffer.toFixed(4));
      this.data.S = parseFloat(S.toFixed(4));

      // Mathematical derivation of R
      const r1 = parseFloat(document.getElementById("input_R1").value);
      const r2 = parseFloat(document.getElementById("input_R2").value);
      const r3 = parseFloat(document.getElementById("input_R3").value);
      const r4 = parseFloat(document.getElementById("input_R4").value);

      this.data.R1 = r1;
      this.data.R2 = r2;
      this.data.R3 = r3;
      this.data.R4 = r4;

      const Dep = Math.min(1.0, r1 / 3.0);
      const Cash = r2 > 0 ? Math.min(1.0, (r3 + r4) / r2) : 0;
      const R = (Dep + Cash) / 2.0;

      this.data.Dep = parseFloat(Dep.toFixed(4));
      this.data.Cash = parseFloat(Cash.toFixed(4));
      this.data.R = parseFloat(R.toFixed(4));

      this.data.C1 = c1;
      this.data.C2 = c2;
      this.data.C3 = c3;
      this.data.C4 = c4;

      // Set character type in game world
      this.world.setCharacter(this.data.cohort);

      // Advance to Holt-Laury
      this.renderHoltLauryPhase();
    });
  }

  // --- PHASE 3: HOLT-LAURY BASELINE RISK ANCHOR ---
  renderHoltLauryPhase() {
    const mainEl = document.getElementById("gameContainer");
    const rowsHtml = EXPERIMENT_DATA.holtLaury.map((row) => `
      <tr class="hl-row">
        <td class="text-center font-bold">#${row.row}</td>
        <td class="text-center"><span class="badge badge-accent">${row.probStr}</span></td>
        <td>
          <label class="hl-choice-label">
            <input type="radio" name="hl_${row.row}" value="X" required />
            <span class="hl-choice-text"><strong>Option X (Safe):</strong> ${row.xStr}</span>
          </label>
        </td>
        <td>
          <label class="hl-choice-label">
            <input type="radio" name="hl_${row.row}" value="Y" required />
            <span class="hl-choice-text"><strong>Option Y (Risky):</strong> ${row.yStr}</span>
          </label>
        </td>
      </tr>
    `).join("");

    mainEl.innerHTML = `
      <div class="card glass-panel fade-in">
        <div class="card-header">
          <div class="badge badge-accent">Part 3 of 5</div>
          <h2>Baseline Risk Benchmark: 10 Decision Price List</h2>
          <p class="subtitle">For each of the 10 decision rows below, choose which lottery you would prefer: Option X or Option Y.</p>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="hl-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Win Chance</th>
                  <th>Option X (Safe Benchmark)</th>
                  <th>Option Y (Higher Variance)</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
          <div class="text-right mt-4">
            <button id="btnSubmitHL" class="btn btn-primary">Confirm Baseline Choices & Enter Payday City →</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btnSubmitHL").addEventListener("click", () => {
      const choices = [];
      let safeCount = 0;
      for (let i = 1; i <= 10; i++) {
        const sel = document.querySelector(`input[name="hl_${i}"]:checked`);
        if (!sel) {
          alert(`Please select Option X or Option Y for Row #${i}.`);
          return;
        }
        choices.push(sel.value);
        if (sel.value === "X") safeCount++;
      }

      this.data.HL_choices = choices;
      this.data.HL_safe_count = safeCount;

      // Begin Part 4 (Days 1 to 15)
      this.currentDayIndex = 0;
      this.renderDayScenario();
    });
  }

  // --- PHASE 4: 15 DAILY SCENARIOS ---
  renderDayScenario() {
    const dayData = EXPERIMENT_DATA.days[this.currentDayIndex];
    this.world.setScenario(dayData);

    // Shuffle options A, B, C into randomized display positions (1, 2, 3)
    const optionKeys = ["A", "B", "C"];
    const shuffledKeys = [...optionKeys].sort(() => Math.random() - 0.5);

    const mainEl = document.getElementById("gameContainer");

    // Check special scenarios: Day 5 (Ellsberg) or Day 8 (Crash)
    let specialBanner = "";
    if (dayData.isEllsberg) {
      specialBanner = `
        <div class="ellsberg-prompt-box">
          <p><strong>Step 1: Choose your winning token colour:</strong></p>
          <div class="token-selector">
            <label class="token-btn token-red">
              <input type="radio" name="ellsbergToken" value="Red" checked />
              <span>● RED TOKEN</span>
            </label>
            <label class="token-btn token-blue">
              <input type="radio" name="ellsbergToken" value="Blue" />
              <span>● BLUE TOKEN</span>
            </label>
          </div>
          ${SPRITES.props.twoUrnsInteractive()}
        </div>
      `;
    } else if (dayData.isCrashDay) {
      specialBanner = SPRITES.props.crashMonitor;
    }

    const cardsHtml = shuffledKeys.map((key, idx) => {
      const opt = dayData.options[key];
      const positionNumber = idx + 1; // 1, 2, 3
      return `
        <div class="choice-card" data-key="${key}" data-pos="${positionNumber}">
          <div class="choice-card-header">
            <span class="choice-badge badge-${key === 'A' ? 'safe' : key === 'B' ? 'risk' : 'ambiguous'}">${opt.badge}</span>
            <span class="choice-key-indicator">Slot #${positionNumber}</span>
          </div>
          <div class="choice-card-content">
            <p>${opt.text.replace(/\n/g, "<br/>")}</p>
          </div>
          <div class="choice-card-footer">
            <button class="btn btn-choice" onclick="app.selectOption('${key}', ${positionNumber})">
              Choose This Option
            </button>
          </div>
        </div>
      `;
    }).join("");

    mainEl.innerHTML = `
      <div class="card glass-panel fade-in">
        <div class="card-header flex-between">
          <div>
            <div class="badge badge-day">DAY ${dayData.day} OF 15</div>
            <h2 class="scenario-title">${dayData.title}</h2>
            <div class="scenario-loc">📍 Location: ${dayData.location}</div>
          </div>
          <div class="day-tracker">
            <span>Progress</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(dayData.day / 15) * 100}%"></div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="scenario-context-box">
            <p>${dayData.context.replace(/\n/g, "<br/>")}</p>
          </div>
          ${specialBanner}
          <div class="choices-grid mt-4">
            ${cardsHtml}
          </div>
        </div>
      </div>
    `;

    // Start response timer in ms
    this.dayStartTime = performance.now();
  }

  selectOption(chosenKey, shownPosition) {
    const rt = Math.round(performance.now() - this.dayStartTime);
    const dayNum = this.currentDayIndex + 1;
    const dayData = EXPERIMENT_DATA.days[this.currentDayIndex];

    // If Day 5, record chosen token
    if (dayData.isEllsberg) {
      const tokenChoice = document.querySelector('input[name="ellsbergToken"]:checked')?.value || "Red";
      this.data.ellsbergToken = tokenChoice;
    }

    // If Day 8, record crash reaction action
    if (dayData.isCrashDay) {
      this.data.crashReaction = dayData.options[chosenKey].action; // 'Sell' | 'Hold' | 'Buy more'
    }

    // Save trial choice
    this.data.dailyChoices[`D${dayNum}`] = {
      choice: chosenKey, // 'A', 'B', or 'C'
      pos: shownPosition, // 1, 2, or 3
      rt: rt
    };

    // Check if belief probe is required (Days 1, 3, 5, 12)
    if (dayData.hasBeliefProbe) {
      this.renderBeliefProbe(dayNum, dayData.beliefQuestion);
    } else {
      this.advanceToNextDay();
    }
  }

  renderBeliefProbe(dayNum, questionText) {
    const mainEl = document.getElementById("gameContainer");
    mainEl.innerHTML = `
      <div class="card glass-panel fade-in text-center">
        <div class="card-header">
          <div class="badge badge-accent">Post-Choice Belief Probe</div>
          <h2>Day ${dayNum} Probability Assessment</h2>
        </div>
        <div class="card-body">
          <p class="probe-question">${questionText}</p>
          <div class="probe-slider-container">
            <input type="range" id="beliefSlider" min="0" max="100" value="50" class="slider" />
            <div class="probe-display">
              <span id="probeValue" class="probe-number">50%</span>
            </div>
          </div>
          <div class="slider-legend">
            <span>0% (Impossible)</span>
            <span>50% (Equally likely)</span>
            <span>100% (Certain)</span>
          </div>
          <div class="mt-4">
            <button id="btnSubmitProbe" class="btn btn-primary">Confirm Assessment & Proceed →</button>
          </div>
        </div>
      </div>
    `;

    const slider = document.getElementById("beliefSlider");
    const valDisplay = document.getElementById("probeValue");
    slider.addEventListener("input", () => {
      valDisplay.innerText = `${slider.value}%`;
    });

    document.getElementById("btnSubmitProbe").addEventListener("click", () => {
      this.data.beliefProbes[`belief_D${dayNum}`] = parseInt(slider.value, 10);
      this.advanceToNextDay();
    });
  }

  advanceToNextDay() {
    this.currentDayIndex++;
    if (this.currentDayIndex < 15) {
      this.renderDayScenario();
    } else {
      this.renderPostGamePhase();
    }
  }

  // --- PHASE 5: POST-GAME SURVEY & DEBRIEF ---
  renderPostGamePhase() {
    const mainEl = document.getElementById("gameContainer");
    mainEl.innerHTML = `
      <div class="card glass-panel fade-in">
        <div class="card-header">
          <div class="badge badge-accent">Part 5 of 5</div>
          <h2>Post-Game Verification & Credibility</h2>
          <p class="subtitle">Please share your perspective on the decisions made during the 15 days.</p>
        </div>
        <div class="card-body">
          <form id="postGameForm">
            <div class="form-group">
              <label>E1. How much did you believe the chances stated in the game were real?</label>
              <select id="input_E1" class="form-control" required>
                ${EXPERIMENT_DATA.postGame[0].options.map(o => `<option value="${o}">${o}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>E2. How much did you believe the "not stated" chances were fair (neither rigged against you nor in your favour)?</label>
              <select id="input_E2" class="form-control" required>
                ${EXPERIMENT_DATA.postGame[1].options.map(o => `<option value="${o}">${o}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>E3. Did you treat the game credits like real money?</label>
              <select id="input_E3" class="form-control" required>
                ${EXPERIMENT_DATA.postGame[2].options.map(o => `<option value="${o}">${o}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>E4. How familiar were you with the financial situations described?</label>
              <select id="input_E4" class="form-control" required>
                ${EXPERIMENT_DATA.postGame[3].options.map(o => `<option value="${o}">${o}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>E5. What decision strategy, if any, did you follow throughout the 15 days?</label>
              <textarea id="input_E5" class="form-control" rows="3" placeholder="Briefly describe your approach..."></textarea>
            </div>
            <div class="text-right mt-4">
              <button type="submit" class="btn btn-primary">Finalize & Reveal Debrief Results →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById("postGameForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.data.E1 = document.getElementById("input_E1").value;
      this.data.E2 = document.getElementById("input_E2").value;
      this.data.E3 = document.getElementById("input_E3").value;
      this.data.E4 = document.getElementById("input_E4").value;
      this.data.E5 = document.getElementById("input_E5").value;

      this.calculateMetrics();
      this.submitData();
      this.renderDebriefPhase();
    });
  }

  calculateMetrics() {
    // 14 Standard days: Days 1-7 and Days 9-15 (Day 8 is exogenous crash)
    let nA = 0, nB = 0, nC = 0;
    for (let d = 1; d <= 15; d++) {
      if (d === 8) continue;
      const c = this.data.dailyChoices[`D${d}`]?.choice;
      if (c === "A") nA++;
      else if (c === "B") nB++;
      else if (c === "C") nC++;
    }

    const GP = (100.0 * (nB + nC)) / 14.0;
    const KR = (100.0 * nB) / 14.0;
    const AS = (nB + nC) > 0 ? (100.0 * nC) / (nB + nC) : 0;

    this.data.GP = parseFloat(GP.toFixed(2));
    this.data.KR = parseFloat(KR.toFixed(2));
    this.data.AS = parseFloat(AS.toFixed(2));
  }

  submitData() {
    // 1. Save locally in localStorage as foolproof backup
    try {
      const stored = JSON.parse(localStorage.getItem("neuroeconomics_results") || "[]");
      stored.push(this.data);
      localStorage.setItem("neuroeconomics_results", JSON.stringify(stored));
    } catch (err) {
      console.warn("Local storage write failed:", err);
    }

    // 2. Transmit to Google Sheets / Webhook if configured
    if (CONFIG.WEBHOOK_URL && CONFIG.WEBHOOK_URL.trim().length > 0) {
      const flatPayload = this.generateFlatRow();
      fetch(CONFIG.WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors", // Google Apps Script Webhook CORS support
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flatPayload)
      })
      .then(() => console.log("Data successfully posted to webhook."))
      .catch((err) => console.error("Webhook submission error:", err));
    }
  }

  generateFlatRow() {
    const row = {
      id: this.data.id,
      timestamp: this.data.timestamp,
      cohort: this.data.cohort,
      age: this.data.age,
      gender: this.data.gender,
      work_years: this.data.work_years,
      invest_exp: this.data.invest_exp,
      risk_willingness: this.data.risk_willingness,
      FL1: this.data.FL1,
      FL2: this.data.FL2,
      FL3: this.data.FL3,
      S0: this.data.S0,
      S1: this.data.S1,
      S2: this.data.S2,
      S3: this.data.S3,
      S4: this.data.S4,
      P: this.data.P,
      D: this.data.D,
      Buffer: this.data.Buffer,
      S: this.data.S,
      R1: this.data.R1,
      R2: this.data.R2,
      R3: this.data.R3,
      R4: this.data.R4,
      Dep: this.data.Dep,
      Cash: this.data.Cash,
      R: this.data.R,
      C1: this.data.C1,
      C2: this.data.C2,
      C3: this.data.C3,
      C4: this.data.C4,
      HL_safe_count: this.data.HL_safe_count,
      crashReaction: this.data.crashReaction,
      GP: this.data.GP,
      KR: this.data.KR,
      AS: this.data.AS,
      scale_k: this.data.scale_k
    };

    // Add HL choices
    this.data.HL_choices.forEach((c, idx) => {
      row[`HL${idx + 1}`] = c;
    });

    // Add D1..D15 choices, positions, RTs
    for (let d = 1; d <= 15; d++) {
      const dayRes = this.data.dailyChoices[`D${d}`];
      row[`D${d}`] = dayRes ? dayRes.choice : "";
      row[`pos_D${d}`] = dayRes ? dayRes.pos : "";
      row[`rt_D${d}`] = dayRes ? dayRes.rt : "";
    }

    // Add Belief probes
    row.belief_D1 = this.data.beliefProbes.belief_D1 ?? "";
    row.belief_D3 = this.data.beliefProbes.belief_D3 ?? "";
    row.belief_D5 = this.data.beliefProbes.belief_D5 ?? "";
    row.belief_D12 = this.data.beliefProbes.belief_D12 ?? "";

    // Add Post-game
    row.E1 = this.data.E1;
    row.E2 = this.data.E2;
    row.E3 = this.data.E3;
    row.E4 = this.data.E4;
    row.E5 = this.data.E5;

    return row;
  }

  renderDebriefPhase() {
    const mainEl = document.getElementById("gameContainer");

    // Random incentive draw day
    const randomPayDay = Math.floor(Math.random() * 15) + 1;
    const chosenDayChoice = this.data.dailyChoices[`D${randomPayDay}`]?.choice;

    mainEl.innerHTML = `
      <div class="card glass-panel fade-in">
        <div class="card-header text-center">
          <div class="badge badge-primary">Study Complete</div>
          <h2>Participant Debrief & Behavioral Profile</h2>
          <p class="subtitle">Thank you for participating! Here is your calculated behavioral summary and study disclosures.</p>
        </div>
        <div class="card-body">
          <!-- Behavioral Metric Summary Cards -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">Income Stability ($S$)</div>
              <div class="metric-value">${this.data.S}</div>
              <div class="metric-desc">Derived from Predictability, Gaps & Buffer</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Financial Responsibility ($R$)</div>
              <div class="metric-value">${this.data.R}</div>
              <div class="metric-desc">Derived from Dependents & Cashflow commitments</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Gamble Propensity ($GP$)</div>
              <div class="metric-value">${this.data.GP}%</div>
              <div class="metric-desc">Willingness to leave sure outcome</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Ambiguity Share ($AS$)</div>
              <div class="metric-value">${this.data.AS}%</div>
              <div class="metric-desc">${this.data.AS < 50 ? 'Ambiguity Averse (<50%)' : this.data.AS === 50 ? 'Ambiguity Neutral (50%)' : 'Ambiguity Seeking (>50%)'}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Holt-Laury Safe Choices</div>
              <div class="metric-value">${this.data.HL_safe_count} / 10</div>
              <div class="metric-desc">${this.data.HL_safe_count > 4 ? 'Risk Averse (>4)' : this.data.HL_safe_count === 4 ? 'Risk Neutral (=4)' : 'Risk Seeking (<4)'}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Day 8 Crash Reaction</div>
              <div class="metric-value">${this.data.crashReaction || 'N/A'}</div>
              <div class="metric-desc">Reaction to -40% overnight shock</div>
            </div>
          </div>

          <!-- Study Disclosures -->
          <div class="instruction-box mt-4">
            <h4 class="font-bold">Experimental Disclosures:</h4>
            <p>1. <strong>Pre-fixed Unstated Chances:</strong> In accordance with experimental economics protocol, all Option C unstated chances and Urn 2 compositions were pre-fixed before this session (Urn 2 contained exactly 50 Red and 50 Blue tokens; other Option C choices matched Option B base probabilities).</p>
            <p>2. <strong>Incentive Draw:</strong> If incentive payments apply, <strong>Day ${randomPayDay}</strong> was randomly selected for payout settlement. Your selection on Day ${randomPayDay} was <strong>Option ${chosenDayChoice}</strong>.</p>
          </div>

          <!-- Download Backup Buttons -->
          <div class="backup-actions mt-4 text-center">
            <button id="btnDownloadCSV" class="btn btn-primary">📥 Download Your Response Data (.CSV)</button>
            <button id="btnDownloadJSON" class="btn btn-secondary">📥 Download Data (.JSON)</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btnDownloadCSV").addEventListener("click", () => this.downloadCSV());
    document.getElementById("btnDownloadJSON").addEventListener("click", () => this.downloadJSON());
  }

  downloadCSV() {
    const flat = this.generateFlatRow();
    const headers = Object.keys(flat);
    const values = headers.map(h => `"${String(flat[h]).replace(/"/g, '""')}"`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + values.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `neuroeconomics_data_${this.data.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadJSON() {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", `neuroeconomics_data_${this.data.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Global initialization
let app = null;
window.addEventListener("DOMContentLoaded", () => {
  app = new ExperimentApp();
});
