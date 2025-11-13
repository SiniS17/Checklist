# Flask Checklist Web Application

A web-based checklist application that reads Excel files and converts them into interactive, mobile-responsive checklists with progress tracking.

## Features

- 📊 **Excel Integration**: Automatically parses `.xlsx` files with support for merged cells and multi-sheet workbooks
- ✅ **Interactive Checkboxes**: Sequential checkbox locking ensures tasks are completed in order
- 💾 **Progress Persistence**: Saves checkbox states to localStorage for session recovery
- 📱 **Mobile Responsive**: Optimized UI with sticky checkboxes and hamburger menu navigation
- 🎨 **Rich Text Support**: Preserves bold and colored text formatting from Excel cells
- ⚠️ **Warning Rows**: Special highlighting for warning/caution messages
- 🔄 **Reset Functionality**: Clear all progress with one click

## Prerequisites

- Python 3.7+
- Flask
- openpyxl

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
pip install flask openpyxl
```

3. Place your Excel file named `Checklist.xlsx` in the project root directory

## Project Structure

```
project-root/
├── app.py                 # Main Flask application
├── Checklist.xlsx         # Your Excel checklist file
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── styles.css        # Stylesheet
│   └── main.js           # Client-side JavaScript
├── README.md             # This file
├── Structure.md          # Detailed architecture documentation
└── Workflow.md           # Development workflow guide
```

## Quick Start

1. **Run the application:**
```bash
python app.py
```

2. **Open your browser:**
```
http://127.0.0.1:5000
```

3. **Start checking off tasks!**

## Excel File Format

Your `Checklist.xlsx` should follow this structure:

| Position | Action | Note (optional) |
|----------|--------|-----------------|
| Task name | Instructions | Additional info |

### Special Features:
- **Multiple Sheets**: Each sheet becomes a separate tab
- **Merged Cells**: Spanning 2+ columns creates warning banners
- **Text Formatting**: Bold and red text are preserved
- **Line Breaks**: Automatically converted to `<br>` tags

### Example:
```
Sheet 1: "Pre-flight Checklist"
┌─────────────────┬──────────────────────────────────┬────────┐
│ Position        │ Action                           │ Note   │
├─────────────────┼──────────────────────────────────┼────────┤
│ ⚠️ WARNING: Follow all safety procedures (merged) │        │
├─────────────────┼──────────────────────────────────┼────────┤
│ Headset Man     │ Check communications... PERFORM  │        │
├─────────────────┼──────────────────────────────────┼────────┤
│ Cockpit Man     │ BRAKE Pedals............APPLY    │        │
└─────────────────┴──────────────────────────────────┴────────┘
```

## Usage

### Desktop
- Click tabs at the top to switch between sheets
- Check boxes sequentially (next checkbox unlocks when previous is checked)
- Click "Reset All" to clear all progress

### Mobile
- Tap the floating blue button (☰) to open the sheet menu
- Checkboxes stay sticky on the right side while scrolling
- Swipe horizontally to view full content

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Known Issues

- Rich text formatting detection needs improvement (partial bold text may not display correctly)
- localStorage is per-browser (progress doesn't sync across devices)

## Troubleshooting

**Problem**: Checkboxes appear disabled
- **Solution**: You must check the previous checkbox first (sequential order)

**Problem**: Progress lost after reload
- **Solution**: localStorage may be disabled or cleared. Check browser settings.

**Problem**: Excel formatting not showing
- **Solution**: Ensure you're using `.xlsx` format (not `.xls`) and formatting is applied in Excel

**Problem**: Mobile view not responsive
- **Solution**: Clear browser cache and ensure viewport meta tag is present

## Future Enhancements

- [ ] Fix rich text (partial bold) detection
- [ ] Add backend database for multi-user progress tracking
- [ ] Export progress to PDF/Excel
- [ ] User authentication and profiles
- [ ] Real-time collaboration features
- [ ] Dark mode theme

## Contributing

This is a work-in-progress project. Contributions welcome!

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues or questions, please refer to:
- `Structure.md` for architectural details
- `Workflow.md` for development guidelines