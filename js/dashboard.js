/**
 * Live dashboard for "15 Days of Payday".
 * Polls the Apps Script endpoint (CONFIG.WEBHOOK_URL) and redraws the charts.
 * Authors: Parth Dhodapkar & Joshua Koilpillai
 */
const POLL_MS = 5000;
const KEY_STORAGE = "payday_read_key";
const DAYS = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15]; // Day 8 is the crash, shown separately
const CHOICES = [
  { code: "A", label: "Safe", color: "#3498DB" },
  { code: "B", label: "Known risk", color: "#2ECC71" },
  { code: "C", label: "Ambiguous", color: "#9B59B6" }
];
const COHORT_COLORS = { "Student": "#3498DB", "IT Professional": "#E67E22" };
const S_THRESHOLD = 0.65; // same cut-offs as analyze_results.py
const R_THRESHOLD = 0.35;
const PLOT_CONFIG = { responsive: true, displayModeBar: false };
const PLOT_LAYOUT = {
  template: "plotly_white",
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  margin: { l: 50, r: 16, t: 10, b: 44 },
  font: { family: "system-ui, sans-serif", size: 12 },
  legend: { orientation: "h", y: -0.2 }
};

const isDemo = !CONFIG.WEBHOOK_URL?.trim();

// ── DATA ───────────────────────────────────────────────────────────────────

// Sheets returns everything as strings or numbers. Turn numeric strings into numbers, keep the rest.
function normalize(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = typeof v === "string" && v.trim() !== "" && isFinite(v) ? Number(v) : v;
  }
  return out;
}

function makeDemoRows(n = 40) {
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return Array.from({ length: n }, (_, i) => {
    const row = {
      id: `demo-${i + 1}`,
      cohort: pick(["Student", "IT Professional"]),
      S: rand(0.2, 1), R: rand(0, 1),
      GP: Math.round(rand(0, 100)), AS: Math.round(rand(0, 100)),
      HL_safe_count: Math.floor(rand(2, 9)),
      crashReaction: pick(["Sell", "Hold", "Buy more"]),
      ellsbergToken: pick(["Red", "Blue"])
    };
    for (const d of DAYS) {
      row[`D${d}`] = pick(["A", "B", "C"]);
      row[`rt_D${d}`] = rand(1500, 9000);
    }
    return row;
  });
}

function numbers(rows, field) {
  return rows.map(r => r[field]).filter(v => typeof v === "number" && isFinite(v));
}

