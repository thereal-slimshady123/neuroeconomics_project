/**
 * Google Apps Script backend for "15 Days of Payday".
 *
 * POST (from the game)    -> appends one response as a row in the "Responses" sheet
 * GET  ?key=... (dashboard) -> returns every row as JSON
 *
 * Setup: see README.md, section "Live Data Pipeline".
 */
const SHEET_NAME = "Responses";
// WRITE_TOKEN and READ_KEY live in Project Settings > Script Properties (values in your local .env),
// so neither is in this file. WRITE_TOKEN must match WRITE_TOKEN in js/config.js.

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const row = JSON.parse(e.postData.contents);
    const writeToken = PropertiesService.getScriptProperties().getProperty("WRITE_TOKEN");
    if (!writeToken || row.token !== writeToken) return reply_({ ok: false, error: "bad token" });
    delete row.token;

    const sheet = getSheet_();

    // Prevent duplicate entries by checking if the subject ID or timestamp already exists
    if (sheet.getLastRow() > 1) {
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIdx = headers.indexOf("id");
      const tsIdx = headers.indexOf("timestamp");

      const isDup = data.slice(1).some(r => {
        const idMatch = idIdx !== -1 && row.id && r[idIdx] === row.id;
        const tsMatch = tsIdx !== -1 && row.timestamp && r[tsIdx] === row.timestamp;
        return idMatch || tsMatch;
      });

      if (isDup) {
        return reply_({ ok: true, message: "Duplicate submission ignored", id: row.id });
      }
    }

    const headers = ensureHeaders_(sheet, Object.keys(row));
    sheet.appendRow(headers.map(h => toCell_(row[h])));
    return reply_({ ok: true, rows: sheet.getLastRow() - 1 });
  } catch (err) {
    return reply_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  // READ_KEY lives in Project Settings > Script Properties, so it is never in this file.
  const readKey = PropertiesService.getScriptProperties().getProperty("READ_KEY");
  if (!readKey || e.parameter.key !== readKey) {
    return reply_({ ok: false, error: "unauthorized" });
  }
  const values = getSheet_().getDataRange().getValues();
  if (values.length < 2) return reply_({ ok: true, rows: [] });

  const headers = values[0];
  const rows = values.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { if (h) obj[h] = r[i]; });
    return obj;
  });
  return reply_({ ok: true, rows: rows });
}

/**
 * Run once from the Apps Script editor (pick "recomputeScores", press Run) to rewrite the stored
 * P, D, Buffer, S, S_raw, Dep, Cash, R and SR_Quadrant columns for EVERY row with the current
 * formulas, so the sheet matches analyze_results.py. Run it again after editing any S1-S4 / R1-R4 answer.
 * It only reads the answer columns and only writes the score columns.
 */
function recomputeScores() {
  const sheet = getSheet_();
  const headers = ensureHeaders_(sheet, ["S_raw", "SR_Quadrant"]);
  const n = sheet.getLastRow() - 1;
  if (n < 1) return;
  const data = sheet.getRange(2, 1, n, headers.length).getValues();
  const col = name => headers.indexOf(name);
  const num = v => (v === "" || v === null || isNaN(Number(v))) ? NaN : Number(v);
  const s4Map = { "No": 0, "Partially": 0.5, "Yes": 1 };
  const r4 = x => Math.round(x * 10000) / 10000;

  data.forEach(row => {
    const s1 = num(row[col("S1")]), s2 = num(row[col("S2")]), s3 = num(row[col("S3")]);
    const s4raw = String(row[col("S4")]).trim();
    const s4 = s4raw in s4Map ? s4Map[s4raw] : num(s4raw);
    const R1 = num(row[col("R1")]), R2 = num(row[col("R2")]), R3 = num(row[col("R3")]), R4 = num(row[col("R4")]);
    if ([s1, s2, s3, s4, R1, R2, R3, R4].some(isNaN)) return;  // incomplete row: leave as is

    const P = (s1 - 1) / 4;
    const D = 1 - s2 / 12;
    const Buffer = 1 - (1 - Math.min(1, s3 / 12)) * (1 - s4);
    const S_raw = (P + D + Buffer) / 3;
    const isStudent = String(row[col("cohort")]).toLowerCase().indexOf("student") !== -1;
    const S = isStudent ? Math.min(S_raw, 0.5) : S_raw;
    const Dep = R1 > 0 ? Math.min(1, 0.7 + 0.15 * (R1 - 1)) : 0;
    const Cash = R2 > 0 ? Math.min(1, (R3 + R4) / R2) : 0;
    const R = (Dep + Cash) / 2;
    // Same cut-offs as analyze_results.py: high S is ABOVE 0.5 (students are capped at exactly 0.5).
    const highS = S > 0.5, highR = R >= 0.35;
    const quad = highS ? (highR ? "High S, High R (Committed IT)" : "High S, Low R (Unburdened IT)")
                       : (highR ? "Low S, High R (Working Student)" : "Low S, Low R (Supported Student)");

    const out = { P: r4(P), D: r4(D), Buffer: r4(Buffer), S: r4(S), S_raw: r4(S_raw),
                  Dep: r4(Dep), Cash: r4(Cash), R: r4(R), SR_Quadrant: quad };
    Object.keys(out).forEach(k => { if (col(k) !== -1) row[col(k)] = out[k]; });
  });
  sheet.getRange(2, 1, n, headers.length).setValues(data);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

// Adds a header column for any new field, so the sheet grows with the data dictionary.
function ensureHeaders_(sheet, keys) {
  let headers = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    : [];
  const missing = keys.filter(k => !headers.includes(k));
  if (missing.length > 0) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    headers = headers.concat(missing);
  }
  return headers;
}

function toCell_(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
