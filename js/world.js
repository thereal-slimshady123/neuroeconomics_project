/**
 * World Canvas & 2D Animation Engine (Payday City)
 * Manages player character movement, building rendering, and scenario ambiance.
 */

class GameWorld {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.playerX = 80;
    this.targetX = 240;
    this.isWalking = false;
    this.walkFrame = 0;
    this.lastTime = 0;
    this.characterType = "student"; // "student" or "itProfessional"
    this.currentBuilding = "bank";
    this.isCrashAlert = false;
    this.shakeIntensity = 0;

    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    requestAnimationFrame((t) => this.loop(t));
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.min(rect.width, 900);
    this.canvas.height = 200;
  }

  setCharacter(type) {
    this.characterType = type === "IT professional" ? "itProfessional" : "student";
  }

  setScenario(dayData) {
    this.currentBuilding = dayData.buildingType || "defaultCity";
    this.isCrashAlert = !!dayData.isCrashDay;
    if (this.isCrashAlert) {
      this.shakeIntensity = 12;
    }
    // Walk to the building entrance
    this.playerX = 60;
    this.targetX = this.canvas.width * 0.45;
    this.isWalking = true;
  }

  loop(timestamp) {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.isWalking) {
      const dx = this.targetX - this.playerX;
      if (Math.abs(dx) > 2) {
        this.playerX += Math.sign(dx) * 2.5;
        this.walkFrame = (this.walkFrame + 0.15) % 4;
      } else {
        this.playerX = this.targetX;
        this.isWalking = false;
        this.walkFrame = 0;
      }
    }

    if (this.shakeIntensity > 0) {
      this.shakeIntensity *= 0.92;
      if (this.shakeIntensity < 0.2) this.shakeIntensity = 0;
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    // Screen Shake for Day 8 Market Crash
    if (this.shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(sx, sy);
    }

    // Sky Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (this.isCrashAlert) {
      skyGrad.addColorStop(0, "#450a0a");
      skyGrad.addColorStop(1, "#180505");
    } else {
      skyGrad.addColorStop(0, "#090d16");
      skyGrad.addColorStop(0.7, "#172554");
      skyGrad.addColorStop(1, "#1e1b4b");
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Distant City Skyline Silhouettes
    ctx.fillStyle = this.isCrashAlert ? "#2a0808" : "#0f172a";
    this.drawSkyline(ctx, w, h);

    // Street / Pavement
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, h - 45, w, 45);

    // Road Curb
    ctx.fillStyle = "#475569";
    ctx.fillRect(0, h - 47, w, 2);

    // Street Markings
    ctx.fillStyle = "#facc15";
    ctx.setLineDash([16, 16]);
    ctx.beginPath();
    ctx.moveTo(0, h - 18);
    ctx.lineTo(w, h - 18);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Current Scenario Building on the right
    this.drawBuilding(ctx, w * 0.65, h - 145);

    // Draw NPC at building entrance
    this.drawNPC(ctx, w * 0.58, h - 90);

    // Draw Player Character
    this.drawPlayer(ctx, this.playerX, h - 92);

    ctx.restore();
  }

  drawSkyline(ctx, w, h) {
    const buildings = [
      { x: 20, w: 50, h: 90 },
      { x: 80, w: 40, h: 120 },
      { x: 130, w: 60, h: 75 },
      { x: 210, w: 45, h: 110 },
      { x: 270, w: 70, h: 85 },
      { x: 360, w: 50, h: 130 },
      { x: 430, w: 65, h: 95 },
      { x: 520, w: 55, h: 115 },
      { x: 600, w: 75, h: 80 },
      { x: 700, w: 90, h: 125 }
    ];

    buildings.forEach((b) => {
      ctx.fillRect(b.x, h - 45 - b.h, b.w, b.h);
      // Window pinprick lights
      ctx.fillStyle = this.isCrashAlert ? "#ef4444" : "#fef08a";
      ctx.globalAlpha = 0.4;
      for (let wy = h - 45 - b.h + 10; wy < h - 55; wy += 15) {
        for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 12) {
          if ((wx + wy) % 3 === 0) {
            ctx.fillRect(wx, wy, 4, 6);
          }
        }
      }
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = this.isCrashAlert ? "#2a0808" : "#0f172a";
    });
  }

  drawBuilding(ctx, x, y) {
    const buildingSvgStr = SPRITES.buildings[this.currentBuilding] || SPRITES.buildings.defaultCity;
    const img = this.getCachedSvgImage(this.currentBuilding, buildingSvgStr);
    if (img && img.complete) {
      ctx.drawImage(img, x, y, 140, 120);
    }
  }

  drawNPC(ctx, x, y) {
    const npcKey = this.isCrashAlert ? "npcBrokerPanic" : "npcTeller";
    const npcSvg = SPRITES.characters[npcKey];
    const img = this.getCachedSvgImage(npcKey, npcSvg);
    if (img && img.complete) {
      ctx.drawImage(img, x, y, 40, 55);
    }
  }

  drawPlayer(ctx, x, y) {
    const key = this.characterType;
    const svgStr = SPRITES.characters[key] || SPRITES.characters.student;
    const img = this.getCachedSvgImage(key, svgStr);

    ctx.save();
    // Bobbing walk cycle
    const bob = this.isWalking ? Math.sin(this.walkFrame * Math.PI) * 3 : 0;
    if (img && img.complete) {
      ctx.drawImage(img, x, y + bob, 42, 56);
    }
    ctx.restore();
  }

  getCachedSvgImage(key, svgStr) {
    if (!this._imageCache) this._imageCache = {};
    if (this._imageCache[key]) return this._imageCache[key];

    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    img.src = URL.createObjectURL(blob);
    this._imageCache[key] = img;
    return img;
  }
}
