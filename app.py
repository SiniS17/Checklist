from flask import Flask, render_template
from openpyxl import load_workbook
from pathlib import Path

APP_ROOT = Path(__file__).parent.resolve()
EXCEL_PATH = Path("Checklist.xlsx")

app = Flask(__name__, template_folder=str(APP_ROOT / "templates"), static_folder=str(APP_ROOT / "static"))

def html_escape(s: str) -> str:
    return (
        s.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
         .replace('"', "&quot;")
         .replace("'", "&#39;")
    )

def to_html_with_style(cell):
    """Return cell value as HTML preserving bold/red font."""
    v = cell.value
    if v is None:
        return ""
    # Replace Excel line breaks only in short text (like names)
    raw = str(v)
    if "\n" in raw and len(raw.split("\n")) <= 3 and len(raw) < 30:
        text = html_escape(raw.replace("\n", " "))  # join with space
    else:
        text = html_escape(raw).replace("\n", "<br>")

    # Bold & red detection
    is_bold = getattr(cell.font, "bold", False)
    color = getattr(cell.font, "color", None)
    is_red = False
    if color and getattr(color, "rgb", None):
        rgb = color.rgb.upper()
        if rgb.endswith("FF0000") or rgb[-6:] == "FF0000":
            is_red = True

    if is_bold:
        text = f"<strong>{text}</strong>"
    if is_red:
        text = f'<span class="red-text">{text}</span>'
    return text

def _merged_map(ws):
    top_left = {}
    covers = set()
    for mr in ws.merged_cells.ranges:
        min_row, min_col, max_row, max_col = mr.min_row, mr.min_col, mr.max_row, mr.max_col
        rowspan = max_row - min_row + 1
        colspan = max_col - min_col + 1
        top_left[(min_row, min_col)] = (rowspan, colspan)
        for rr in range(min_row, max_row + 1):
            for cc in range(min_col, max_col + 1):
                covers.add((rr, cc))
    return top_left, covers

def _row_has_warning(ws, r, merged_top_left):
    for (rr, cc), (rs, cs) in merged_top_left.items():
        if rr == r and cs >= 2:
            return True
    return False

def parse_workbook(path: Path):
    wb = load_workbook(filename=str(path), data_only=True)
    sheets = []

    for ws in wb.worksheets:
        merged_top_left, merged_covers = _merged_map(ws)
        rows = []

        for r in range(1, ws.max_row + 1):
            if _row_has_warning(ws, r, merged_top_left):
                warning_text = ""
                for (rr, cc), (rs, cs) in merged_top_left.items():
                    if rr == r and cs >= 2:
                        warning_text = to_html_with_style(ws.cell(row=rr, column=cc))
                        break
                rows.append({"type": "warning", "html": warning_text})
                continue

            cells = []
            c = 1
            while c <= ws.max_column:
                if (r, c) in merged_covers:
                    span = merged_top_left.get((r, c))
                    if span:
                        rs, cs = span
                        html = to_html_with_style(ws.cell(row=r, column=c))
                        cells.append({"html": html, "rowspan": rs, "colspan": cs})
                        c += cs
                    else:
                        c += 1
                else:
                    html = to_html_with_style(ws.cell(row=r, column=c))
                    cells.append({"html": html, "rowspan": 1, "colspan": 1})
                    c += 1

            rows.append({"type": "data", "cells": cells})

        sheets.append({
            "name": ws.title,
            "rows": rows,
            "max_cols": ws.max_column
        })

    return {"file_name": path.name, "sheets": sheets}

@app.route("/")
def index():
    model = parse_workbook(EXCEL_PATH)
    return render_template("index.html", model=model)

if __name__ == "__main__":
    app.run(debug=True)
