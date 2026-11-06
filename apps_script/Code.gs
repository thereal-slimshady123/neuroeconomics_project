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
