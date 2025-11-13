# Development Workflow Guide

## Table of Contents
1. [Setting Up Development Environment](#setting-up-development-environment)
2. [Code Organization Strategy](#code-organization-strategy)
3. [Debugging Rich Text Issues](#debugging-rich-text-issues)
4. [Testing Workflow](#testing-workflow)
5. [Git Workflow](#git-workflow)
6. [Deployment](#deployment)

---

## Setting Up Development Environment

### 1. Initial Setup
```bash
# Clone/create project directory
mkdir flask-checklist
cd flask-checklist

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install flask openpyxl

# Create directory structure
mkdir templates static
touch app.py templates/index.html static/styles.css static/main.js
```

### 2. IDE Configuration

**VS Code (Recommended)**
```json
// .vscode/settings.json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "files.associations": {
    "*.html": "jinja-html"
  }
}
```

**Extensions:**
- Python (Microsoft)
- Jinja (wholroyd)
- Live Server (for quick HTML testing)

### 3. Browser DevTools Setup
- Chrome/Edge: F12 → Application → Local Storage
- Firefox: F12 → Storage → Local Storage
- Enable "Preserve log" for debugging redirects

---

## Code Organization Strategy

### Current Monolithic Structure (Before Refactoring)
```
app.py (400+ lines)
├── html_escape()
├── to_html_with_style()  ← THE PROBLEM CHILD
├── _merged_map()
├── _row_has_warning()
├── parse_workbook()
└── @app.route("/")
```

### Proposed Modular Structure (After Refactoring)

```
project-root/
├── app.py                      # Flask routes only (50 lines)
├── core/
│   ├── __init__.py
│   ├── excel_parser.py         # Excel file reading
│   ├── formatter.py            # HTML formatting + rich text
│   └── utils.py                # html_escape, etc.
├── templates/
│   └── index.html
├── static/
│   ├── styles.css
│   └── main.js
└── tests/
    ├── __init__.py
    ├── test_parser.py
    ├── test_formatter.py
    └── fixtures/
        └── sample.xlsx
```

---

## Debugging Rich Text Issues

### Problem Analysis

**Expected Behavior:**
```
Excel Cell: "Check BRAKE Pedals...........APPLY"
           Only "BRAKE" is bold in Excel
Expected HTML: Check <strong>BRAKE</strong> Pedals...........APPLY
```

**Current Behavior:**
```
Current HTML: <strong>Check BRAKE Pedals...........APPLY</strong>
              (Entire cell is bold)
```

### Debugging Strategy

#### Step 1: Inspect Excel Cell Structure
```python
# debug_cell.py
from openpyxl import load_workbook

wb = load_workbook('Checklist.xlsx')
ws = wb.active

# Pick a cell with partial bold text (e.g., B7)
cell = ws['B7']

print("Cell value:", cell.value)
print("Cell value type:", type(cell.value))
print("Cell _value:", cell._value)
print("Cell _value type:", type(cell._value))
print("Cell font:", cell.font)
print("Cell font bold:", cell.font.bold if cell.font else None)

# Check if it's rich text
if hasattr(cell._value, '__iter__') and not isinstance(cell._value, str):
    print("\n=== RICH TEXT DETECTED ===")
    for i, item in enumerate(cell._value):
        print(f"\nRun {i}:")
        print(f"  Type: {type(item)}")
        print(f"  Content: {item}")
        if hasattr(item, 'text'):
            print(f"  Text: {item.text}")
        if hasattr(item, 'font'):
            print(f"  Font: {item.font}")
            print(f"  Bold: {item.font.b if hasattr(item.font, 'b') else 'N/A'}")
```

**Run this:**
```bash
python debug_cell.py > cell_structure.txt
```

#### Step 2: Test Different Excel Formats
Create test Excel files:
1. `test_plain.xlsx` - No formatting
2. `test_full_bold.xlsx` - Entire cell bold
3. `test_partial_bold.xlsx` - Only one word bold
4. `test_mixed.xlsx` - Bold + red + normal

#### Step 3: Iterate on Formatter
```python
# core/formatter.py (NEW FILE)
from openpyxl.cell.rich_text import CellRichText, TextBlock

class CellFormatter:
    """Handles conversion of Excel cells to HTML with formatting."""
    
    def __init__(self):
        self.debug_mode = True
    
    def format(self, cell):
        """Main entry point for formatting a cell."""
        if cell.value is None:
            return ""
        
        # Debug: Log cell type
        if self.debug_mode:
            print(f"Formatting cell: {cell.coordinate}")
            print(f"  Value type: {type(cell.value)}")
        
        # Check for rich text
        if self._is_rich_text(cell):
            return self._format_rich_text(cell)
        
        # Plain text
        return self._format_plain_text(cell)
    
    def _is_rich_text(self, cell):
        """Detect if cell contains rich text (partial formatting)."""
        # Method 1: Check _value type
        if isinstance(cell._value, CellRichText):
            return True
        
        # Method 2: Check if _value is iterable but not string
        if hasattr(cell._value, '__iter__') and not isinstance(cell._value, str):
            return True
        
        return False
    
    def _format_rich_text(self, cell):
        """Format cell with partial bold/color."""
        parts = []
        
        # Try different openpyxl structures
        try:
            # Attempt 1: CellRichText object
            for item in cell._value:
                if isinstance(item, TextBlock):
                    text = self._escape(item.text)
                    text = self._apply_font(text, item.font)
                    parts.append(text)
                elif isinstance(item, str):
                    parts.append(self._escape(item))
        except Exception as e:
            if self.debug_mode:
                print(f"  Rich text parsing failed: {e}")
            # Fallback to plain text
            return self._format_plain_text(cell)
        
        return ''.join(parts).replace('\n', '<br>')
    
    def _format_plain_text(self, cell):
        """Format cell with uniform styling."""
        text = self._escape(str(cell.value))
        text = self._apply_font(text, cell.font)
        return text.replace('\n', '<br>')
    
    def _apply_font(self, text, font):
        """Apply bold/color based on font object."""
        if not font:
            return text
        
        # Check bold
        is_bold = getattr(font, 'b', False) or getattr(font, 'bold', False)
        if is_bold:
            text = f'<strong>{text}</strong>'
        
        # Check red color
        if font.color and hasattr(font.color, 'rgb'):
            rgb = str(font.color.rgb).upper()
            if 'FF0000' in rgb:
                text = f'<span class="red-text">{text}</span>'
        
        return text
    
    def _escape(self, s):
        """HTML escape."""
        return (
            s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace('"', "&quot;")
             .replace("'", "&#39;")
        )
```

#### Step 4: Write Unit Tests
```python
# tests/test_formatter.py
import pytest
from openpyxl import Workbook
from openpyxl.styles import Font
from core.formatter import CellFormatter

class TestCellFormatter:
    @pytest.fixture
    def formatter(self):
        return CellFormatter()
    
    def test_plain_text(self, formatter):
        wb = Workbook()
        ws = wb.active
        ws['A1'] = "Plain text"
        
        result = formatter.format(ws['A1'])
        assert result == "Plain text"
    
    def test_full_bold(self, formatter):
        wb = Workbook()
        ws = wb.active
        ws['A1'] = "Bold text"
        ws['A1'].font = Font(bold=True)
        
        result = formatter.format(ws['A1'])
        assert result == "<strong>Bold text</strong>"
    
    def test_partial_bold(self, formatter):
        # This is the HARD one
        # Need to manually create rich text structure
        pass  # TODO: Research how to create rich text in openpyxl
```

**Run tests:**
```bash
pytest tests/ -v
```

---

## Testing Workflow

### Manual Testing Checklist

Before committing any changes, test:

**Desktop (Chrome/Edge):**
- [ ] All tabs switch correctly
- [ ] Checkboxes lock sequentially
- [ ] Strikethrough applies on check
- [ ] Progress persists after refresh
- [ ] Reset button clears everything
- [ ] Bold text displays correctly
- [ ] Warning rows are highlighted
- [ ] Scrolling works smoothly

**Mobile (Chrome DevTools → Device Mode):**
- [ ] Hamburger menu opens/closes
- [ ] Checkboxes stay sticky on right
- [ ] Touch targets are large enough (52px+)
- [ ] No horizontal scroll issues
- [ ] Content wraps properly
- [ ] FAB button is accessible

**Cross-Browser:**
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Edge

### Automated Testing Setup

```bash
# Install testing dependencies
pip install pytest pytest-cov pytest-flask

# Run tests with coverage
pytest tests/ --cov=core --cov-report=html

# Open coverage report
# Windows: start htmlcov/index.html
# macOS: open htmlcov/index.html
```

### Test Data Management

Create `tests/fixtures/` with sample Excel files:
- `minimal.xlsx` - 1 sheet, 3 rows
- `multisheet.xlsx` - 3 sheets
- `formatted.xlsx` - Bold, red, merged cells
- `warning.xlsx` - Contains warning banners

---

## Git Workflow

### Branch Strategy

```
main (production)
  ├── develop (integration)
  │   ├── feature/rich-text-fix
  │   ├── feature/modular-refactor
  │   └── bugfix/mobile-checkbox-sticky
  └── hotfix/critical-crash
```

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation only
- `style`: Formatting, no code change
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat(formatter): add rich text detection"
git commit -m "fix(mobile): make checkboxes sticky on scroll"
git commit -m "refactor(parser): split into separate modules"
git commit -m "docs(README): add installation instructions"
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Changes Made
- List of specific changes
- Another change

## Testing Done
- [ ] Manual testing on desktop
- [ ] Manual testing on mobile
- [ ] Unit tests pass
- [ ] Coverage maintained/improved

## Screenshots (if UI change)
[Attach before/after images]

## Related Issues
Fixes #123
```

---

## Deployment

### Local Development
```bash
# Debug mode (auto-reload)
python app.py

# Production mode
export FLASK_ENV=production
flask run --host=0.0.0.0 --port=5000
```

### Production (Simple)
```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Production (Docker)
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

```bash
# Build and run
docker build -t checklist-app .
docker run -p 5000:5000 -v $(pwd)/Checklist.xlsx:/app/Checklist.xlsx checklist-app
```

### Environment Variables
```bash
# .env file
FLASK_ENV=production
EXCEL_PATH=/path/to/Checklist.xlsx
SECRET_KEY=your-secret-key-here
```

---

## Debugging Tips

### Common Issues

**Issue: "No module named 'flask'"**
```bash
# Make sure venv is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

**Issue: "Template not found"**
```python
# Check folder structure
app.py
templates/
  └── index.html  ← Must be here, not at root
```

**Issue: "Static files 404"**
```python
# Verify static folder
static/
  ├── styles.css
  └── main.js
```

**Issue: localStorage not working**
- Check browser privacy settings
- Disable ad blockers temporarily
- Try incognito mode to test fresh state

### Performance Profiling

```python
# Add to app.py for timing
import time

@app.route("/")
def index():
    start = time.time()
    model = parse_workbook(EXCEL_PATH)
    parse_time = time.time() - start
    print(f"Parse time: {parse_time:.2f}s")
    return render_template("index.html", model=model)
```

### Memory Profiling

```bash
pip install memory_profiler

# Add decorator to functions
@profile
def parse_workbook(path):
    # ... existing code

# Run with profiler
python -m memory_profiler app.py
```

---

## Next Steps (Recommended Order)

1. **Create debug script** to inspect Excel structure
2. **Write unit tests** for current functionality (baseline)
3. **Refactor** `app.py` into modules
4. **Fix rich text** detection based on debug output
5. **Add error handling** for missing files
6. **Implement backend storage** (optional)
7. **Deploy to production** server

---

## Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [openpyxl Documentation](https://openpyxl.readthedocs.io/)
- [Jinja2 Template Designer](https://jinja.palletsprojects.com/en/3.1.x/templates/)
- [MDN Web Docs - localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [CSS Tricks - Sticky Position](https://css-tricks.com/position-sticky-and-table-headers/)

---

## Troubleshooting Contact

For project-specific issues, refer to:
- `README.md` - General usage
- `Structure.md` - Architecture details
- This file - Development workflow

Community help:
- Stack Overflow (tag: flask, openpyxl)
- Flask Discord server
- GitHub Issues (if open source)