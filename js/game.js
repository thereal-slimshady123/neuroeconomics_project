/**
 * 15 Days to Payday — Experiment Controller (v4.0)
 * Cozy financial study with Jorgan, live-number sliders,
 * theme selection, tailored dialogues, and bank city artwork debrief card.
 */

class ExperimentApp {
  constructor() {
    this.id = "SUBJ_" + Date.now().toString(36).toUpperCase() + "_" +
      Math.random().toString(36).substring(2, 6).toUpperCase();

    // Full data dictionary (matches questionnaire_2.md §6.5)
    this.data = {
      id: this.id, timestamp: new Date().toISOString(), scale_k: CONFIG.STAKE_SCALE_K,
      cohort: "", age: null, gender: "", work_years: 0, invest_exp: "", risk_willingness: 3,
      FL1: "", FL2: "", FL3: "",
      S0: "", S1: 3, S2: 0, S3: 0, S4: "No",
      P: 0, D: 0, Buffer: 0, S_raw: 0, S: 0,
      R1: 0, R2: 0, R3: 0, R4: 0, Dep: 0, Cash: 0, R: 0,
      C1: "", C2: "", C3: "", C4: "",
      HL_choices: [], HL_safe_count: 0,
      dailyChoices: {}, beliefProbes: {},
      ellsbergToken: "Red", crashReaction: null,
      E1: "4", E2: "3", E3: "4", E4: "3", E5: "",
      GP: 0, KR: 0, AS: 0
    };

    this.world = new WorldManager();
    this.currentDayIndex = 0;
    this.dayStartTime = 0;

    // Tailored, engaging dialogues from Jorgan for each specific day
    this.jorganDayDialogues = {
      1: "Are you risk-tolerant because you gamble, or do you gamble because you are risk-tolerant?",
      2: "Meet potential firm. Promising returns, but only in ifs and whens, but not is. Will you risk it?",
      3: "If your heart is wavering, Johnny Joestar, do not risk your money.",
      4: "I am not taking a risk, Skyler, I AM the risk (to my own money)",
      5: "There's no such thing as free money. Just risks that you are willing to take and losses that you are willing to suffer",
      6: "What's 1000 minus 7?",
      7: `<span class="loss-meme-speech" title="Loss"><svg class="loss-meme-svg" width="54" height="54" viewBox="0 0 100 100" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="94" height="94" stroke-width="5" rx="3"/><line x1="50" y1="3" x2="50" y2="97" stroke-width="4"/><line x1="3" y1="50" x2="97" y2="50" stroke-width="4"/><line x1="25" y1="16" x2="25" y2="40" stroke-width="5" stroke-linecap="round"/><line x1="68" y1="16" x2="68" y2="40" stroke-width="5" stroke-linecap="round"/><line x1="84" y1="20" x2="84" y2="38" stroke-width="4.5" stroke-linecap="round"/><line x1="20" y1="64" x2="20" y2="88" stroke-width="4.5" stroke-linecap="round"/><line x1="36" y1="60" x2="36" y2="88" stroke-width="5" stroke-linecap="round"/><line x1="66" y1="64" x2="66" y2="88" stroke-width="4.5" stroke-linecap="round"/><line x1="74" y1="84" x2="92" y2="84" stroke-width="5" stroke-linecap="round"/></svg></span>`,
      8: "The Stock Market Crash! The Stock Market Crash is real!",
      9: "Give me freedom, give me fire, give me low risk returns or I retire.",
      10: "Nobody expects the Spanish Inquisition!",
      11: "I have a plan, Arthur! We hit the 4,500 on this coin toss and we're in Tahiti by sunrise!",
      12: `"Payout is payout. Lesser, greater, middling...it's all the same. If I have to choose between one payout and another, I prefer not to choose at all" - An economically irrational person`,
      13: "This little maneuver is gonna cost us 1,500 credits.",
      14: "The first rule of Speculation Club is: you do not talk about Speculation Club.",
      15: "You hear that, Mr Anderson? That is the sound of inevitability... it is the sound of your payday."
    };

    this.profileDraft = {
      P1: "", P2: "", P3: "Prefer not to say", P4: "",
      P5: 0, P6: "None", P7: 3,
      S0: "Parental allowance", S1: 3, S2: 0, S3: 1,
      S4: "0", R1: 0, R2: "", R3: "",
      R4: 0, FL1: "", FL2: "", FL3: "",
      C1: "", C2: "", C3: "", C4: ""
    };
    this._pinkyLocked = false;

    this.renderConsent();
  }

  // ── Render Helpers ──────────────────────────────────────────────────────────

  panel() { return document.getElementById("rightPanel"); }

  render(html) {
    this.panel().innerHTML = `<div class="stage-transition-in">${html}</div>`;
  }

