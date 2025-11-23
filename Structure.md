# 📂 Project Structure Documentation

## Complete Directory Tree

```
Checklist/
│
├── 📄 app.py                           # Main Flask application entry point
├── 📄 config.py                        # Application configuration
├── 📄 routes.py                        # URL route definitions
├── 📄 Checklist.xlsx                   # Excel source file
├── 📄 README.md                        # Project documentation
├── 📄 Structure.md                     # This file
│
├── 📁 formatters/                      # Excel cell formatting
│   ├── 📄 __init__.py
│   └── 📄 cell_formatter.py           # Converts Excel cells to HTML
│
├── 📁 handlers/                        # Excel data handlers
│   ├── 📄 __init__.py
│   └── 📄 merge_handler.py            # Handles merged cells logic
│
├── 📁 services/                        # Business logic services
│   ├── 📄 __init__.py
│   └── 📄 excel_service.py            # Excel parsing and processing
│
├── 📁 utils/                           # Utility functions
│   ├── 📄 __init__.py
│   └── 📄 html_utils.py               # HTML escaping utilities
│
├── 📁 static/                          # Static assets (CSS, JS)
│   ├── 📄 main.js                     # Main JavaScript functionality
│   ├── 📄 report.js                   # Report modal functionality
│   ├── 📄 report-config.js            # Google Apps Script config
│   ├── 📄 styles.css                  # Main stylesheet
│   └── 📄 report.css                  # Report modal styles
│
└── 📁 templates/                       # Jinja2 HTML templates
    ├── 📄 index.html                  # Main application page
    └── 📄 report.html                 # Standalone report (unused)
```

## 📋 Detailed File Descriptions

### Root Level Files

#### `app.py`
**Purpose:** Main Flask application entry point
```python
- Creates Flask app instance
- Configures template and static folders
- Registers routes
- Runs development server
```
**Key Functions:**
- `create_app()` - Application factory pattern
- Development server on port 5000

#### `config.py`
**Purpose:** Centralized configuration management
```python
- APP_ROOT: Project root directory
- TEMPLATES_DIR: HTML templates location
- STATIC_DIR: Static assets location
- EXCEL_PATH: Path to Checklist.xlsx
```

#### `routes.py`
**Purpose:** URL routing and view logic
```python
- @app.route("/") - Main checklist page
- Parses Excel file using ExcelService
- Renders index.html with data
```

#### `Checklist.xlsx`
**Purpose:** Source data for checklists
- Contains multiple sheets (tabs)
- Structured with Position, Action, Note columns
- Supports merged cells for warnings
- Updated by administrators

---

### 📁 formatters/

#### `cell_formatter.py`
**Purpose:** Convert Excel cell values to HTML
```python
Class: CellFormatter
├── to_html_with_style(cell)
│   ├── Handles None values
│   ├── Converts line breaks to <br>
│   ├── Escapes HTML special characters
│   └── Returns formatted HTML string
```
**Usage:** Called by excel_service.py to format cell content

---

### 📁 handlers/

#### `merge_handler.py`
**Purpose:** Handle Excel merged cell logic
```python
Class: MergeHandler
├── __init__(worksheet)
│   └── Builds merge mapping
├── _build_merged_map()
│   ├── Identifies merged cell ranges
│   ├── Calculates rowspan/colspan
│   └── Tracks covered cells
├── is_warning_row(row_num)
│   └── Detects warning rows (merged ≥ 2 cols)
├── get_warning_text(row_num, formatter)
│   └── Extracts warning text
├── is_covered(row, col)
│   └── Checks if cell is covered by merge
└── get_span(row, col)
    └── Returns (rowspan, colspan) tuple
```
**Usage:** Ensures merged cells render correctly in HTML

---

### 📁 services/

#### `excel_service.py`
**Purpose:** Main Excel parsing service
```python
Class: ExcelService
├── __init__()
│   └── Initializes CellFormatter
├── parse_workbook(path)
│   ├── Loads Excel file
│   ├── Parses all worksheets
│   └── Returns structured data model
├── _parse_worksheet(worksheet)
│   ├── Creates MergeHandler
│   ├── Processes each row
│   └── Handles warning rows
└── _parse_row(worksheet, row_num, merge_handler)
    ├── Processes regular cells
    ├── Handles merged cells
    ├── Skips Note column
    └── Returns cell data with spans
```
**Data Model Output:**
```python
{
    "file_name": "Checklist.xlsx",
    "sheets": [
        {
            "name": "Sheet Name",
            "rows": [
                {"type": "warning", "html": "..."},
                {"type": "data", "cells": [...]}
            ],
            "max_cols": 2
        }
    ]
}
```

