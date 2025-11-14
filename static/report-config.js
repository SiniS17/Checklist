// Google Apps Script Configuration
// Replace the URL below with your actual Google Apps Script Web App URL
window.REPORT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykMIyZLQ8eEe29eJ-1Ov8nLKWjO2tzJqNzJLmvgaCWMWvWvW4RZM8WQkbfgaCnaE9dgA/exec';

// Instructions:
// 1. Create a Google Apps Script in your Google Sheet (Extensions > Apps Script)
// 2. Copy the code from the setup guide below
// 3. Deploy as Web App: Deploy > New deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the Web App URL and replace 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' above

/*
=== GOOGLE APPS SCRIPT CODE ===
Copy the code below and paste it into your Google Apps Script editor:

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      sheets: sheets.map(s => ({
        name: s.getName(),
        rowCount: s.getLastRow()
      }))
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(data.sheetName);
    
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'ID', 'A/C Registration', 'Date']);
    }
    
    // Add the data
    sheet.appendRow([
      new Date(),
      data.data.id,
      data.data.acRegis,
      data.data.date
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Report added successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/
