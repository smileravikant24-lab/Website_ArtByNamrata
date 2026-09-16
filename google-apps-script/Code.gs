const MESSAGES_SHEET_NAME = 'Messages';
const VISITS_SHEET_NAME = 'Visits';
const LIKES_SHEET_NAME = 'Likes';
const DASHBOARD_SHEET_NAME = 'Dashboard';
const TIMEZONE = 'Asia/Kolkata';

function doPost(event) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    spreadsheet.setSpreadsheetTimeZone(TIMEZONE);
    const data = JSON.parse(event.postData?.contents || '{}');

    // 1. Like Artwork Action
    if (data.type === 'like' || data.action === 'like') {
      return recordLike(spreadsheet, data);
    }

    // 2. Site Visit / Hit Tracker
    if (data.type === 'visit') {
      return recordVisit(spreadsheet, data);
    }

    // 3. Default: Contact Form Message
    return recordMessage(spreadsheet, data);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getFormattedIstNow() {
  const now = new Date();
  return {
    full: Utilities.formatDate(now, TIMEZONE, 'dd-MMM-yyyy hh:mm:ss a'),
    date: Utilities.formatDate(now, TIMEZONE, 'dd-MMM-yyyy'),
    time: Utilities.formatDate(now, TIMEZONE, 'hh:mm:ss a'),
  };
}

function recordLike(spreadsheet, data) {
  const imageId = data.imageId;
  if (!imageId) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: 'Missing imageId' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  let sheet = spreadsheet.getSheetByName(LIKES_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(LIKES_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    const headers = ['Image ID', 'Artwork Title', 'Total Likes', 'Last Liked At (IST)'];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#BE185D');
    headerRange.setFontColor('#F8FAFC');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 200);
  }

  const ist = getFormattedIstNow();
  const lastRow = sheet.getLastRow();
  let foundRow = -1;
  let currentLikes = 0;

  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === imageId) {
        foundRow = i + 2;
        break;
      }
    }
  }

  if (foundRow > 1) {
    currentLikes = Number(sheet.getRange(foundRow, 3).getValue()) || 0;
    currentLikes += 1;
    sheet.getRange(foundRow, 3).setValue(currentLikes);
    sheet.getRange(foundRow, 4).setValue(ist.full);
    if (data.title) sheet.getRange(foundRow, 2).setValue(data.title);
  } else {
    currentLikes = 1;
    sheet.appendRow([imageId, data.title || 'Artwork', 1, ist.full]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, likes: currentLikes }))
    .setMimeType(ContentService.MimeType.JSON);
}

function recordVisit(spreadsheet, data) {
  let sheet = spreadsheet.getSheetByName(VISITS_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(VISITS_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    const headers = [
      'Time (IST)',
      'Date (IST)',
      'Clock Time',
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
    sheet.setColumnWidth(1, 190);
  }

  const ist = getFormattedIstNow();

  sheet.appendRow([
    ist.full,
    ist.date,
    ist.time,
    data.page || '#home',
    data.device || 'Unknown',
    data.browser || '',
    data.referrer || 'Direct',
    data.screen || '',
    data.visitorId || '',
  ]);

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
    sheet.setColumnWidth(1, 190);
  } else if (sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('Phone') === -1) {
    sheet.insertColumnAfter(2);
    sheet.getRange(1, 3).setValue('Phone');
  }

  const ist = getFormattedIstNow();

  sheet.appendRow([
    ist.full,
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

    const todayStr = Utilities.formatDate(new Date(), TIMEZONE, 'dd-MMM-yyyy');
    const metrics = [
      ['Total Hits / Pageviews', '=IFERROR(COUNTA(Visits!A2:A), 0)'],
      ['Total Unique Visitors', '=IFERROR(COUNTUNIQUE(Visits!I2:I), 0)'],
      ['Today\'s Hits', '=IFERROR(COUNTIF(Visits!B2:B, "' + todayStr + '"), 0)'],
      ['Mobile Visitors', '=IFERROR(COUNTIF(Visits!E2:E, "Mobile"), 0)'],
      ['Desktop Visitors', '=IFERROR(COUNTIF(Visits!E2:E, "Desktop"), 0)'],
      ['Instagram Referrals', '=IFERROR(COUNTIF(Visits!G2:G, "*Instagram*"), 0)'],
      ['Google Search Referrals', '=IFERROR(COUNTIF(Visits!G2:G, "*Google*"), 0)'],
      ['Direct Visits', '=IFERROR(COUNTIF(Visits!G2:G, "Direct"), 0)'],
      ['Total Artwork Likes', '=IFERROR(SUM(Likes!C2:C), 0)'],
    ];

    dash.getRange(3, 1, metrics.length, 2).setValues(metrics);
    dash.getRange('A3:A11').setFontWeight('bold').setBackground('#F1F5F9');
    dash.getRange('B3:B11').setFontSize(12).setHorizontalAlignment('center');
  }
}

function doGet(event) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const visitSheet = spreadsheet.getSheetByName(VISITS_SHEET_NAME);
  const totalHits = visitSheet ? Math.max(0, visitSheet.getLastRow() - 1) : 0;

  const likesMap = {};
  const likesSheet = spreadsheet.getSheetByName(LIKES_SHEET_NAME);
  if (likesSheet && likesSheet.getLastRow() > 1) {
    const rows = likesSheet.getRange(2, 1, likesSheet.getLastRow() - 1, 3).getValues();
    for (let i = 0; i < rows.length; i++) {
      const id = rows[i][0];
      const count = Number(rows[i][2]) || 0;
      if (id) likesMap[id] = count;
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      totalHits: totalHits,
      likes: likesMap,
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ Time Tools')
    .addItem('Convert Old GMT Times to IST', 'convertOldGmtToIst')
    .addToUi();
}

function convertOldGmtToIst() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(MESSAGES_SHEET_NAME);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const range = sheet.getRange(2, 1, lastRow - 1, 1);
  const values = range.getValues();

  for (let i = 0; i < values.length; i++) {
    const cellValue = values[i][0];
    if (typeof cellValue === 'string' && cellValue.includes('Z')) {
      const parsedDate = new Date(cellValue);
      if (!isNaN(parsedDate.getTime())) {
        values[i][0] = Utilities.formatDate(parsedDate, TIMEZONE, 'dd-MMM-yyyy hh:mm:ss a');
      }
    } else if (cellValue instanceof Date) {
      values[i][0] = Utilities.formatDate(cellValue, TIMEZONE, 'dd-MMM-yyyy hh:mm:ss a');
    }
  }

  range.setValues(values);
  SpreadsheetApp.getUi().alert('Purane saare GMT timestamps IST (India Time) mein convert ho gaye hain!');
}
