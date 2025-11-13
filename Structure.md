# Project Structure

## Directory Layout

```
checklist-app/
├── app.py                          # Main entry point
├── config.py                       # Configuration settings
├── routes.py                       # URL route definitions
├── Checklist.xlsx                  # Excel data file
│
├── formatters/
│   ├── __init__.py
│   └── cell_formatter.py          # Excel cell → HTML formatting
│
├── handlers/
│   ├── __init__.py
│   └── merge_handler.py           # Merged cell logic
│
├── services/
│   ├── __init__.py
│   └── excel_service.py           # Excel parsing service
│
├── utils/
│   ├── __init__.py
│   └── html_utils.py              # HTML utility functions
│
├── static/
│   ├── main.js                    # Frontend JavaScript
│   └── styles.css                 # CSS styles
│
└── templates/
    └── index.html                 # Main HTML template
```

## Module Responsibilities

### Core Files

**`app.py`**
- Application entry point
- Creates Flask app using factory pattern
- Runs the development server

**`config.py`**
- Centralized configuration
- Defines paths (templates, static, Excel file)
- Easy to extend with environment variables

**`routes.py`**
- URL route definitions
- Connects URLs to view logic
- Keeps routing separate from business logic

### Formatters

**`formatters/cell_formatter.py`**
- Converts Excel cell formatting to HTML
- Handles rich text (mixed bold/color within cells)
- Handles regular cells with uniform formatting
- Detects bold text and red color
- Escapes HTML special characters

### Handlers

**`handlers/merge_handler.py`**
- Manages Excel merged cell logic
- Builds mapping of merged cells
- Identifies warning rows (wide merged cells)
- Provides rowspan/colspan information
- Checks if cells are covered by merges

### Services

**`services/excel_service.py`**
- Main business logic for Excel parsing
- Orchestrates cell formatting and merge handling
- Converts workbook → structured data for templates
- Handles worksheet iteration
- Excludes "Note" column from display

### Utils

**`utils/html_utils.py`**
- Generic HTML utilities
- HTML escaping function
- Can be extended with other HTML helpers

### Frontend

**`static/main.js`**
- Tab switching (desktop)
- Mobile drawer navigation
- Checkbox state management
- Sequential checkbox logic
- localStorage persistence
- Reset functionality

**`static/styles.css`**
- Responsive design (desktop/mobile)
- Sticky checkbox column
- Warning row styling
- Strikethrough for completed tasks

**`templates/index.html`**
- Main page template
- Renders sheets as tabs
- Displays tables with checkboxes

## Data Flow

1. **Request** → `app.py` → `routes.py`
2. **Excel Parsing** → `excel_service.py`:
   - Uses `merge_handler.py` for merged cells
   - Uses `cell_formatter.py` for styling
   - Uses `html_utils.py` for escaping
3. **Response** → Template rendering with structured data
4. **Frontend** → JavaScript manages interactivity

## Setup Instructions

1. Create the directory structure as shown above
2. Add empty `__init__.py` files in each package directory:
   - `formatters/__init__.py`
   - `handlers/__init__.py`
   - `services/__init__.py`
   - `utils/__init__.py`
3. Copy module files to their respective directories
4. Keep existing `static/` and `templates/` folders unchanged
5. Install dependencies: `pip install flask openpyxl`
6. Run: `python app.py`

## Benefits of This Structure

✅ **Separation of Concerns** - Each module has a single responsibility  
✅ **Testability** - Easy to unit test individual components  
✅ **Maintainability** - Changes are isolated to specific modules  
✅ **Scalability** - Easy to add new formatters, handlers, or services  
✅ **Readability** - Clear naming and organization  
✅ **Reusability** - Formatters and handlers can be reused  

## Extending the Application

- **Add new cell formatters**: Create classes in `formatters/`
- **Add new handlers**: Create classes in `handlers/`
- **Add new routes**: Add functions in `routes.py`
- **Add configuration**: Extend `config.py`
- **Add utilities**: Add functions in `utils/`