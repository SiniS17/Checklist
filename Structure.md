# Project Structure Documentation

## Architecture Overview

This Flask application follows a traditional server-side rendering (SSR) pattern with client-side enhancement via vanilla JavaScript.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
├─────────────────────────────────────────────────────────┤
│  index.html  │  styles.css  │  main.js  │ localStorage  │
└──────────────┬──────────────────────────────────────────┘
               │ HTTP Request
               ▼
┌─────────────────────────────────────────────────────────┐
│                   Flask Server (Python)                  │
├─────────────────────────────────────────────────────────┤
│  app.py  │  openpyxl  │  Jinja2 Templates               │
└──────────────┬──────────────────────────────────────────┘
               │ File Read
               ▼
┌─────────────────────────────────────────────────────────┐
│                    Checklist.xlsx                        │
└─────────────────────────────────────────────────────────┘
```

## File Breakdown

### 1. `app.py` - Main Flask Application

**Responsibilities:**
- Serve the web application
- Parse Excel files
- Convert Excel data to HTML-friendly format
- Handle merged cells and formatting

**Key Functions:**

#### `html_escape(s: str) -> str`
- **Purpose**: Sanitize user input to prevent XSS attacks
- **Input**: Raw string from Excel
- **Output**: HTML-safe string
- **Usage**: Called before any text is inserted into HTML

#### `to_html_with_style(cell) -> str`
- **Purpose**: Convert Excel cell to HTML with formatting preserved
- **Current Issues**: 
  - Partial bold text detection not working
  - May apply bold to entire cell when only parts should be bold
- **Needs Refactoring**: Should be split into:
  - `detect_rich_text(cell)` - Check if cell has rich text
  - `parse_rich_text(cell)` - Extract formatted runs
  - `format_html(runs)` - Convert to HTML

#### `_merged_map(ws) -> tuple`
- **Purpose**: Build a map of merged cell regions
- **Returns**: 
  - `top_left`: Dictionary of merged cell origins and their span
  - `covers`: Set of all cells covered by merges

#### `_row_has_warning(ws, r, merged_top_left) -> bool`
- **Purpose**: Detect warning rows (merged cells spanning 2+ columns)
- **Logic**: If a row starts with a merge spanning ≥2 columns, it's a warning

#### `parse_workbook(path: Path) -> dict`
- **Purpose**: Main parsing function
- **Output Structure**:
```python
{
    "file_name": "Checklist.xlsx",
    "sheets": [
        {
            "name": "Sheet1",
            "rows": [
                {
                    "type": "warning",
                    "html": "⚠️ <strong>WARNING TEXT</strong>"
                },
                {
                    "type": "data",
                    "cells": [
                        {"html": "Position", "rowspan": 1, "colspan": 1},
                        {"html": "Action", "rowspan": 1, "colspan": 1}
                    ]
                }
            ],
            "max_cols": 2
        }
    ]
}
```

#### `@app.route("/")`
- **Purpose**: Serve the main page
- **Process**: Parse Excel → Render template → Return HTML

---

### 2. `templates/index.html` - HTML Template

**Structure:**
```html
<body>
  <!-- Mobile Menu -->
  <button id="fab-menu">☰</button>
  <div id="side-overlay"></div>
  <nav id="side-drawer">
    <!-- Mobile sheet tabs -->
  </nav>

  <!-- Main Content -->
  <div class="container">
    <h1>Checklist</h1>
    <button id="reset-btn">Reset All</button>
    
    <!-- Desktop Tabs -->
    <div class="tabs">
      <!-- Desktop sheet tabs -->
    </div>

    <!-- Sheet Panels -->
    <section class="tab-panel">
      <table class="grid">
        <!-- Checklist rows -->
      </table>
    </section>
  </div>

  <script src="main.js"></script>
</body>
```

**Jinja2 Template Variables:**
- `model.file_name`: Excel filename
- `model.sheets`: List of sheet objects
- `sheet.name`: Sheet tab name
- `sheet.rows`: List of row objects
- `row.type`: "warning" or "data"
- `row.cells`: List of cell objects (for data rows)

---

### 3. `static/styles.css` - Stylesheet

**CSS Architecture:**

#### Root Variables
```css
:root {
  --bg: #f7f7f7;      /* Page background */
  --card: #ffffff;    /* Container background */
  --ink: #0f172a;     /* Primary text */
  --muted: #64748b;   /* Secondary text */
  --accent: #2563eb;  /* Active tab/button */
  --warn: #f59e0b;    /* Warning background */
  --ring: #0f172a;    /* Focus ring */
}
```

#### Component Classes

**Desktop Components:**
- `.tabs` - Tab bar container
- `.tab-btn` - Individual tab button
- `.tab-panel` - Content panel for each sheet

**Mobile Components:**
- `#fab-menu` - Floating action button (hamburger)
- `#side-drawer` - Slide-out navigation
- `#side-overlay` - Dark overlay backdrop

**Table Components:**
- `.table-wrap` - Scrollable container
- `table.grid` - Main table
- `.warning-row` - Warning banner row
- `.task-checkbox` - Checkbox input
- `.strike` - Completed task row (strikethrough)

**Layout Strategy:**
- Desktop: Fixed width (1100px), tabs visible
- Mobile: Full width, hamburger menu, sticky checkboxes

#### Media Queries
- `@media (max-width: 768px)` - Tablet/mobile
- `@media (max-width: 480px)` - Small mobile

---

### 4. `static/main.js` - Client-Side Logic