---

### 📁 utils/

#### `html_utils.py`
**Purpose:** HTML safety utilities
```python
Function: html_escape(s)
├── Escapes & to &amp;
├── Escapes < to &lt;
├── Escapes > to &gt;
├── Escapes " to &quot;
└── Escapes ' to &#39;
```
**Usage:** Prevents XSS attacks from Excel content

---

### 📁 static/

#### `main.js`
**Purpose:** Core checklist functionality
```javascript
Features:
├── Tab Switching
│   ├── activateTab(btn)
│   ├── Updates active states
│   └── Shows/hides panels
├── Mobile Drawer
│   ├── openDrawer() / closeDrawer()
│   └── Overlay click handling
├── Checkbox Logic
│   ├── Sequential unlocking
│   ├── Strike-through on check
│   ├── Uncheck following tasks
│   └── Row click handling
└── Reset Button
    ├── Resets active tab only
    ├── Confirmation dialog
    └── Reapplies checkbox rules
```

**Key Variables:**
- `bySheet` - Object mapping sheet index to checkboxes
- `lastActiveTab` - Remembers last active checklist tab

#### `report.js`
**Purpose:** Report modal and submission
```javascript
Features:
├── Login Flow
│   ├── Validates ID & A/C Registration
│   ├── Stores user data
│   └── Shows main app
├── Report Modal
│   ├── getActiveTabName()
│   ├── calculateActiveTabProgress()
│   ├── updateReportDisplay()
│   └── showReportModal() / closeReportModal()
├── Edit Functionality
│   ├── Edit user details
│   └── Save changes
└── Submit Report
    ├── Validates configuration
    ├── Sends to Google Apps Script
    └── Shows success/error status
```

**User Data Structure:**
```javascript
userData = {
    id: 'VAECO ID',
    acRegis: 'Aircraft Registration',
    startTime: Date object
}
```

#### `report-config.js`
**Purpose:** Google Apps Script configuration
```javascript
- window.REPORT_SCRIPT_URL: Web App URL
- Contains Google Apps Script code
- Setup instructions
```

#### `styles.css`
**Purpose:** Main application styles
```css
Features:
├── CSS Variables (theme colors)
├── Container & layout styles
├── Tab button styles
├── Table grid styles
├── Sticky checkbox column
├── Warning row styles
├── Hamburger menu (FAB)
├── Sidebar drawer
├── Strike-through for completed tasks
└── Responsive mobile styles (@media queries)
```

**Key Classes:**
- `.tab-btn` / `.tab-btn.active` - Tab buttons
- `.task-checkbox` - Checkboxes
- `.strike` - Completed task rows
- `#fab-menu` - Hamburger button
- `#side-drawer` - Slide-out menu

#### `report.css`
**Purpose:** Report modal styles
```css
Features:
├── Drawer sections
├── Status messages (success/error)
├── Form styles
├── Button styles
├── Code section (collapsible)
└── Mobile adjustments
```

---

### 📁 templates/

#### `index.html`
**Purpose:** Main application page
```html
Structure:
├── <head>
│   ├── Viewport meta tag
│   ├── CSS imports
│   └── Inline styles
├── <body>
│   ├── Login Screen
│   │   ├── ID input
│   │   ├── A/C Registration input
│   │   └── Start button
│   ├── Navigation
│   │   ├── Hamburger menu (FAB)
│   │   ├── Side drawer
│   │   └── Yellow REPORT button
│   ├── Main Container
│   │   ├── Dynamic title (active tab)
│   │   └── Sheet panels (Jinja2 loop)
│   │       ├── Warning rows
│   │       ├── Data rows
│   │       └── Checkboxes
│   └── Report Modal
│       ├── User info display
│       ├── Edit form
│       ├── Status messages
│       └── Submit button
└── Scripts
    ├── report-config.js
    ├── main.js
    ├── report.js
    └── Title update script
```

**Jinja2 Template Variables:**
```python
model = {
    "file_name": str,
    "sheets": [
        {
            "name": str,
            "rows": list,
            "max_cols": int
        }
    ]
}
```

#### `report.html`
**Purpose:** Standalone report page (currently unused)
- Alternative report interface
- Not integrated in current version
- Can be developed for future use

---

## 🔄 Data Flow

### 1. Application Startup
```
app.py
  └─→ routes.py
      └─→ ExcelService.parse_workbook()
          └─→ MergeHandler (for each sheet)
          └─→ CellFormatter (for each cell)
          └─→ Returns data model
      └─→ Renders index.html
```

### 2. User Login
```
index.html (login form)
  └─→ report.js (login button click)
      └─→ Store userData
      └─→ Show main container
      └─→ Show FAB & REPORT button
```

