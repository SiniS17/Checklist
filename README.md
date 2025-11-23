# ✈️ Aircraft Checklist Web Application

A modern, mobile-friendly checklist application for aircraft maintenance procedures with progress tracking and Google Sheets integration.

## 🌟 Features

- **Sequential Checklist System**: Checkboxes unlock progressively as tasks are completed
- **Multiple Sheets**: Navigate between different checklist sections (Engine Start, Shutdown, etc.)
- **Mobile-Optimized**: Responsive design with hamburger menu and touch-friendly interface
- **Progress Tracking**: Real-time progress monitoring for active checklist
- **Report Submission**: Automatic report generation to Google Sheets
- **User Session**: Login system with ID and A/C Registration tracking
- **Visual Feedback**: Strike-through completed tasks, hover effects, disabled state indicators
- **Excel Import**: Parses Excel (.xlsx) files with merged cells and formatting support

## 📋 Prerequisites

- Python 3.7+
- Flask
- openpyxl
- Google Account (for Google Sheets integration)

## 🚀 Installation

1. **Clone or download the project**
   ```bash
   cd your-project-folder
   ```

2. **Install dependencies**
   ```bash
   pip install flask openpyxl
   ```

3. **Add your Excel checklist file**
   - Place your `Checklist.xlsx` file in the project root
   - The Excel file should have sheets with structured data (Position, Action columns)

4. **Configure Google Sheets (Optional)**
   - Follow the setup instructions in `static/report-config.js`
   - Deploy Google Apps Script and update the URL

## 🏃 Running the Application

1. **Start the Flask server**
   ```bash
   python app.py
   ```

2. **Open your browser**
   ```
   http://localhost:5000
   ```

3. **Login**
   - Enter your ID and A/C Registration
   - Start checking off tasks!

## 📁 Project Structure

```
Checklist/
├── app.py                      # Main Flask application
├── config.py                   # Configuration settings
├── routes.py                   # URL route definitions
├── Checklist.xlsx              # Your Excel checklist file
│
├── formatters/
│   ├── __init__.py
│   └── cell_formatter.py       # Excel cell to HTML conversion
│
├── handlers/
│   ├── __init__.py
│   └── merge_handler.py        # Excel merged cell handling
│
├── services/
│   ├── __init__.py
│   └── excel_service.py        # Excel parsing service
│
├── utils/
│   ├── __init__.py
│   └── html_utils.py           # HTML utility functions
│
├── static/                     # Static assets
│   ├── main.js                 # Main JavaScript (tabs, checkboxes, reset)
│   ├── report.js               # Report modal functionality
│   ├── report-config.js        # Google Apps Script configuration
│   ├── styles.css              # Main stylesheet
│   └── report.css              # Report modal styles
│
└── templates/                  # HTML templates
    ├── index.html              # Main application page
    └── report.html             # Standalone report page (unused)
```

## 🎨 Key Features Explained

### 1. Sequential Checkbox System
- First task is always enabled
- Each task unlocks only when the previous task is checked
- Unchecking a task automatically unchecks and disables all following tasks

### 2. Active Tab Reset
- Reset button clears only the current active tab
- Preserves progress in other tabs
- Confirmation dialog prevents accidental resets

### 3. Report System
- Tracks user ID, A/C Registration, timestamp
- Shows active tab name and progress (e.g., "Trước khi nổ máy: 9/33")
- Submits data to Google Sheets via Apps Script
- Edit user details before submission

### 4. Mobile Navigation
- Hamburger menu (bottom-right) for tab navigation
- Yellow "REPORT" button (top-right) for quick access
- Slide-out drawer with all checklist sheets
- Touch-optimized checkboxes and clickable rows

## 🔧 Configuration

### Changing the Excel File
1. Replace `Checklist.xlsx` with your file
2. Update `EXCEL_PATH` in `config.py` if using a different filename

### Google Sheets Integration

1. **Create Google Apps Script**
   - Open your Google Sheet
   - Go to Extensions → Apps Script
   - Copy the code from `static/report-config.js` comments
   - Save the script

2. **Deploy as Web App**
   - Click Deploy → New deployment
   - Select type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Click Deploy

3. **Update Configuration**
   - Copy the Web App URL
   - Update `window.REPORT_SCRIPT_URL` in `static/report-config.js`

### Google Apps Script Code
```javascript
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
      sheet.appendRow(['Time update', 'VAECO ID', 'A/C', 'Active Tab', 'Progress']);
    }
    
    // Add the data
    sheet.appendRow([
      new Date(data.data.submitTime),
      data.data.id,
      data.data.acRegis,
      data.data.activeTab,
      data.data.progressCompleted + '/' + data.data.progressTotal
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
```

## 🎯 Usage Guide

### For Users

1. **Login**
   - Enter your VAECO ID
   - Enter the Aircraft Registration
   - Click "Start Checklist"

2. **Working with Checklists**
   - Click hamburger menu (⋮) to switch between sheets
   - Tap anywhere on a task row to check it off
   - Tasks unlock sequentially as you progress
   - Completed tasks show with strike-through

3. **Submitting Reports**
   - Click yellow "REPORT" button (top-right)
   - Review your progress
   - Edit details if needed
   - Click "Submit Report"

4. **Resetting Progress**
   - Open hamburger menu
   - Click "🔄 Reset Active Tab"
   - Confirm to clear current tab's checkboxes

### For Administrators

1. **Updating Checklists**
   - Edit `Checklist.xlsx`
   - Restart the Flask server
   - Changes appear immediately

2. **Viewing Reports**
   - Open your Google Sheet
   - Check the configured sheet/tab
   - Data includes: Timestamp, ID, A/C, Active Tab, Progress

## 🐛 Troubleshooting

### Excel File Not Loading
- Ensure `Checklist.xlsx` is in the project root
- Check file permissions
- Verify Excel file format (must be .xlsx)

### Google Sheets Not Receiving Data
- Verify Web App URL in `report-config.js`
- Check Apps Script deployment settings
- Ensure "Anyone" has access to the Web App
- Test the Apps Script directly in the editor

### Checkboxes Not Working
- Clear browser cache
- Check browser console for JavaScript errors
- Ensure all static files are loaded correctly

### Mobile Display Issues
- Check viewport meta tag in HTML
- Verify responsive CSS is loaded
- Test on different screen sizes

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (iOS & macOS)
- ✅ Mobile browsers (Chrome, Safari)

## 🔒 Security Notes

- **Google Apps Script**: Set "Execute as: Me" for proper permissions
- **Web App Access**: Use "Anyone" for internal tools, or restrict as needed
- **HTTPS**: Deploy with proper SSL in production
- **User Data**: Consider adding authentication for production use

## 📝 Excel File Format

Your Excel file should follow this structure:

```
Sheet 1: "Trước khi nổ máy"
| Position    | Action                           | Note (optional) |
|-------------|----------------------------------|-----------------|
| Headset man | Check clean and clear FOD...     | Additional info |
| Cockpit man | Cockpit Lighting... As required  |                 |
```

**Special Features:**
- Merged cells for warnings/headers (will be displayed as warning rows)
- Last column (Notes) is automatically hidden
- Multiple sheets supported

## 🤝 Contributing

Feel free to submit issues or pull requests for improvements!

## 📄 License

This project is for internal use. Modify as needed for your organization.

## 👥 Credits

Developed for aircraft maintenance checklist management.

## 📞 Support

For questions or issues, contact VAE04028.

---

**Version:** 1.4.0  
**Last Updated:** November 2025