import re
from pathlib import Path

from flask import Flask, render_template
from openpyxl import load_workbook

APP_ROOT = Path(__file__).parent.resolve()
EXCEL_PATH = Path("Checklist.xlsx")

app = Flask(__name__, template_folder=str(APP_ROOT / "templates"), static_folder=str(APP_ROOT / "static"))


def _cell_value(ws, r, c):
    v = ws.cell(row=r, column=c).value
    return "" if v is None else str(v)


def _merged_map(ws):
    """
    Build maps to detect merged top-left cells and their spans,
    plus a fast lookup to see if a coordinate is inside a merged range.
    """
    top_left = {}  # (r,c) -> (rowspan, colspan)
    covers = set()  # all (r,c) that are inside some merged range
    for mr in ws.merged_cells.ranges:
        min_row, min_col, max_row, max_col = mr.min_row, mr.min_col, mr.max_row, mr.max_col
        rowspan = max_row - min_row + 1
        colspan = max_col - min_col + 1
        top_left[(min_row, min_col)] = (rowspan, colspan)
        for rr in range(min_row, max_row + 1):
            for cc in range(min_col, max_col + 1):
                covers.add((rr, cc))
    return top_left, covers


def _detect_note_col(ws, max_header_scan=3):
    """
    Try to find a header cell containing 'note' (case-insensitive)
    within the first few rows. Returns column index (1-based) or None.
    """
    patt = re.compile(r"note", re.IGNORECASE)
    for r in range(1, min(ws.max_row, max_header_scan) + 1):
        for c in range(1, ws.max_column + 1):
            txt = _cell_value(ws, r, c).strip()
            if patt.search(txt):
                return c
    return None


def _row_is_warning(ws, r, merged_top_left):
    """
    Consider a row a 'warning row' when there exists a merged region
    whose top-left starts on this row and spans at least two columns.
    """
    for (rr, cc), (rs, cs) in merged_top_left.items():
        if rr == r and cs >= 2:
            # treat as warning; display the merged cell text
            return True
    return False


def parse_workbook(path: Path):
    wb = load_workbook(filename=str(path), data_only=True)
    sheets = []

    for ws in wb.worksheets:
        merged_top_left, merged_covers = _merged_map(ws)
        note_col = _detect_note_col(ws)

        # Build a row-wise model preserving merges.
        rows = []
        for r in range(1, ws.max_row + 1):
            # If row is a "warning" (merged across >=2 cols starting at this row), capture it.
            if _row_is_warning(ws, r, merged_top_left):
                # Find the first merged region starting at (r, *)
                warning_text = None
                colspan = 1
                for (rr, cc), (rs, cs) in merged_top_left.items():
                    if rr == r and cs >= 2:
                        warning_text = _cell_value(ws, rr, cc).strip()
                        colspan = cs
                        break
                rows.append({
                    "type": "warning",
                    "text": warning_text or "",
                })
                continue

            # Otherwise, build a normal row with cells respecting merged spans
            cells = []
            c = 1
            while c <= ws.max_column:
                if (r, c) in merged_covers:
                    # Only render the top-left of a merge
                    span = merged_top_left.get((r, c))
                    if span:
                        rs, cs = span
                        cells.append({
                            "value": _cell_value(ws, r, c).strip(),
                            "rowspan": rs,
                            "colspan": cs,
                            "r": r, "c": c
                        })
                        c += cs
                    else:
                        # Covered by merge but not top-left; skip
                        c += 1
                else:
                    cells.append({
                        "value": _cell_value(ws, r, c).strip(),
                        "rowspan": 1,
                        "colspan": 1,
                        "r": r, "c": c
                    })
                    c += 1

            rows.append({
                "type": "data",
                "cells": cells
            })

        sheets.append({
            "name": ws.title,
            "note_col": note_col,  # 1-based, may be None
            "max_cols": ws.max_column,
            "rows": rows
        })

    return {
        "file_name": path.name,
        "sheets": sheets
    }


@app.route("/")
def index():
    model = parse_workbook(EXCEL_PATH)
    return render_template("index.html", model=model)


if __name__ == "__main__":
    # Run: python app.py, then open http://127.0.0.1:5000/
    app.run(debug=True)