function mean(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function countBy(rows, field, order) {
  const counts = Object.fromEntries(order.map(k => [k, 0]));
  for (const r of rows) {
    const v = r[field];
    if (v === "" || v === null || v === undefined) continue;
    counts[v] = (counts[v] || 0) + 1;
  }
  return counts;
}

// ── RENDERING ──────────────────────────────────────────────────────────────

function fmt(v, digits = 1) {
  return v === null ? "–" : v.toFixed(digits);
}

function renderKPIs(rows) {
  const n = rows.length;
  const students = rows.filter(r => r.cohort === "Student").length;
  document.getElementById("kN").textContent = n;
  document.getElementById("kStud").textContent = n ? `${Math.round(100 * students / n)}%` : "–";
  document.getElementById("kGP").textContent = fmt(mean(numbers(rows, "GP")));
  document.getElementById("kAS").textContent = fmt(mean(numbers(rows, "AS")));
  document.getElementById("kS").textContent = fmt(mean(numbers(rows, "S")), 2);
  document.getElementById("kR").textContent = fmt(mean(numbers(rows, "R")), 2);
}

function renderSR(rows) {
  const traces = Object.keys(COHORT_COLORS).map(cohort => {
    const subset = rows.filter(r => r.cohort === cohort);
    return {
      type: "scatter", mode: "markers", name: cohort,
      x: subset.map(r => r.S), y: subset.map(r => r.R),
      text: subset.map(r => `${r.id} · ${cohort}`),
      hovertemplate: "%{text}<br>S = %{x:.2f}<br>R = %{y:.2f}<extra></extra>",
      marker: { color: COHORT_COLORS[cohort], size: 9, opacity: 0.8 }
    };
  });
  const layout = {
    ...PLOT_LAYOUT,
    xaxis: { title: "S (income stability)", range: [0, 1] },
    yaxis: { title: "R (financial responsibility)", range: [0, 1] },
    shapes: [
      { type: "line", x0: S_THRESHOLD, x1: S_THRESHOLD, y0: 0, y1: 1, line: { dash: "dot", color: "#999" } },
      { type: "line", x0: 0, x1: 1, y0: R_THRESHOLD, y1: R_THRESHOLD, line: { dash: "dot", color: "#999" } }
    ]
  };
  Plotly.react("pSR", traces, layout, PLOT_CONFIG);
}

function renderGP(rows) {
  const traces = Object.keys(COHORT_COLORS).map(cohort => ({
    type: "histogram", name: cohort, opacity: 0.65,
    x: numbers(rows.filter(r => r.cohort === cohort), "GP"),
    xbins: { start: 0, end: 100, size: 10 },
    marker: { color: COHORT_COLORS[cohort] }
  }));
  const layout = {
    ...PLOT_LAYOUT, barmode: "overlay",
    xaxis: { title: "Gamble propensity (%)", range: [0, 100] },
    yaxis: { title: "Participants" }
  };
  Plotly.react("pGP", traces, layout, PLOT_CONFIG);
}

function renderDays(rows) {
  const traces = CHOICES.map(choice => ({
    type: "bar", name: `${choice.code} · ${choice.label}`,
    x: DAYS.map(d => `D${d}`),
    y: DAYS.map(d => {
      const answered = rows.filter(r => ["A", "B", "C"].includes(r[`D${d}`])).length;
      const picked = rows.filter(r => r[`D${d}`] === choice.code).length;
      return answered ? (100 * picked) / answered : 0;
    }),
    marker: { color: choice.color }
  }));
  const layout = {
    ...PLOT_LAYOUT, barmode: "stack",
    yaxis: { title: "% of participants", range: [0, 100] }
  };
  Plotly.react("pDays", traces, layout, PLOT_CONFIG);
}

function renderHL(rows) {
  const traces = Object.keys(COHORT_COLORS).map(cohort => ({
    type: "histogram", name: cohort, opacity: 0.65,
    x: numbers(rows.filter(r => r.cohort === cohort), "HL_safe_count"),
    xbins: { start: -0.5, end: 10.5, size: 1 },
    marker: { color: COHORT_COLORS[cohort] }
  }));
  const layout = {
    ...PLOT_LAYOUT, barmode: "overlay",
    xaxis: { title: "Safe choices in Holt-Laury", dtick: 1, range: [-0.5, 10.5] },
    yaxis: { title: "Participants" }
  };
  Plotly.react("pHL", traces, layout, PLOT_CONFIG);
}

function renderBar(id, rows, field, order, xTitle, color) {
  const counts = countBy(rows, field, order);
  const labels = Object.keys(counts);
  Plotly.react(id, [{
    type: "bar", x: labels, y: labels.map(k => counts[k]),
    marker: { color }
  }], {
    ...PLOT_LAYOUT,
    xaxis: { title: xTitle },
    yaxis: { title: "Participants", rangemode: "tozero" }
  }, PLOT_CONFIG);
}

function renderRT(rows) {
  const medians = DAYS.map(d => {
    const m = median(numbers(rows, `rt_D${d}`));
    return m === null ? null : m / 1000;
  });
  Plotly.react("pRT", [{
    type: "scatter", mode: "lines+markers", name: "Median",
    x: DAYS.map(d => `D${d}`), y: medians,
    line: { color: "#2b2b2b" }
  }], {
    ...PLOT_LAYOUT,
    xaxis: { title: "Day" },
    yaxis: { title: "Seconds", rangemode: "tozero" }
  }, PLOT_CONFIG);
}

function renderAll(rows) {
  renderKPIs(rows);
  renderSR(rows);
  renderGP(rows);
  renderDays(rows);
  renderHL(rows);
  renderBar("pCrash", rows, "crashReaction", ["Sell", "Hold", "Buy more"], "Day 8 reaction", "#E67E22");
  renderBar("pEll", rows, "ellsbergToken", ["Red", "Blue"], "Token chosen", "#3498DB");
  renderRT(rows);
}

// ── STATUS & POLLING ───────────────────────────────────────────────────────

function setStatus(kind, text) {
  document.getElementById("dot").className = `dot ${kind}`;
  document.getElementById("statusText").textContent = text;
}

function readKey() {
  try { return sessionStorage.getItem(KEY_STORAGE) || ""; } catch (e) { return ""; }
}

function saveKey(key) {
  try { sessionStorage.setItem(KEY_STORAGE, key); } catch (e) { /* private window: key is kept in memory only */ }
}

let timer = null;

function startLive() {
  poll();
  if (!timer) timer = setInterval(poll, POLL_MS);
}

function stopLive() {
  clearInterval(timer);
  timer = null;
}

async function poll() {
  const key = readKey();
  try {
    const res = await fetch(`${CONFIG.WEBHOOK_URL}?key=${encodeURIComponent(key)}`, { cache: "no-store" });
    const data = await res.json();
    if (!data.ok) {
      if (data.error === "unauthorized") {
        saveKey("");
        stopLive();
        showGate();
        setStatus("err", "Wrong or missing read key");
        return;
      }
      throw new Error(data.error);
    }
    renderAll(data.rows.map(normalize));
    setStatus("live", `Live · updated ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    setStatus("err", `Connection problem, retrying (${err.message})`);
  }
}

function showGate() {
  document.getElementById("gate").style.display = "flex";
  document.getElementById("gateKey").focus();
}

document.getElementById("gateForm").addEventListener("submit", e => {
  e.preventDefault();
  saveKey(document.getElementById("gateKey").value.trim());
  document.getElementById("gate").style.display = "none";
  startLive();
});

if (isDemo) {
  document.getElementById("demoBanner").style.display = "block";
  renderAll(makeDemoRows());
  setStatus("demo", "Demo data (not connected)");
} else if (!readKey()) {
  showGate();
  setStatus("demo", "Waiting for read key");
} else {
  startLive();
}
