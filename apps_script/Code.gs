/**
 * Google Apps Script backend for "15 Days of Payday".
 *
 * POST (from the game)    -> appends one response as a row in the "Responses" sheet
 * GET  ?key=... (dashboard) -> returns every row as JSON
 *
 * Setup: see README.md, section "Live Data Pipeline".
 * Authors: Parth Dhodapkar & Joshua Koilpillai
 */
const SHEET_NAME = "Responses";
const WRITE_TOKEN = "change-me-write-token"; // must match WRITE_TOKEN in js/config.js
const READ_KEY = "change-me-read-key";       // typed into dashboard.html, never committed

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const row = JSON.parse(e.postData.contents);
    if (row.token !== WRITE_TOKEN) return reply_({ ok: false, error: "bad token" });
    delete row.token;

    const sheet = getSheet_();
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
  if (!e.parameter.key || e.parameter.key !== READ_KEY) {
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