  fval(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  fnum(id) { return parseFloat(this.fval(id)) || 0; }

  // Cozy Option Pills builder
  makePills(items, groupId) {
    return `
      <div class="option-pills-wrap" id="wrap_${groupId}">
        ${items.map((it, i) => `
          <div class="option-pill" data-val="${it.val}" id="${groupId}_${i}"
               onclick="app.selectPill('${groupId}', '${it.val}')">
            <div class="pill-radio-circle">
              <div class="pill-radio-dot"></div>
            </div>
            <div class="pill-content">
              <span class="pill-title">${it.label}</span>
              ${it.sub ? `<span class="pill-sub">${it.sub}</span>` : ""}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  selectPill(group, val) {
    document.querySelectorAll(`[id^="${group}_"]`).forEach(el => el.classList.remove("selected"));
    const chosen = document.querySelector(`[id^="${group}_"][data-val="${val}"]`);
    if (chosen) chosen.classList.add("selected");
  }

  // Cozy Slider Component with Prominent Live Number Display (Fix for Item 1)
  makeCozySlider(sliderId, min, max, defaultVal, minLabel, maxLabel, hintText = "slide or tap to choose", unit = "") {
    const stepCount = (max - min) + 1;
    let buttonsHtml = "";

    if (stepCount <= 11) {
      buttonsHtml = `
        <div class="slider-step-buttons" id="steps_${sliderId}">
          ${Array.from({ length: stepCount }, (_, i) => min + i).map(n => `
            <button type="button" class="slider-step-btn ${n === defaultVal ? 'active' : ''}"
                    onclick="app.setCozySlider('${sliderId}', ${n}, '${unit}')">
              ${n}
            </button>
          `).join("")}
        </div>
      `;
    }

    return `
      <div class="cozy-slider-box" id="box_${sliderId}">
        <div class="cozy-slider-top-row">
          <span class="cozy-slider-label">Current Selection</span>
          <span class="slider-live-value" id="val_${sliderId}">${defaultVal}${unit}</span>
        </div>
        <div class="slider-track-wrap">
          <input type="range" class="cozy-range-input" id="${sliderId}"
                 min="${min}" max="${max}" value="${defaultVal}"
                 oninput="app.syncCozySlider('${sliderId}', this.value, '${unit}')" />
        </div>
        ${buttonsHtml}
        <div class="slider-legend-row">
          <span>${minLabel}</span>
          <span>${maxLabel}</span>
        </div>
        <p class="slider-hint-script">${hintText}</p>
      </div>
    `;
  }

  setCozySlider(sliderId, val, unit = "") {
    const input = document.getElementById(sliderId);
    if (input) {
      input.value = val;
      this.syncCozySlider(sliderId, val, unit);
    }
  }

  syncCozySlider(sliderId, val, unit = "") {
    const badge = document.getElementById(`val_${sliderId}`);
    if (badge) badge.innerText = `${val}${unit}`;

    const container = document.getElementById(`steps_${sliderId}`);
    if (container) {
      container.querySelectorAll(".slider-step-btn").forEach(btn => {
        btn.classList.toggle("active", btn.innerText.trim() === String(val));
      });
    }
  }

  // ── SCREEN 1: CONSENT & THEME SELECTION ──────────────────────────────────────

  renderConsent() {
    this.world.setScene("intro",
      "Welcome to 15 Days to Payday. I'm Jorgan, and you will be helping me out with my experiment by simulating 15 days of managing your finances. Over the next 15 days, you'll make 15 decisions with real financial trade-offs. Let's see how your decision-making under risk, uncertainty, and safety holds up.",
      0,
      "happy"
    );

    const currentTheme = localStorage.getItem('payday_theme') || 'light';

    this.render(`
      <h1 class="page-title">15 Days to Payday</h1>
      <p class="page-subtitle"></p>

      <!-- Theme Preference Selector (Item 9) -->
      <div class="theme-select-panel">
        <span class="theme-panel-label">Select Your Display Theme:</span>
        <div class="theme-options-group">
          <button type="button" class="theme-pill-choice ${currentTheme === 'light' ? 'selected' : ''}"
                  onclick="setAppTheme('light'); document.querySelectorAll('.theme-pill-choice').forEach(b => b.classList.remove('selected')); this.classList.add('selected');">
            Light Mode
          </button>
          <button type="button" class="theme-pill-choice ${currentTheme === 'dark' ? 'selected' : ''}"
                  onclick="setAppTheme('dark'); document.querySelectorAll('.theme-pill-choice').forEach(b => b.classList.remove('selected')); this.classList.add('selected');">
            Dark Mode
          </button>
          <button type="button" class="theme-pill-choice ${currentTheme === 'system' ? 'selected' : ''}"
                  onclick="setAppTheme('system'); document.querySelectorAll('.theme-pill-choice').forEach(b => b.classList.remove('selected')); this.classList.add('selected');">
            System Match
          </button>
        </div>
      </div>

      <div class="callout">
        <p><strong>Overview:</strong> You will complete a brief background profile, a baseline risk lottery, and then face <strong>15 independent daily financial choices</strong>.</p>
        <p>Each day presents three alternatives: a guaranteed yield (Option A), a stated-probability gamble (Option B), or an unstated-probability gamble (Option C).</p>
        <p>Every day is an independent fresh start—credits do not carry over between days. Choose what you would genuinely prefer under real financial circumstances.</p>
      </div>

      <div class="callout">
        <p>
          • <strong>Duration:</strong> Approximately 12–15 minutes.<br>
          • <strong>Anonymity:</strong> Fully anonymous; data is collected strictly for academic research.<br>
          • <strong>Reward:</strong> Upon completion, you will receive a personalized Behavioral Persona Card that describes you based on the choices you made!
        </p>
      </div>

      <div style="margin: 1.5rem 0;">
        <label style="display:flex;align-items:center;gap:12px;cursor:pointer;font-weight:800;font-size:1.02rem;">
          <input type="checkbox" id="consentCheck" style="width:22px;height:22px;accent-color:var(--accent-orange);cursor:pointer;"
                 onchange="document.getElementById('btnStartProfile').disabled = !this.checked;" />
          I voluntarily agree to take part in this research study.
        </label>
      </div>

      <div class="btn-row">
        <button class="btn-cozy-primary" id="btnStartProfile" disabled onclick="app.renderPinkyPromise()">
          Enter Decision HQ →
        </button>
      </div>
    `);
  }

  // ── SCREEN 1.5: PINKY PROMISE PLEDGE (Item 1) ─────────────────────────────

  renderPinkyPromise() {
    this.world.setScene("intro",
      "Before we start, let's make a promise to be honest - we'd love to see your authentic input!",
      0,
      "happy"
    );

    this.render(`
      <div class="section-tag">Academic Honesty Pledge</div>
      <h2 class="page-title">I Promise to be Honest</h2>
      <p class="page-subtitle">Your authentic instincts are what matter most. No right or wrong answers, just your true intuition.</p>

      <div class="pinky-pledge-card">
        <div class="pinky-canvas-box" id="pinkyCanvasBox" onclick="app.triggerPinkyCross()" title="Tap to cross pinkies">
          ${SPRITES.getPinkyPromiseSVG(this._pinkyLocked)}
        </div>
        <p class="promise-state-text" id="pinkyStateText">
          ${this._pinkyLocked ? "Promise sealed! Loading your profile..." : "Tap the pinkies or the button below to seal your promise!"}
        </p>
        <button type="button" class="btn-cozy-primary" id="btnPinkyPromise" onclick="app.triggerPinkyCross()" style="min-width:260px;margin:0 auto;">
          ${this._pinkyLocked ? "✓ Pinky Promise Sealed" : "I Promise to be Honest"}
        </button>
      </div>
    `);
  }

  triggerPinkyCross() {
    if (this._pinkyLocked) return;
    this._pinkyLocked = true;

    // Gentle audio chime pop (silent fallback if blocked)
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) { }

    const outstretched = document.getElementById("pinkyOutstretchedLayer");
    const locked = document.getElementById("pinkyLockedLayer");

    if (outstretched && locked) {
      // 1. Hands rush toward center
      outstretched.classList.add("pinky-rushing-in");

      // 2. Snap transition at contact point (150ms)
      setTimeout(() => {
        outstretched.classList.remove("is-visible");
        outstretched.classList.add("is-hidden");
        outstretched.classList.remove("pinky-rushing-in");

        locked.classList.remove("is-hidden");
        locked.classList.add("is-visible");
        locked.classList.add("pinky-snapped-in");
      }, 150);
    } else {
      const box = document.getElementById("pinkyCanvasBox");
      if (box) box.innerHTML = SPRITES.getPinkyPromiseSVG(true);
    }

    const txt = document.getElementById("pinkyStateText");
    if (txt) {
      txt.innerText = "Pinky promise sealed! Loading your profile...";
      txt.style.color = "var(--accent-green)";
    }

    const btn = document.getElementById("btnPinkyPromise");
    if (btn) {
      btn.innerText = "✓ Promise Sealed!";
      btn.style.background = "var(--accent-green)";
      btn.style.borderColor = "#14532d";
    }

    setTimeout(() => {
      this.renderProfileStep(1);
    }, 1150);
  }

  // ── SCREEN 2: BITE-SIZED PROFILE STEPPER (Item 2: Max 4 Qs per page, 2/row) ──

  makeStepperHeader(step, totalSteps = 6, label = "") {
    const pct = Math.round((step / totalSteps) * 100);
    return `
      <div class="profile-stepper-header">
        <span class="step-counter-tag">Step ${step} of ${totalSteps} · ${label}</span>
        <div class="stepper-mini-track">
          <div class="stepper-mini-fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }

  saveStepData(step) {
    const d = this.profileDraft;
    if (step === 1) {
      if (document.getElementById("inp_P1")) d.P1 = this.fval("inp_P1");
      if (document.getElementById("inp_P2")) d.P2 = this.fval("inp_P2");
      if (document.getElementById("inp_P3")) d.P3 = this.fval("inp_P3");
      if (document.getElementById("inp_P4")) d.P4 = this.fval("inp_P4");
    } else if (step === 2) {
      if (document.getElementById("inp_P5")) d.P5 = this.fnum("inp_P5");
      if (document.getElementById("inp_P6")) d.P6 = this.fval("inp_P6");
      if (document.getElementById("inp_P7")) d.P7 = parseInt(document.getElementById("inp_P7").value, 10);
    } else if (step === 3) {
      if (document.getElementById("inp_S0")) d.S0 = this.fval("inp_S0");
      if (document.getElementById("inp_S1")) d.S1 = parseInt(document.getElementById("inp_S1").value, 10);
      // min/max attributes don't stop typed values, so clamp to the allowed 0–12 range
      if (document.getElementById("inp_S2")) d.S2 = Math.min(12, Math.max(0, this.fnum("inp_S2")));
      if (document.getElementById("inp_S3")) d.S3 = Math.min(12, Math.max(0, this.fnum("inp_S3")));
    } else if (step === 4) {
      if (document.getElementById("inp_S4")) d.S4 = this.fval("inp_S4");
      if (document.getElementById("inp_R1")) d.R1 = this.fnum("inp_R1");
      if (document.getElementById("inp_R2")) d.R2 = this.fval("inp_R2");
      if (document.getElementById("inp_R3")) d.R3 = this.fval("inp_R3");
    } else if (step === 5) {
      if (document.getElementById("inp_R4")) d.R4 = this.fnum("inp_R4");
    }
  }

  nextProfileStep(step) {
    this.saveStepData(step);
    const d = this.profileDraft;

    if (step === 1) {
      if (!d.P1 || !d.P2 || !d.P4) {
        alert("Please fill in cohort, age, and your field/job role before continuing.");
        return;
      }
    } else if (step === 5) {
      if (!d.FL1 || !d.FL2 || !d.FL3) {
        alert("Please answer all three financial literacy questions (or select 'Don't know').");
        return;
      }
    }

    this.renderProfileStep(step + 1);
  }

  prevProfileStep(step) {
    this.saveStepData(step);
    this.renderProfileStep(step - 1);
  }

  pickStepQuiz(field, val, el) {
    el.closest(".quiz-pill-row").querySelectorAll(".quiz-pill-btn").forEach(e => e.classList.remove("selected"));
    el.classList.add("selected");
    this.profileDraft[field] = val;
  }

  pickStepComp(field, val, el) {
    el.closest(".quiz-pill-row").querySelectorAll(".quiz-pill-btn").forEach(e => e.classList.remove("selected"));
    el.classList.add("selected");
    this.profileDraft[field] = val;
  }

  renderProfileStep(step = 1) {
    const d = this.profileDraft;

    if (step === 1) {
      this.world.setScene("town",
        "Before we start, we'd like to know your profile. All details filled are completely anonymous, so rest assured.",
        0,
        "thinking"
      );

      this.render(`
        ${this.makeStepperHeader(1, 6, "Demographics")}
        <h2 class="page-title">Personal Background</h2>
        <p class="page-subtitle">Helps us contrast financial behaviors across cohorts and backgrounds.</p>

        <div class="form-card-grid">
          <div>
            <label class="field-label">P1. Which cohort best describes you? *</label>
            <select class="cozy-select" id="inp_P1">
              <option value="">Select Cohort...</option>
              <option value="Student" ${d.P1 === "Student" ? "selected" : ""}>Student (Undergraduate / Postgraduate)</option>
              <option value="IT Professional" ${d.P1 === "IT Professional" ? "selected" : ""}>IT Professional (Full-time / Tech worker)</option>
            </select>
          </div>

          <div>
            <label class="field-label">P2. Age (in years) *</label>
            <input type="number" class="cozy-input" id="inp_P2" placeholder="e.g. 21" min="16" max="99" value="${d.P2 || ""}" />
          </div>

          <div>
            <label class="field-label">P3. Gender</label>
            <select class="cozy-select" id="inp_P3">
              <option value="Prefer not to say" ${d.P3 === "Prefer not to say" ? "selected" : ""}>Prefer not to say</option>
              <option value="Male" ${d.P3 === "Male" ? "selected" : ""}>Male</option>
              <option value="Female" ${d.P3 === "Female" ? "selected" : ""}>Female</option>
              <option value="Non-binary / Other" ${d.P3 === "Non-binary / Other" ? "selected" : ""}>Non-binary / Other</option>
            </select>
          </div>

          <div>
            <label class="field-label">P4. Field of study or job role *</label>
            <input type="text" class="cozy-input" id="inp_P4" placeholder="e.g. Computer Science, Analyst..." value="${d.P4 || ""}" />
          </div>
        </div>

        <div class="btn-row">
          <button class="btn-cozy-primary" onclick="app.nextProfileStep(1)">
            Continue to Experience →
          </button>
        </div>
      `);

    } else if (step === 2) {
      this.world.setScene("town",
        "Now let's look at your familiarity with markets and where your general risk comfort sits.",
        0,
        "happy"
      );

      this.render(`
        ${this.makeStepperHeader(2, 6, "Experience")}
        <h2 class="page-title">Work &amp; Investment Experience</h2>
        <p class="page-subtitle">Captures your exposure to career milestones and market instruments.</p>

        <div class="form-card-grid">
          <div>
            <label class="field-label">P5. Years of work experience</label>
            <input type="number" class="cozy-input" id="inp_P5" value="${d.P5}" min="0" max="50" />
          </div>

          <div>
            <label class="field-label">P6. Investment experience</label>
            <select class="cozy-select" id="inp_P6">
              <option value="None" ${d.P6 === "None" ? "selected" : ""}>None</option>
              <option value="Mutual funds / FDs only" ${d.P6 === "Mutual funds / FDs only" ? "selected" : ""}>Mutual funds / Fixed Deposits only</option>
              <option value="Direct stocks / Crypto active" ${d.P6 === "Direct stocks / Crypto active" ? "selected" : ""}>Direct stocks / Crypto active</option>
              <option value="Both traditional and speculative" ${d.P6 === "Both traditional and speculative" ? "selected" : ""}>Both traditional and speculative</option>
            </select>
          </div>

          <div class="form-group-full">
            <label class="field-label">P7. Overall, how willing are you to take financial risks? (1 = Fully safe, 5 = High risk taker)</label>
            ${this.makeCozySlider('inp_P7', 1, 5, d.P7, '1 = Fully Safe', '5 = High Risk', 'slide or tap your comfort level', ' / 5')}
          </div>
        </div>

        <div class="btn-row">
          <button class="btn-cozy-secondary" onclick="app.prevProfileStep(2)">← Back</button>
          <button class="btn-cozy-primary" onclick="app.nextProfileStep(2)">
            Continue to Income Stability →
          </button>
        </div>
      `);

    } else if (step === 3) {
      this.world.setScene("town",
        "Next, income predictability and emergency reserves. Financial cushion dramatically shapes decision making under stress.",
        0,
        "thinking"
      );

      this.render(`
        ${this.makeStepperHeader(3, 6, "Income Stability")}
        <h2 class="page-title">Income Stability &amp; Buffer</h2>
        <p class="page-subtitle">Evaluates cashflow stability and reserve defense against volatility.</p>

        <div class="form-card-grid">
          <div>
            <label class="field-label">S0. Primary income source</label>
            <select class="cozy-select" id="inp_S0">
              <option value="Parental allowance" ${d.S0 === "Parental allowance" ? "selected" : ""}>Parental allowance</option>
              <option value="Scholarship / Stipend" ${d.S0 === "Scholarship / Stipend" ? "selected" : ""}>Scholarship / Stipend</option>
              <option value="Part-time work / Freelance" ${d.S0 === "Part-time work / Freelance" ? "selected" : ""}>Part-time work / Freelance</option>
              <option value="Full-time salary" ${d.S0 === "Full-time salary" ? "selected" : ""}>Full-time salary</option>
              <option value="Other" ${d.S0 === "Other" ? "selected" : ""}>Other</option>
            </select>
          </div>

          <div>
            <label class="field-label">S1. Income Predictability (1–5)</label>
            ${this.makeCozySlider('inp_S1', 1, 5, d.S1, '1 = Unpredictable', '5 = Very Predictable', 'slide predictability', ' / 5')}
          </div>

          <div>
            <label class="field-label">S2. Months income dropped &gt;20% in last 12 months (0–12)</label>
            <input type="number" class="cozy-input" id="inp_S2" value="${d.S2}" min="0" max="12" />
          </div>

          <div>
            <label class="field-label">S3. Emergency savings buffer: Months of expenses covered (0–12)</label>
            <input type="number" class="cozy-input" id="inp_S3" value="${d.S3}" min="0" max="12" />
          </div>
        </div>

        <div class="btn-row">
          <button class="btn-cozy-secondary" onclick="app.prevProfileStep(3)">← Back</button>
          <button class="btn-cozy-primary" onclick="app.nextProfileStep(3)">
            Continue to Financial Commitments →
          </button>
        </div>
      `);

    } else if (step === 4) {
      this.world.setScene("town",
        "Every portfolio has real-life liabilities. Let's record your monthly financial responsibilities.",
        0,
        "happy"
      );

      this.render(`
        ${this.makeStepperHeader(4, 6, "Financial Commitments")}
        <h2 class="page-title">Reserves &amp; Commitments</h2>
        <p class="page-subtitle">Captures external safety nets, dependents, and mandatory recurring expenses.</p>

        <div class="form-card-grid">
          <div>
            <label class="field-label">S4. External support if income stopped tomorrow?</label>
            <select class="cozy-select" id="inp_S4">
              <option value="0" ${d.S4 === "0" ? "selected" : ""}>No — Rely solely on my own savings</option>
              <option value="0.5" ${d.S4 === "0.5" ? "selected" : ""}>Partially — Some help available</option>
              <option value="1" ${d.S4 === "1" ? "selected" : ""}>Yes — Full coverage guaranteed</option>
            </select>
          </div>

          <div>
            <label class="field-label">R1. Financially dependent people (0–10)</label>
            <input type="number" class="cozy-input" id="inp_R1" value="${d.R1}" min="0" max="10" />
          </div>

          <div>
            <label class="field-label">R2. Average monthly income in ₹ (approx.)</label>
            <input type="number" class="cozy-input" id="inp_R2" placeholder="e.g. 15000 or 80000" min="0" value="${d.R2 || ""}" />
          </div>

          <div>
            <label class="field-label">R3. Fixed non-negotiable monthly expenses in ₹</label>
            <input type="number" class="cozy-input" id="inp_R3" placeholder="e.g. 5000 or 30000" min="0" value="${d.R3 || ""}" />
          </div>
        </div>

        <div class="btn-row">
          <button class="btn-cozy-secondary" onclick="app.prevProfileStep(4)">← Back</button>
          <button class="btn-cozy-primary" onclick="app.nextProfileStep(4)">
            Continue to Financial Literacy →
          </button>
        </div>
      `);

    } else if (step === 5) {
      this.world.setScene("lab",
        "Almost done with compliance! 4 quick benchmark questions on debt, compounding interest, inflation, and diversification.",
        0,
        "thinking"
      );

      this.render(`
        ${this.makeStepperHeader(5, 6, "Financial Literacy")}
        <h2 class="page-title">Financial Literacy &amp; Debt</h2>
        <p class="page-subtitle">Standard economic benchmark items. If you are unsure, feel free to choose "Don't know".</p>

        <div class="form-card-grid">
          <div>
            <label class="field-label">R4. Monthly debt repayment / EMIs in ₹ (0 if none)</label>
            <input type="number" class="cozy-input" id="inp_R4" value="${d.R4}" min="0" />
          </div>

          <div class="quiz-box">
            <div class="quiz-title">FL1. ₹1,000 in savings earning 10% per year compounded. After 2 years, you have:</div>
            <div class="quiz-pill-row" id="FL1_opts">
              <button type="button" class="quiz-pill-btn ${d.FL1 === 'More than ₹1,200' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL1','More than ₹1,200',this)">More than ₹1,200</button>
              <button type="button" class="quiz-pill-btn ${d.FL1 === 'Exactly ₹1,200' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL1','Exactly ₹1,200',this)">Exactly ₹1,200</button>
              <button type="button" class="quiz-pill-btn ${d.FL1 === 'Less than ₹1,200' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL1','Less than ₹1,200',this)">Less than ₹1,200</button>
              <button type="button" class="quiz-pill-btn quiz-pill-dont-know ${d.FL1 === 'Don\'t know' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL1','Don\\'t know',this)">Don't know</button>
            </div>
          </div>

          <div class="quiz-box">
            <div class="quiz-title">FL2. Interest rate is 8%, inflation is 5%. After 1 year, your money buys:</div>
            <div class="quiz-pill-row" id="FL2_opts">
              <button type="button" class="quiz-pill-btn ${d.FL2 === 'More than today' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL2','More than today',this)">More than today</button>
              <button type="button" class="quiz-pill-btn ${d.FL2 === 'Exactly the same' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL2','Exactly the same',this)">Exactly the same</button>
              <button type="button" class="quiz-pill-btn ${d.FL2 === 'Less than today' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL2','Less than today',this)">Less than today</button>
              <button type="button" class="quiz-pill-btn quiz-pill-dont-know ${d.FL2 === 'Don\'t know' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL2','Don\\'t know',this)">Don't know</button>
            </div>
          </div>

          <div class="quiz-box">
            <div class="quiz-title">FL3. Buying a single company's stock usually provides a safer return than a diversified mutual fund.</div>
            <div class="quiz-pill-row" id="FL3_opts">
              <button type="button" class="quiz-pill-btn ${d.FL3 === 'True' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL3','True',this)">True</button>
              <button type="button" class="quiz-pill-btn ${d.FL3 === 'False' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL3','False',this)">False</button>
              <button type="button" class="quiz-pill-btn quiz-pill-dont-know ${d.FL3 === 'Don\'t know' ? 'selected' : ''}" onclick="app.pickStepQuiz('FL3','Don\\'t know',this)">Don't know</button>
            </div>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn-cozy-secondary" onclick="app.prevProfileStep(5)">← Back</button>
          <button class="btn-cozy-primary" onclick="app.nextProfileStep(5)">
            Continue to Experiment Rules →
          </button>
        </div>
      `);

    } else if (step === 6) {
      this.world.setScene("lab",
        "Final check! These 4 comprehension items confirm you understand how probabilities and independent days work in this experiment.",
        0,
        "happy"
      );

      this.render(`
        ${this.makeStepperHeader(6, 6, "Rules Comprehension")}
        <h2 class="page-title">Experiment Comprehension &amp; Attention</h2>
        <p class="page-subtitle">Confirms game mechanics before entering the Holt-Laury benchmark lottery.</p>

        <div class="form-card-grid">
          <div class="quiz-box">
            <div class="quiz-title">C1. An option says: "60% chance of 500 CR". Does this mean exactly a 60% probability?</div>
            <div class="quiz-pill-row" id="C1_opts">
              <button type="button" class="quiz-pill-btn ${d.C1 === 'Yes' ? 'selected' : ''}" onclick="app.pickStepComp('C1','Yes',this)">Yes</button>
              <button type="button" class="quiz-pill-btn ${d.C1 === 'No' ? 'selected' : ''}" onclick="app.pickStepComp('C1','No',this)">No</button>
              <button type="button" class="quiz-pill-btn quiz-pill-dont-know ${d.C1 === 'Don\'t know' ? 'selected' : ''}" onclick="app.pickStepComp('C1','Don\\'t know',this)">Don't know</button>
            </div>
          </div>

          <div class="quiz-box">
            <div class="quiz-title">C2. An option says: "Chance not stated". Do you know the exact chance of winning?</div>
            <div class="quiz-pill-row" id="C2_opts">
              <button type="button" class="quiz-pill-btn ${d.C2 === 'Yes' ? 'selected' : ''}" onclick="app.pickStepComp('C2','Yes',this)">Yes</button>
              <button type="button" class="quiz-pill-btn ${d.C2 === 'No' ? 'selected' : ''}" onclick="app.pickStepComp('C2','No',this)">No</button>
              <button type="button" class="quiz-pill-btn quiz-pill-dont-know ${d.C2 === 'Don\'t know' ? 'selected' : ''}" onclick="app.pickStepComp('C2','Don\\'t know',this)">Don't know</button>
            </div>
          </div>

          <div class="quiz-box">
            <div class="quiz-title">C3. If you win credits on Day 1, will you have more credits available on Day 2?</div>
            <div class="quiz-pill-row" id="C3_opts">
              <button type="button" class="quiz-pill-btn ${d.C3 === 'Yes' ? 'selected' : ''}" onclick="app.pickStepComp('C3','Yes',this)">Yes</button>
              <button type="button" class="quiz-pill-btn ${d.C3 === 'No (days are independent)' ? 'selected' : ''}" onclick="app.pickStepComp('C3','No (days are independent)',this)">No (days are independent)</button>
              <button type="button" class="quiz-pill-btn quiz-pill-dont-know ${d.C3 === 'Don\'t know' ? 'selected' : ''}" onclick="app.pickStepComp('C3','Don\\'t know',this)">Don't know</button>
            </div>
          </div>

          <div class="quiz-box">
            <div class="quiz-title">C4. Attention check — to show you are reading carefully, please choose <strong>"Sometimes"</strong>:</div>
            <div class="quiz-pill-row" id="C4_opts">
              <button type="button" class="quiz-pill-btn ${d.C4 === 'Always' ? 'selected' : ''}" onclick="app.pickStepComp('C4','Always',this)">Always</button>
              <button type="button" class="quiz-pill-btn ${d.C4 === 'Never' ? 'selected' : ''}" onclick="app.pickStepComp('C4','Never',this)">Never</button>
              <button type="button" class="quiz-pill-btn ${d.C4 === 'Sometimes' ? 'selected' : ''}" onclick="app.pickStepComp('C4','Sometimes',this)">Sometimes</button>
              <button type="button" class="quiz-pill-btn ${d.C4 === 'Often' ? 'selected' : ''}" onclick="app.pickStepComp('C4','Often',this)">Often</button>
            </div>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn-cozy-secondary" onclick="app.prevProfileStep(6)">← Back</button>
          <button class="btn-cozy-primary" onclick="app.submitProfile()">
            Complete Profile &amp; Enter Risk Benchmark →
          </button>
        </div>
      `);
    }
  }

  renderProfile() {
    this.renderProfileStep(1);
  }

  submitProfile() {
    this.saveStepData(6);
    const d = this.data;
    const p = this.profileDraft;

    if (!p.C1 || !p.C2 || !p.C3 || !p.C4) {
      alert("Please answer all comprehension questions before submitting.");
      return;
    }

    if (p.C4 !== "Sometimes") {
      alert("Attention check failed (C4). Please re-read the questions carefully.");
      return;
    }

    if (p.C1 !== "Yes" || p.C2 !== "No" || p.C3 !== "No (days are independent)") {
      alert("Comprehension check note:\n• Stated percentages are exact.\n• 'Not stated' means odds are pre-set but hidden.\n• Days are independent and credits reset every day.\n\nProceeding to benchmark...");
    }

    // Save profile data into main experiment dataset
    d.cohort = p.P1;
    d.age = parseFloat(p.P2) || 0;
    d.gender = p.P3;
    d.work_years = p.P5;
    d.invest_exp = p.P6;
    d.risk_willingness = p.P7;
    d.FL1 = p.FL1;
    d.FL2 = p.FL2;
    d.FL3 = p.FL3;

    // Income Stability S
    d.S0 = p.S0;
    d.S1 = p.S1;
    d.S2 = p.S2;
    d.S3 = p.S3;
    const s4Val = parseFloat(p.S4) || 0;
    const s4TextMap = { "0": "No", "0.5": "Partially", "1": "Yes" };
    d.S4 = s4TextMap[p.S4] || "No";

    const P = (p.S1 - 1) / 4;
    const D = 1 - p.S2 / 12;
    const B_own = Math.min(1, p.S3 / 12);
    const Buffer = 1 - (1 - B_own) * (1 - s4Val);
    const S_raw = (P + D + Buffer) / 3;
    // Cap S for students at 0.50 to reflect transitory/non-career nature of student
    // stipends/allowances and prevent misclassification into the Unburdened IT quadrant (High S, Low R)
    const S = (d.cohort === "Student") ? Math.min(S_raw, 0.5) : S_raw;
    d.P = +P.toFixed(4); d.D = +D.toFixed(4); d.Buffer = +Buffer.toFixed(4);
    d.S_raw = +S_raw.toFixed(4); d.S = +S.toFixed(4);

    // Financial Responsibility R
    const r1 = p.R1;
    const r2 = parseFloat(p.R2) || 0;
    const r3 = parseFloat(p.R3) || 0;
    const r4 = p.R4;
    d.R1 = r1; d.R2 = r2; d.R3 = r3; d.R4 = r4;
    const Dep = Math.min(1, r1 / 3);
    const Cash = r2 > 0 ? Math.min(1, (r3 + r4) / r2) : 0;
    const R = (Dep + Cash) / 2;
    d.Dep = +Dep.toFixed(4); d.Cash = +Cash.toFixed(4); d.R = +R.toFixed(4);

    d.C1 = p.C1; d.C2 = p.C2; d.C3 = p.C3; d.C4 = p.C4;

    this.renderHoltLaury();
  }

  // ── SCREEN 3: HOLT-LAURY BENCHMARK ─────────────────────────────────────────

  renderHoltLaury() {
    this.world.setScene("town",
      "Time for the benchmark price list. Choose Option X or Option Y for each row.",
      0,
      "happy"
    );

    const rows = EXPERIMENT_DATA.holtLaury.map((r) => `
      <tr class="hl-cozy-row" id="hlrow_${r.row}">
        <td>#${r.row}</td>
        <td>
          <label class="hl-radio-label">
            <input type="radio" name="hl_${r.row}" value="X"
                   onchange="document.getElementById('hlrow_${r.row}').classList.add('hl-chosen')" />
            <span>${r.xStr}</span>
          </label>
        </td>
        <td>
          <label class="hl-radio-label">
            <input type="radio" name="hl_${r.row}" value="Y"
                   onchange="document.getElementById('hlrow_${r.row}').classList.add('hl-chosen')" />
            <span>${r.yStr}</span>
          </label>
        </td>
      </tr>
    `).join("");

    this.render(`
      <div class="section-tag">Step 2 of 4 · Risk Anchor</div>
      <h2 class="page-title">Holt-Laury Benchmark Task</h2>
      <p class="page-subtitle">For each row, choose whether you prefer Lottery X (safer) or Lottery Y (riskier).</p>

      <div style="overflow-x:auto;">
        <table class="hl-cozy-table">
          <thead>
            <tr>
              <th>Row</th>
              <th>Option X (Safer)</th>
              <th>Option Y (Riskier)</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>

      <div class="btn-row">
        <button class="btn-cozy-primary" onclick="app.submitHoltLaury()">
          Launch Day 1 Scenarios →
        </button>
      </div>
    `);
  }

  submitHoltLaury() {
    const choices = [];
    let safeCount = 0;
    for (let r = 1; r <= 10; r++) {
      const selected = document.querySelector(`input[name="hl_${r}"]:checked`);
      if (!selected) {
        alert(`Please make a choice for Row ${r}.`); return;
      }
      choices.push(selected.value);
      if (selected.value === "X") safeCount++;
    }

    this.data.HL_choices = choices;
    this.data.HL_safe_count = safeCount;
    this.currentDayIndex = 0;
    this.renderDay();
  }

  // ── SCREEN 4: DAILY SCENARIOS (Days 1–15) ───────────────────────────────────

  renderDay() {
    const dayData = EXPERIMENT_DATA.days[this.currentDayIndex];
    const dayNum = dayData.day;

    const sceneMap = {
      bank: "bank", vault: "bank", arena: "town",
      guild: "town", lab: "lab", tech: "town",
      insurance: "town", exchange: "crash", lounge: "town",
      garage: "town", civic: "town", contract: "town",
      market: "town", arcade: "arcade", penthouse: "debrief",
    };
    const sceneKey = sceneMap[dayData.buildingType] || "town";

    let mood = "happy";
    if (dayData.isCrashDay) mood = "shocked";
    else if (dayData.isEllsberg) mood = "thinking";

    const dialogueText = this.jorganDayDialogues[dayNum] || `Day ${dayNum}: We're at ${dayData.location}. Review the terms and make your play.`;

    this.world.setScene(
      sceneKey,
      dialogueText,
      dayNum,
      mood
    );

    // Shuffle slot positions
    const keys = ["A", "B", "C"];
    const shuffled = [...keys].sort(() => Math.random() - 0.5);
    this._dayShuffled = shuffled;

    // Crash Day Emergency Alert (No emojis)
    const crashAlert = dayData.isCrashDay ? `
      <div class="crash-emergency-card">
        <div class="crash-tag-box">ALERT</div>
        <div>
          <div class="crash-alert-title">EMERGENCY MARKET SHOCK</div>
          <div class="crash-alert-body">
            Broad market index plummeted <strong>40% overnight</strong>.<br>
            Your fund position: 4,000 → 2,400 credits. Cash held: 2,000 credits.
          </div>
        </div>
      </div>
    ` : "";

    // Ellsberg Urn Token Picker (Day 5, clean text, no emojis)
    const ellsbergPicker = dayData.isEllsberg ? `
      <div style="margin: 1.25rem 0;">
        <p style="font-weight:800;font-size:1rem;margin-bottom:0.6rem;">
          Step 1: Pick your winning token color before making your choice:
        </p>
        <div class="urn-choice-grid">
          <div class="urn-pick-card active-red" id="urnRed" onclick="app.setToken('Red')">
            <div class="urn-indicator-dot dot-red"></div>
            <div class="urn-title">Red Token</div>
            <div class="urn-sub">Your winning color for Urn 1 &amp; Urn 2</div>
          </div>
          <div class="urn-pick-card" id="urnBlue" onclick="app.setToken('Blue')">
            <div class="urn-indicator-dot dot-blue"></div>
            <div class="urn-title">Blue Token</div>
            <div class="urn-sub">Your winning color for Urn 1 &amp; Urn 2</div>
          </div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);font-weight:600;">
          Urn 1: 50 Red + 50 Blue tokens (stated 50%).<br>
          Urn 2: 100 tokens, Red / Blue mix not stated (pre-fixed before study).
        </p>
      </div>
    ` : "";

    // Build the 3 options as cozy cards (Item 5: Framing tags removed to prevent bias)
    const cards = shuffled.map((k, pos) => {
      const opt = dayData.options[k];
      return `
        <div class="daily-option-card" id="optCard_${k}" data-key="${k}" data-pos="${pos + 1}"
             onclick="app.selectOption('${k}', ${pos + 1})">
          <div class="daily-card-top">
            <span class="card-choice-tag">Choice ${pos + 1}</span>
          </div>
          <div class="card-main-title">${opt.text.split("\n")[0]}</div>
          <div class="card-desc-body">${opt.text.split("\n").slice(1).join("<br>") || ""}</div>
        </div>
      `;
    }).join("");

    this.render(`
      <div class="section-tag">Day ${dayNum} of 15 · ${dayData.title}</div>
      <h2 class="page-title">${dayData.location}</h2>

      ${crashAlert}

      <div class="callout">
        ${dayData.context.replace(/\n/g, "<br>")}
      </div>

      ${ellsbergPicker}

      <div class="daily-options-grid" id="optionsGrid">
        ${cards}
      </div>

      <div class="btn-row">
        <button class="btn-cozy-primary" id="btnConfirmChoice" disabled onclick="app.confirmDay()">
          Confirm Choice →
        </button>
      </div>
    `);

    this._selectedKey = null;
    this._selectedPos = null;
    this.dayStartTime = performance.now();
  }

  setToken(color) {
    this.data.ellsbergToken = color;
    document.getElementById("urnRed").classList.toggle("active-red", color === "Red");
    document.getElementById("urnBlue").classList.toggle("active-blue", color === "Blue");
  }

  selectOption(key, pos) {
    document.querySelectorAll(".daily-option-card").forEach(c => c.classList.remove("selected"));
    const card = document.getElementById(`optCard_${key}`);
    if (card) card.classList.add("selected");
    this._selectedKey = key;
    this._selectedPos = pos;
    document.getElementById("btnConfirmChoice").disabled = false;
  }

  confirmDay() {
    const dayData = EXPERIMENT_DATA.days[this.currentDayIndex];
    const dayNum = dayData.day;
    const rt = Math.round(performance.now() - this.dayStartTime);

    if (dayData.isCrashDay) {
      this.data.crashReaction = dayData.options[this._selectedKey].action;
    }

    this.data.dailyChoices[`D${dayNum}`] = {
      choice: this._selectedKey,
      pos: this._selectedPos,
      rt: rt
    };

    if (dayData.hasBeliefProbe) {
      this.renderBeliefProbe(dayNum, dayData.beliefQuestion, dayData.isEllsberg);
    } else {
      this.advanceDay();
    }
  }

  // ── BELIEF PROBE (With Live Percentage Number Readout) ───────────────────────

  renderBeliefProbe(dayNum, question, isEllsberg) {
    const unit = isEllsberg ? " tokens" : "%";

    this.world.setScene("town",
      `Day ${dayNum} Gut Check: When you evaluated this situation, what probability did your intuition truly estimate?`,
      dayNum,
      "thinking"
    );

    this.render(`
      <div class="section-tag">Gut Intuition Probe · Day ${dayNum}</div>
      <h2 class="page-title">What did your intuition say?</h2>
      <p class="page-subtitle">${question}</p>

      ${this.makeCozySlider('probeSlider', 0, 100, 50, `0${unit}`, `100${unit}`, 'slide or tap your gut estimate', unit)}

      <div class="btn-row">
        <button class="btn-cozy-primary" onclick="app.confirmProbe(${dayNum})">
          Save &amp; Continue →
        </button>
      </div>
    `);
  }

  confirmProbe(dayNum) {
    const val = parseInt(document.getElementById("probeSlider").value, 10);
    this.data.beliefProbes[`belief_D${dayNum}`] = val;
    this.advanceDay();
  }

  advanceDay() {
    this.currentDayIndex++;
    if (this.currentDayIndex < 15) {
      this.renderDay();
    } else {
      this.renderPostGame();
    }
  }

  // ── SCREEN 5: POST-GAME EXPERIENCE ─────────────────────────────────────────

  renderPostGame() {
    this.world.setScene("debrief",
      "All 15 days completed! Just 4 quick credibility questions before I reveal the results.",
      16,
      "happy"
    );

    this.render(`
      <div class="section-tag">Study Wrap-Up · Experience</div>
      <h2 class="page-title">Final Reflection</h2>
      <p class="page-subtitle">Your genuine feedback ensures high academic research validity.</p>

      <div class="form-card-grid">
        <div class="form-group-full">
          <label class="field-label">E1. How realistic did the stated chances feel?</label>
          ${this.makeCozySlider('inp_E1', 1, 5, 4, '1 = Not realistic', '5 = Very realistic', 'tap or slide to rate', ' / 5')}
        </div>

        <div class="form-group-full">
          <label class="field-label">E2. Did the 'not stated' options feel fair and untricked?</label>
          ${this.makeCozySlider('inp_E2', 1, 5, 3, '1 = Felt rigged', '5 = Felt very fair', 'tap or slide to rate', ' / 5')}
        </div>

        <div class="form-group-full">
          <label class="field-label">E3. Did you treat credits like real money?</label>
          ${this.makeCozySlider('inp_E3', 1, 5, 4, '1 = Not at all', '5 = Completely', 'tap or slide to rate', ' / 5')}
        </div>

        <div class="form-group-full">
          <label class="field-label">E4. How familiar were you with these financial situations?</label>
          ${this.makeCozySlider('inp_E4', 1, 5, 3, '1 = Unfamiliar', '5 = Highly familiar', 'tap or slide to rate', ' / 5')}
        </div>

        <div class="form-group-full">
          <label class="field-label">E5. What strategy or general approach did you follow?</label>
          <textarea class="cozy-textarea" id="inp_E5"
            placeholder="e.g. I preferred safety whenever stakes were high, but gambled on favorable odds..."></textarea>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn-cozy-primary" onclick="app.submitAll()">
          Reveal My Decision Artwork &amp; Results →
        </button>
      </div>
    `);
  }

  submitAll() {
    this.data.E1 = document.getElementById("inp_E1") ? document.getElementById("inp_E1").value : "4";
    this.data.E2 = document.getElementById("inp_E2") ? document.getElementById("inp_E2").value : "3";
    this.data.E3 = document.getElementById("inp_E3") ? document.getElementById("inp_E3").value : "4";
    this.data.E4 = document.getElementById("inp_E4") ? document.getElementById("inp_E4").value : "3";
    this.data.E5 = this.fval("inp_E5");

    this.calculateMetrics();
    this.transmitData();
    this.renderDebrief();
  }

  // ── METRIC CALCULATIONS ─────────────────────────────────────────────────────

  calculateMetrics() {
    let nA = 0, nB = 0, nC = 0;
    for (let d = 1; d <= 15; d++) {
      if (d === 8) continue; // Day 8 is crisis reaction
      const c = this.data.dailyChoices[`D${d}`]?.choice;
      if (c === "A") nA++;
      else if (c === "B") nB++;
      else if (c === "C") nC++;
    }
    this.data.GP = +((100 * (nB + nC)) / 14).toFixed(1);
    this.data.KR = +((100 * nB) / 14).toFixed(1);
    this.data.AS = (nB + nC) > 0 ? +((100 * nC) / (nB + nC)).toFixed(1) : null;
  }

  // ── PERSONA ARCHETYPE GENERATOR ─────────────────────────────────────────────

  getPersona() {
    const gp = this.data.GP;
    const as = this.data.AS;

    if (gp >= 60 && (as === null || as >= 50)) {
      return {
        title: "THE BOLD RISK TAKER",
        subtitle: "Unconstrained Growth & Ambiguity Embracer",
        tagline: "Thrives under market volatility, pursues asymmetric returns, and navigates incomplete information with high natural conviction.",
        riskLabel: "High Risk Tolerance",
        ambigLabel: "Ambiguity Tolerant"
      };
    } else if (gp >= 60 && as < 50) {
      return {
        title: "THE CALCULATED SPECULATOR",
        subtitle: "Expected-Value Maximizer",
        tagline: "Aggressively pursues high upside when probabilities are fully transparent, but exercises strict discipline when odds are hidden.",
        riskLabel: "Calculated Aggressive",
        ambigLabel: "Prefers Stated Odds"
      };
    } else if (gp <= 30 && (as === null || as < 50)) {
      return {
        title: "THE SAFE STRATEGIST",
        subtitle: "Capital Preservation & Fortress Builder",
        tagline: "Prioritizes financial security, guaranteed cash reserves, and predictable compound interest over uncertain market speculation.",
        riskLabel: "Conservative & Safe",
        ambigLabel: "Ambiguity Averse"
      };
    } else if (gp <= 30 && as >= 50) {
      return {
        title: "THE PRAGMATIC EXPLORER",
        subtitle: "Selective Asymmetry Seeker",
        tagline: "Maintains a conservative core foundation, yet is intuitively drawn toward unique, unstated opportunities when curiosity strikes.",
        riskLabel: "Selective Risk",
        ambigLabel: "Intuitive Explorer"
      };
    } else if (as !== null && as >= 50) {
      return {
        title: "THE AMBIGUITY NAVIGATOR",
        subtitle: "Dynamic & Adaptive Investor",
        tagline: "Possesses a rare comfort with market opacity. Adapts seamlessly whether probabilities are mathematically proven or unstated.",
        riskLabel: "Moderate & Dynamic",
        ambigLabel: "Ambiguity Embracing"
      };
    } else {
      return {
        title: "THE PRUDENT BALANCER",
        subtitle: "Methodical Equilibrium Allocator",
        tagline: "Maintains strict equilibrium between safe yield and calculated risk. Avoids emotional extremes and respects transparent odds.",
        riskLabel: "Balanced Investor",
        ambigLabel: "Transparency Focused"
      };
    }
  }

  // ── SCREEN 6: DEBRIEF & COZY BANK IN CITY CARD (Fix for Item 4) ─────────────

  renderDebrief() {
    const d = this.data;
    const persona = this.getPersona();
    const randomDay = Math.floor(Math.random() * 15) + 1;
    const randomChoice = d.dailyChoices[`D${randomDay}`]?.choice ?? "A";

    this.world.setScene("debrief",
      `The ledger is officially closed. Here is your decision title and custom city bank card: ${persona.title}!`,
      16,
      "proud"
    );

    this.render(`
      <div class="section-tag">Study Complete · Official Debrief</div>
      <h2 class="page-title">Your Decision Profile</h2>
      <p class="page-subtitle">
        Calculated from all 15 independent scenarios. Download your custom card below.
      </p>

      <!-- The Cozy Bank in City Art Card (Item 4) -->
      <div class="reward-art-container">
        <div class="reward-art-card" id="rewardCardEl">
          
          <div class="reward-card-header">
            <div class="reward-archetype-title">${persona.title}</div>
            <div class="reward-archetype-sub">${persona.subtitle}</div>
          </div>

          <div class="reward-art-illustration">
            ${SPRITES.bankCityArt}
          </div>

          <div class="reward-card-body">
            <div class="reward-meta-row">
              <span>Risk: <strong>${persona.riskLabel}</strong></span>
              <span>Uncertainty: <strong>${persona.ambigLabel}</strong></span>
              <span>15/15 Scenarios</span>
            </div>
          </div>

        </div>
      </div>

      <div class="btn-row" style="justify-content:center;margin-bottom:1.8rem;">
        <button class="btn-cozy-primary" onclick="app.downloadArtworkCard()">
          Download Card (.PNG)
        </button>
      </div>

      <!-- Core Research Metrics Summary (Clean, no emojis) -->
      <h3 style="font-size:1.25rem;font-weight:900;margin:1.8rem 0 0.5rem;">Academic Research Metrics</h3>
      <div class="results-stats-row">
        <div class="mini-stat-card">
          <div class="mini-stat-label">Gamble Propensity (GP)</div>
          <div class="mini-stat-val">${d.GP}%</div>
          <div class="mini-stat-sub">14 standard days</div>
        </div>
        <div class="mini-stat-card">
          <div class="mini-stat-label">Known-Risk Share (KR)</div>
          <div class="mini-stat-val">${d.KR}%</div>
          <div class="mini-stat-sub">Stated gamble choice</div>
        </div>
        <div class="mini-stat-card">
          <div class="mini-stat-label">Ambiguity Share (AS)</div>
          <div class="mini-stat-val">${d.AS !== null ? d.AS + "%" : "N/A"}</div>
          <div class="mini-stat-sub">${d.AS !== null ? (d.AS < 50 ? "Averse" : "Tolerant") : "Safe only"}</div>
        </div>
        <div class="mini-stat-card">
          <div class="mini-stat-label">Income Stability (S)</div>
          <div class="mini-stat-val">${d.S}</div>
          <div class="mini-stat-sub">Range [0, 1]</div>
        </div>
        <div class="mini-stat-card">
          <div class="mini-stat-label">Financial Responsibility (R)</div>
          <div class="mini-stat-val">${d.R}</div>
          <div class="mini-stat-sub">Dependents + Cash</div>
        </div>
        <div class="mini-stat-card">
          <div class="mini-stat-label">Holt-Laury Safe Choices</div>
          <div class="mini-stat-val">${d.HL_safe_count} / 10</div>
          <div class="mini-stat-sub">${d.HL_safe_count > 4 ? "Risk Averse" : d.HL_safe_count === 4 ? "Neutral" : "Risk Seeking"}</div>
        </div>
      </div>

      <div class="callout">
        <p><strong>Day 8 Crisis Reaction:</strong> ${d.crashReaction ?? "Held position"}</p>
        <p><strong>Ellsberg Color Chosen:</strong> ${d.ellsbergToken}</p>
        <p><strong>Incentive Lottery Draw:</strong> Day ${randomDay} was randomly drawn for your payoff. Your choice was Option <strong>${randomChoice}</strong>.</p>
      </div>

      <div class="btn-row">
        <button class="btn-cozy-secondary" onclick="app.downloadCSV()">Export Full Dataset (.CSV)</button>
        <button class="btn-cozy-secondary" onclick="app.downloadJSON()">Export Full Dataset (.JSON)</button>
      </div>
    `);
  }

  // ── ARTWORK CARD PNG CANVAS EXPORT (Title + Bank in City Art + Risk/Uncertainty) ──

  downloadArtworkCard() {
    const persona = this.getPersona();
    const d = this.data;

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 820;
    const ctx = canvas.getContext("2d");

    // Outer background
    ctx.fillStyle = "#f5efe6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Card background
    const cx = 60, cy = 60, cw = 780, ch = 700, r = 32;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, r);
    ctx.fillStyle = "#fffdf9";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#2d2621";
    ctx.stroke();

    // Title at Top
    ctx.fillStyle = "#e67e22";
    ctx.font = "900 42px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(persona.title, canvas.width / 2, cy + 70);

    ctx.fillStyle = "#786b5e";
    ctx.font = "bold 20px Nunito, sans-serif";
    ctx.fillText(persona.subtitle.toUpperCase(), canvas.width / 2, cy + 105);

    // Bank in City Illustration in Center
    // Render the vector SVG onto an image and draw onto canvas
    const svgStr = SPRITES.bankCityArt;
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Draw bank illustration
      const artX = cx + 30, artY = cy + 130, artW = cw - 60, artH = 420;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(artX, artY, artW, artH, 20);
      ctx.clip();
      ctx.drawImage(img, artX, artY, artW, artH);
      ctx.restore();

      ctx.beginPath();
      ctx.roundRect(artX, artY, artW, artH, 20);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#2d2621";
      ctx.stroke();

      // Meta info at bottom
      ctx.fillStyle = "#786b5e";
      ctx.font = "bold 20px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`RISK STYLE: ${persona.riskLabel.toUpperCase()}   •   UNCERTAINTY: ${persona.ambigLabel.toUpperCase()}`, canvas.width / 2, cy + 605);

      ctx.font = "bold 16px Nunito, sans-serif";
      ctx.fillText("15 DAYS TO PAYDAY • NEUROECONOMICS DECISION STUDY", canvas.width / 2, cy + 655);

      // Trigger download
      const link = document.createElement("a");
      link.download = `PaydayCity_${persona.title.replace(/\s+/g, '_')}_Artwork.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  // ── CSV & JSON EXPORT ───────────────────────────────────────────────────────

  flatRow() {
    const d = this.data;
    const row = {
      id: d.id, timestamp: d.timestamp, scale_k: d.scale_k,
      cohort: d.cohort, age: d.age, gender: d.gender,
      work_years: d.work_years, invest_exp: d.invest_exp, risk_willingness: d.risk_willingness,
      FL1: d.FL1, FL2: d.FL2, FL3: d.FL3,
      S0: d.S0, S1: d.S1, S2: d.S2, S3: d.S3, S4: d.S4,
      P: d.P, D: d.D, Buffer: d.Buffer, S_raw: d.S_raw ?? d.S, S: d.S,
      R1: d.R1, R2: d.R2, R3: d.R3, R4: d.R4,
      Dep: d.Dep, Cash: d.Cash, R: d.R,
      C1: d.C1, C2: d.C2, C3: d.C3, C4: d.C4,
      HL_safe_count: d.HL_safe_count,
      crashReaction: d.crashReaction,
      ellsbergToken: d.ellsbergToken,
      GP: d.GP, KR: d.KR, AS: d.AS ?? "",
      E1: d.E1, E2: d.E2, E3: d.E3, E4: d.E4, E5: d.E5
    };

    d.HL_choices.forEach((c, i) => { row[`HL${i + 1}`] = c; });

    for (let day = 1; day <= 15; day++) {
      const r = d.dailyChoices[`D${day}`];
      row[`D${day}`] = r?.choice ?? "";
      row[`pos_D${day}`] = r?.pos ?? "";
      row[`rt_D${day}`] = r?.rt ?? "";
    }

    row.belief_D1 = d.beliefProbes.belief_D1 ?? "";
    row.belief_D3 = d.beliefProbes.belief_D3 ?? "";
    row.belief_D5 = d.beliefProbes.belief_D5 ?? "";
    row.belief_D12 = d.beliefProbes.belief_D12 ?? "";

    return row;
  }

  downloadCSV() {
    const flat = this.flatRow();
    const cols = Object.keys(flat);
    const vals = cols.map(k => `"${String(flat[k] ?? "").replace(/"/g, '""')}"`);
    const csv = "data:text/csv;charset=utf-8," + cols.join(",") + "\n" + vals.join(",");
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = `payday_${this.data.id}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  downloadJSON() {
    const j = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.flatRow(), null, 2));
    const a = document.createElement("a");
    a.href = j;
    a.download = `payday_${this.data.id}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  transmitData() {
    const flat = this.flatRow();
    try {
      const arr = JSON.parse(localStorage.getItem("neuroeco_results") || "[]");
      arr.push(flat);
      localStorage.setItem("neuroeco_results", JSON.stringify(arr));
    } catch (e) { console.warn("localStorage save failed:", e); }

    if (CONFIG.WEBHOOK_URL?.trim()) {
      // text/plain keeps the request CORS-safelisted, which no-cors requires.
      // application/json would be rejected by the browser before it is sent.
      fetch(CONFIG.WEBHOOK_URL, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...flat, token: CONFIG.WRITE_TOKEN })
      }).then(() => console.log("Data transmitted to webhook"))
        .catch(e => console.error("Webhook error:", e));
    }
  }

  // ── PRESENTATION / DEVELOPER STAGE SKIPPER ──────────────────────────────────

  devEnsureDummyProfile() {
    const d = this.data;
    if (!d.cohort) d.cohort = "Student";
    if (!d.age) d.age = 22;
    if (!d.gender) d.gender = "Male";
    if (!d.work_years) d.work_years = 1;
    if (!d.invest_exp) d.invest_exp = "Direct stocks / Crypto active";
    if (!d.risk_willingness) d.risk_willingness = 4;
    if (!d.FL1) d.FL1 = "More than ₹1,200";
    if (!d.FL2) d.FL2 = "Less than today";
    if (!d.FL3) d.FL3 = "False";
    if (!d.S0) d.S0 = "Parental allowance";
    if (!d.S1) d.S1 = 4;
    if (!d.S2) d.S2 = 0;
    if (!d.S3) d.S3 = 2;
    if (!d.S4) d.S4 = "Yes";
    d.P = 0.75; d.D = 1.0; d.Buffer = 0.67; d.S_raw = 0.81; d.S = 0.5;
    d.R1 = 0; d.R2 = 20000; d.R3 = 6000; d.R4 = 0;
    d.Dep = 0; d.Cash = 0.3; d.R = 0.15;
    d.C1 = "Yes"; d.C2 = "No"; d.C3 = "No (days are independent)"; d.C4 = "Sometimes";
  }

  devEnsureDummyHL() {
    if (!this.data.HL_choices || this.data.HL_choices.length === 0) {
      this.data.HL_choices = ["X", "X", "X", "X", "Y", "Y", "Y", "Y", "Y", "Y"];
      this.data.HL_safe_count = 4;
    }
  }

  devEnsureDummyDays() {
    this.devEnsureDummyProfile();
    this.devEnsureDummyHL();
    const mockPattern = ["B", "C", "A", "B", "C", "B", "A", "hold", "B", "C", "A", "B", "C", "B", "A"];
    for (let day = 1; day <= 15; day++) {
      if (!this.data.dailyChoices[`D${day}`]) {
        this.data.dailyChoices[`D${day}`] = {
          choice: mockPattern[day - 1] === "hold" ? "B" : mockPattern[day - 1],
          pos: 1,
          rt: 1200 + Math.floor(Math.random() * 800)
        };
      }
    }
    this.data.crashReaction = "hold";
    this.data.ellsbergToken = "Red";
    this.data.beliefProbes.belief_D1 = 55;
    this.data.beliefProbes.belief_D3 = 60;
    this.data.beliefProbes.belief_D5 = 50;
    this.data.beliefProbes.belief_D12 = 45;
    this.data.E1 = "4"; this.data.E2 = "4"; this.data.E3 = "5"; this.data.E4 = "3";
    this.data.E5 = "Balanced between calculated risks and safety buffer.";
  }

  devJumpPinky() {
    this._pinkyLocked = false;
    this.renderPinkyPromise();
  }

  devJumpProfile() {
    this.renderProfileStep(1);
  }

  devJumpHoltLaury() {
    this.devEnsureDummyProfile();
    this.renderHoltLaury();
  }

  devJumpDay(dayNum) {
    this.devEnsureDummyProfile();
    this.devEnsureDummyHL();
    this.currentDayIndex = dayNum - 1;
    this.renderDay();
  }

  devJumpPostGame() {
    this.devEnsureDummyDays();
    this.renderPostGame();
  }

  devJumpResults() {
    this.devEnsureDummyDays();
    this.calculateMetrics();
    this.renderDebrief();
  }
}


// ── BOOT ──────────────────────────────────────────────────────────────────────
let app = null;
window.addEventListener("DOMContentLoaded", () => {
  app = new ExperimentApp();
});