**Module Structure:**
```javascript
(function () {
  // IIFE to avoid global scope pollution

  // === TAB SWITCHING ===
  // Desktop tab click handlers

  // === MOBILE DRAWER ===
  // Hamburger menu + overlay

  // === CHECKBOX LOGIC ===
  // Sequential locking + localStorage

  // === RESET BUTTON ===
  // Clear all progress
})();
```

#### Key Components:

**1. Tab Switching**
- **Function**: `activateTab(btn)`
- **Logic**: Hide all panels, show selected panel

**2. Mobile Drawer**
- **Functions**: `openDrawer()`, `closeDrawer()`
- **Trigger**: FAB button click or overlay click

**3. Checkbox Management**
- **Data Structure**:
```javascript
bySheet = {
  0: [checkbox1, checkbox2, checkbox3],  // Sheet 0 checkboxes
  1: [checkbox4, checkbox5],             // Sheet 1 checkboxes
}
```
- **Storage Key**: `ckl__${sheetIndex}`
- **Storage Format**: `{"0": true, "1": false, "2": false}`

**Sequential Locking Logic:**
```javascript
// Checkbox at index i is enabled only if checkbox at i-1 is checked
checkbox[i].disabled = !checkbox[i-1].checked;
```

**Change Event Handler:**
1. Check if checkbox is checked
2. Apply/remove strikethrough to parent row
3. If unchecked, clear all following checkboxes
4. Save state to localStorage
5. Reapply locking rules

---

## Data Flow

### Initial Page Load
```
1. User requests http://127.0.0.1:5000/
2. Flask calls index() route
3. parse_workbook() reads Checklist.xlsx
4. Jinja2 renders index.html with data
5. Browser receives HTML + CSS + JS
6. main.js restores checkbox state from localStorage
```

### User Checks a Box
```
1. User clicks checkbox
2. JavaScript change event fires
3. Row gets .strike class (strikethrough)
4. State saved to localStorage as {"index": true}
5. applyRules() disables/enables subsequent checkboxes
```

### User Switches Tabs
```
1. User clicks tab button
2. activateTab() removes .active from all panels
3. Adds .active to target panel
4. On mobile: closeDrawer() hides side menu
```

---

## State Management

### Client-Side State (localStorage)

**Storage Keys:**
- `ckl__0` - Sheet 0 checkbox states
- `ckl__1` - Sheet 1 checkbox states
- `ckl__N` - Sheet N checkbox states

**Storage Format:**
```json
{
  "0": true,   // First checkbox checked
  "1": false,  // Second checkbox unchecked
  "2": true    // Third checkbox checked
}
```

**Persistence:**
- Survives page refresh
- Browser-specific (not synced)
- Cleared by "Reset All" button

---

## Current Issues & Technical Debt

### 1. Rich Text Formatting (HIGH PRIORITY)
**Problem**: `to_html_with_style()` cannot detect partial bold text
**Example**: "Check BRAKE Pedals" - only "BRAKE" should be bold
**Current Behavior**: Entire cell becomes bold
**Root Cause**: Incorrect detection of openpyxl's rich text structure

### 2. Monolithic Functions
**Problem**: `to_html_with_style()` does too many things
**Solution**: Split into smaller, testable functions

### 3. No Backend Storage
**Problem**: Progress only stored in browser localStorage
**Impact**: 
- Can't sync across devices
- Can't share progress with team
- Lost if browser data cleared

### 4. No Error Handling
**Problem**: If Excel file is missing or malformed, app crashes
**Solution**: Add try-except blocks and user-friendly error pages

### 5. Hard-coded File Path
**Problem**: `EXCEL_PATH = Path("Checklist.xlsx")`
**Solution**: Accept file path as CLI argument or config file

---

## Recommended Refactoring

### Phase 1: Module Separation
Split `app.py` into:
- `excel_parser.py` - Excel reading logic
- `formatter.py` - HTML formatting logic
- `app.py` - Flask routes only

### Phase 2: Rich Text Fix
Create dedicated rich text handler:
```python
# formatter.py
class ExcelFormatter:
    def format_cell(self, cell):
        if self.has_rich_text(cell):
            return self.format_rich_text(cell)
        return self.format_plain_text(cell)
```

### Phase 3: Testing
Add unit tests for:
- Excel parsing
- HTML escaping
- Rich text detection
- Checkbox logic

### Phase 4: Backend Storage
Replace localStorage with:
- SQLite for single-user
- PostgreSQL for multi-user
- Add user sessions

---

## Development Dependencies

```
Flask==3.0.0
openpyxl==3.1.2
Jinja2==3.1.2 (bundled with Flask)
```

**Optional (for future):**
```
pytest==7.4.0 (testing)
black==23.0.0 (code formatting)
pylint==2.17.0 (linting)
```

---

## Browser API Usage

### localStorage API
```javascript
// Save
localStorage.setItem('ckl__0', JSON.stringify(state));

// Load
const state = JSON.parse(localStorage.getItem('ckl__0') || '{}');

// Clear
localStorage.removeItem('ckl__0');
```

### DOM Manipulation
- `querySelector()` - Select elements
- `classList.add/remove()` - Toggle CSS classes
- `addEventListener()` - Attach event handlers
- `dataset` - Access data-* attributes

---

## Styling Philosophy

### Desktop-First Approach
1. Design for desktop (tablets/laptops)
2. Add mobile overrides with media queries
3. Keep mobile UI minimal and touch-friendly

### Component-Based CSS
- Each component has isolated styles
- No global utility classes (unlike Tailwind)
- BEM-like naming (but not strict)

### Mobile Optimizations
- Sticky checkboxes for easy access
- Hamburger menu saves screen space
- Larger touch targets (52px+)
- Reduced font sizes for readability