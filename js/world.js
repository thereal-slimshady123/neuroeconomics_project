/**
 * World Manager:
 * Handles cozy ambient background canvas, scene transitions,
 * Jorgan character animations, and study progress tracking.
 */

class WorldManager {
  constructor() {
    this.bgCanvas  = document.getElementById("bgCanvas");
    this.ctx       = this.bgCanvas ? this.bgCanvas.getContext("2d") : null;
    this.t         = 0;
    this.particles = [];

    if (this.bgCanvas) {
      this.resize();
      window.addEventListener("resize", () => this.resize());
      this.spawnParticles();
      requestAnimationFrame(() => this.loop());
    }
  }

  resize() {
    this.bgCanvas.width  = window.innerWidth;
    this.bgCanvas.height = window.innerHeight;
  }

  spawnParticles() {
    this.particles = [];
    const count = Math.min(50, Math.floor(window.innerWidth / 28));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x:  Math.random() * window.innerWidth,
        y:  Math.random() * window.innerHeight,
        vy: 0.15 + Math.random() * 0.35,
        o:  0.08 + Math.random() * 0.22,
        size: 1.5 + Math.random() * 2,
        color: Math.random() > 0.4 ? "#d97706" : "#f59e0b"
      });
    }
  }

  loop() {
    if (!this.ctx) return;
    const W = this.bgCanvas.width;
    const H = this.bgCanvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, W, H);

    // Warm subtle grid dots
    ctx.fillStyle = "rgba(180, 83, 9, 0.05)";
    const dotSpacing = 48;
    for (let x = dotSpacing / 2; x < W; x += dotSpacing) {
      for (let y = dotSpacing / 2; y < H; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Floating warm golden sparkle motes
    this.particles.forEach(p => {
      p.y -= p.vy;
      if (p.y < -10) {
        p.y = H + 10;
        p.x = Math.random() * W;
      }
      ctx.globalAlpha = p.o * (0.6 + 0.4 * Math.sin(this.t * 0.04 + p.x));
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    this.t++;
    requestAnimationFrame(() => this.loop());
  }

  // Update top stage scene + Jorgan emotion + speech text + trigger pop animation
  setScene(sceneKey, narratorText, dayIndex, mood) {
    const frame = document.getElementById("sceneFrame");
    if (frame && SPRITES.scenes[sceneKey]) {
      frame.innerHTML = SPRITES.scenes[sceneKey];
    }

    // Determine Jorgan's mood if not explicitly passed
    let currentMood = mood;
    if (!currentMood) {
      if (sceneKey === "crash") currentMood = "shocked";
      else if (sceneKey === "debrief") currentMood = "proud";
      else if (sceneKey === "lab" || sceneKey === "arcade") currentMood = "thinking";
      else currentMood = "happy";
    }

    const mascotEl = document.getElementById("mascotCompanion");
    if (mascotEl && SPRITES.getJorgan) {
      mascotEl.innerHTML = SPRITES.getJorgan(currentMood);
    }

    const nt = document.getElementById("narratorText");
    if (nt) nt.innerHTML = narratorText;

    // Trigger pop-up bounce animations
    const stage = document.getElementById("stageSection");
    if (stage) {
      stage.classList.remove("scene-pop-active");
      void stage.offsetWidth;
      stage.classList.add("scene-pop-active");
    }

    const card = document.getElementById("questionnaireCard");
    if (card) {
      card.classList.remove("card-slide-active");
      void card.offsetWidth;
      card.classList.add("card-slide-active");
    }

    this.updateProgress(dayIndex);
  }

  updateProgress(dayIndex) {
    const pct = dayIndex <= 0 ? 0 : Math.min(100, Math.round((dayIndex / 15) * 100));
    const bar = document.getElementById("progressBarInner");
    if (bar) bar.style.width = pct + "%";

    const pill = document.getElementById("dayPill");
    if (pill) {
      if (dayIndex <= 0) {
        pill.innerText = "START";
      } else if (dayIndex <= 15) {
        pill.innerText = `DAY ${dayIndex} / 15`;
      } else {
        pill.innerText = "COMPLETE";
      }
    }
  }
}
