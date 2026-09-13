const SHEET_NAME = 'Messages';

function doPost(event) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  const data = JSON.parse(event.postData.contents || '{}');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Submitted at', 'Name', 'Phone', 'Message', 'Page']);
  } else if (sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('Phone') === -1) {
    sheet.insertColumnAfter(2);
    sheet.getRange(1, 3).setValue('Phone');
  }

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || '',
    data.phone || '',
    data.message || '',
    data.page || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