### 3. Checkbox Interaction
```
User clicks row
  └─→ main.js (row click event)
      └─→ Toggle checkbox
      └─→ Trigger change event
      └─→ Update strike-through
      └─→ Uncheck following tasks
      └─→ Reapply sequential rules
```

### 4. Report Submission
```
User clicks REPORT
  └─→ report.js (showReportModal)
      └─→ Calculate progress
      └─→ Update display
      └─→ User clicks Submit
          └─→ Send to Google Apps Script
          └─→ Apps Script saves to Sheet
          └─→ Show success message
```

### 5. Reset Active Tab
```
User clicks Reset button
  └─→ main.js (reset button click)
      └─→ Get active tab
      └─→ Confirm dialog
      └─→ Uncheck all in active tab
      └─→ Remove strike-through
      └─→ Reapply rules
```

---

## 🎨 UI Component Hierarchy

```
Application
│
├── Login Screen (initially visible)
│   ├── Logo & Title
│   ├── ID Input
│   ├── A/C Registration Input
│   └── Start Button
│
├── Main App (after login)
│   ├── Top Bar
│   │   └── Yellow REPORT Button
│   │
│   ├── Content Area
│   │   ├── Dynamic Title (active tab name)
│   │   └── Active Tab Panel
│   │       └── Table
│   │           ├── Warning Rows (merged)
│   │           └── Task Rows
│   │               ├── Position Cell
│   │               ├── Action Cell
│   │               └── Checkbox Cell (sticky)
│   │
│   ├── Bottom Right
│   │   └── Hamburger Menu (FAB)
│   │
│   └── Side Drawer (slide from left)
│       ├── Checklist Sheets Section
│       │   └── Tab Buttons
│       └── Actions Section
│           └── Reset Active Tab Button
│
└── Report Modal (overlay)
    ├── Header (close button)
    ├── User Info Display
    │   ├── ID
    │   ├── A/C Registration
    │   ├── Date & Time
    │   ├── Active Tab: Progress
    │   └── Edit Button
    ├── Edit Form (hidden)
    │   ├── ID Input
    │   ├── A/C Input
    │   └── Save Button
    ├── Status Message
    └── Submit Button
```

---

## 🔌 External Dependencies

### Python Packages
```
Flask==2.x          # Web framework
openpyxl==3.x       # Excel file reading
```

### Frontend (No external dependencies)
- Pure JavaScript (ES6+)
- No jQuery, React, or other frameworks
- Vanilla CSS with CSS Variables

### External Services
```
Google Apps Script   # Report data storage
└─→ Google Sheets   # Data destination
```

---

## 📊 State Management

### Client-Side State

#### `main.js`
```javascript
- bySheet: {sheetIndex: [checkboxes]}
- lastActiveTab: Button element
```

#### `report.js`
```javascript
- userData: {id, acRegis, startTime}
- scriptUrl: Google Apps Script URL
```

### Session State
- Stored in JavaScript memory
- Lost on page refresh
- No backend session management
- No local storage used

---

## 🔐 Security Considerations

### Input Sanitization
- `html_utils.py` escapes all Excel content
- Prevents XSS from malicious Excel files

### Google Apps Script
- Uses POST requests with JSON payload
- CORS mode: 'no-cors' (response unreadable)
- Deploy with appropriate access controls

### Future Improvements
- Add backend authentication
- Implement CSRF protection
- Use HTTPS in production
- Add rate limiting

---

## 🚀 Deployment Checklist

### Development → Production

- [ ] Update Flask debug mode to `False`
- [ ] Set up proper WSGI server (Gunicorn, uWSGI)
- [ ] Configure SSL/HTTPS
- [ ] Set appropriate CORS headers
- [ ] Update Google Apps Script access controls
- [ ] Add error logging
- [ ] Set up monitoring
- [ ] Create backup strategy for Excel file
- [ ] Document environment variables
- [ ] Test on target devices/browsers

---

## 📈 Future Enhancement Ideas

### Features
- [ ] Save progress to backend database
- [ ] Multi-user real-time collaboration
- [ ] Offline mode with sync
- [ ] Export progress as PDF
- [ ] Admin dashboard
- [ ] User authentication system
- [ ] Audit trail / history
- [ ] Custom themes

### Technical
- [ ] Add TypeScript
- [ ] Implement unit tests
- [ ] Add E2E testing
- [ ] Optimize bundle size
- [ ] Add PWA capabilities
- [ ] Implement caching strategy
- [ ] Add analytics

---

**Document Version:** 1.4.0  
**Last Updated:** November 2025