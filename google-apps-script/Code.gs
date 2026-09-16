const MESSAGES_SHEET_NAME = 'Messages';
const VISITS_SHEET_NAME = 'Visits';
const DASHBOARD_SHEET_NAME = 'Dashboard';

function doPost(event) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(event.postData.contents || '{}');

    // 1. Check if payload is a Site Visit / Hit Tracker
    if (data.type === 'visit') {
      return recordVisit(spreadsheet, data);
    }

    // 2. Default: Contact Form Message
    return recordMessage(spreadsheet, data);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function recordVisit(spreadsheet, data) {
  let sheet = spreadsheet.getSheetByName(VISITS_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(VISITS_SHEET_NAME);
  }

  // Setup headers if sheet is newly created
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp (IST)',
      'Date',
      'Time',
      'Page Section',
      'Device',
      'Browser / OS',
      'Referrer (Source)',
      'Screen Size',
      'Visitor ID',
    ];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1E293B');
    headerRange.setFontColor('#F8FAFC');
    sheet.setFrozenRows(1);
  }

  const now = new Date();
  const istDate = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
  const istTime = Utilities.formatDate(now, 'Asia/Kolkata', 'hh:mm:ss a');
  const istFull = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd hh:mm:ss a');

  sheet.appendRow([
    istFull,
    istDate,
    istTime,
    data.page || '#home',
    data.device || 'Unknown',
    data.browser || '',
    data.referrer || 'Direct',
    data.screen || '',
    data.visitorId || '',
  ]);

  // Ensure Dashboard tab exists for summary metrics
  ensureDashboardSheet(spreadsheet);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, type: 'visit' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function recordMessage(spreadsheet, data) {
  let sheet = spreadsheet.getSheetByName(MESSAGES_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(MESSAGES_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    const headers = ['Submitted at (IST)', 'Name', 'Phone', 'Message', 'Page'];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#0F172A');
    headerRange.setFontColor('#F8FAFC');
    sheet.setFrozenRows(1);
  } else if (sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('Phone') === -1) {
    sheet.insertColumnAfter(2);
    sheet.getRange(1, 3).setValue('Phone');
  }

  const now = new Date();
  const istFull = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd hh:mm:ss a');

  sheet.appendRow([
    istFull,
    data.name || '',
    data.phone || '',
    data.message || '',
    data.page || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, type: 'message' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureDashboardSheet(spreadsheet) {
  let dash = spreadsheet.getSheetByName(DASHBOARD_SHEET_NAME);
  if (!dash) {
    dash = spreadsheet.insertSheet(DASHBOARD_SHEET_NAME, 0);
    dash.setColumnWidth(1, 240);
    dash.setColumnWidth(2, 180);

    // Title
    dash.getRange('A1:B1').merge();
    dash.getRange('A1').setValue('📊 Website Traffic & Hit Analytics');
    dash.getRange('A1').setFontWeight('bold').setFontSize(14).setBackground('#1E293B').setFontColor('#F8FAFC');

    // Formula-based metrics
    const metrics = [
      ['Total Hits / Pageviews', '=IFERROR(COUNTA(Visits!A2:A), 0)'],
      ['Total Unique Visitors', '=IFERROR(COUNTUNIQUE(Visits!I2:I), 0)'],
      ['Today\'s Hits', '=IFERROR(COUNTIF(Visits!B2:B, TEXT(NOW(), "yyyy-mm-dd")), 0)'],
      ['Mobile Visitors', '=IFERROR(COUNTIF(Visits!E2:E, "Mobile"), 0)'],
      ['Desktop Visitors', '=IFERROR(COUNTIF(Visits!E2:E, "Desktop"), 0)'],
      ['Instagram Referrals', '=IFERROR(COUNTIF(Visits!G2:G, "*Instagram*"), 0)'],
      ['Google Search Referrals', '=IFERROR(COUNTIF(Visits!G2:G, "*Google*"), 0)'],
      ['Direct Visits', '=IFERROR(COUNTIF(Visits!G2:G, "Direct"), 0)'],
    ];

    dash.getRange(3, 1, metrics.length, 2).setValues(metrics);
    dash.getRange('A3:A10').setFontWeight('bold').setBackground('#F1F5F9');
    dash.getRange('B3:B10').setFontSize(12).setHorizontalAlignment('center');
  }
}

function doGet(event) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const visitSheet = spreadsheet.getSheetByName(VISITS_SHEET_NAME);
  const totalHits = visitSheet ? Math.max(0, visitSheet.getLastRow() - 1) : 0;

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      totalHits: totalHits,
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
