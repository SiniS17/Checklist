// Google Apps Script Configuration
// Replace the URL below with your actual Google Apps Script Web App URL
window.REPORT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAUqVoRRl1CI_WwHz70l9Ry6lyqQlsM_8qX1EJaoy11UbA7EQ-sCCO5cKFDyzUFVgG/exec';

// Replace with your Google Sheet URL (the actual spreadsheet where data is stored)
window.GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1vRhQHTMpd3eKHHJbcUl5BLyoUynUeMtlAW1gZ2jC-6E/edit';

// Instructions:
// 1. Create a Google Apps Script in your Google Sheet (Extensions > Apps Script)
// 2. Copy the code from the setup guide below
// 3. Deploy as Web App: Deploy > New deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the Web App URL and replace REPORT_SCRIPT_URL above
// 5. Copy your Google Sheet URL and replace GOOGLE_SHEET_URL above

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
    
    // Parse the submit time
    const submitDate = new Date(data.data.submitTime);
    const year = submitDate.getFullYear().toString();
    
    // Get or create sheet for the current year
    let sheet = ss.getSheetByName(year);
    if (!sheet) {
      sheet = ss.insertSheet(year);
    }
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Day', 'Month', 'Year', 'Time', 'ID', 'A/C REGIS', 'CHECKLIST', 'TASK DONE']);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setNumberFormat('@'); // Format headers as text
      
      // Set column widths
      sheet.setColumnWidth(1, 60);  // Day
      sheet.setColumnWidth(2, 80);  // Month
      sheet.setColumnWidth(3, 60);  // Year
      sheet.setColumnWidth(4, 80);  // Time
      sheet.setColumnWidth(5, 100); // ID
      sheet.setColumnWidth(6, 120); // A/C REGIS
      sheet.setColumnWidth(7, 150); // CHECKLIST
      sheet.setColumnWidth(8, 100); // TASK DONE
      
      // Format entire columns as text to prevent future misinterpretation
      const allColumnsRange = sheet.getRange(2, 1, 1000, 8);
      allColumnsRange.setNumberFormat('@');
    }
    
    // Format date and time as strings
    const day = submitDate.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[submitDate.getMonth()];
    const hours = submitDate.getHours().toString().padStart(2, '0');
    const minutes = submitDate.getMinutes().toString().padStart(2, '0');
    const time = hours + ':' + minutes;
    
    // Add apostrophe prefix to force text interpretation for numeric-looking values
    const taskDone = "'" + data.data.progressCompleted + '/' + data.data.progressTotal;
    
    // Add the data (all text fields in uppercase)
    // Use appendRow first to get the row
    const newRow = sheet.getLastRow() + 1;
    sheet.appendRow([
      day,
      month,
      year,
      time,
      data.data.id.toUpperCase(),
      data.data.acRegis.toUpperCase(),
      data.data.activeTab.toUpperCase(),
      data.data.progressCompleted + '/' + data.data.progressTotal
    ]);
    
    // Format entire row as plain text to prevent misinterpretation
    const range = sheet.getRange(newRow, 1, 1, 8);
    range.setNumberFormat('@'); // '@' means plain text format
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Report added successfully to ' + year + ' sheet'
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
