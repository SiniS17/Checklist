from flask import Flask, render_template, jsonify, request
import pandas as pd
from collections import OrderedDict
from pathlib import Path

app = Flask(__name__)

EXCEL_PATH = Path("ERU checklist.xlsx")


def load_checklist():
    """
    Reads every sheet from the Excel file.
    Each sheet represents one section. Rows must have columns: Order, Task (case-insensitive).
    Returns a flat list with global incremental IDs and an OrderedDict grouped by section.
    """
    if not EXCEL_PATH.exists():
        raise FileNotFoundError(f"Excel file not found at {EXCEL_PATH.resolve()}")

    xls = pd.ExcelFile(EXCEL_PATH)
    flat = []
    next_id = 1
    grouped = OrderedDict()

    for sheet in xls.sheet_names:  # preserve sheet order
        df = xls.parse(sheet)
        # Normalize column names
        df.columns = [str(c).strip().lower() for c in df.columns]

        # Detect columns
        order_col = next((c for c in df.columns if c in ("order", "ord", "index", "#")), None)
        task_col = next((c for c in df.columns if "task" in c or "item" in c or "check" in c or "content" in c), None)
        if task_col is None:
            # If no recognizable columns, skip this sheet gracefully
            continue

        # If order column missing, synthesize based on row position
        if order_col is None:
            df["_order_synth"] = range(1, len(df) + 1)
            order_col = "_order_synth"

        # Keep only non-empty tasks
        df = df.dropna(subset=[task_col])
        # Coerce order to numeric, fall back to row order if needed
        try:
            df[order_col] = pd.to_numeric(df[order_col], errors="coerce")
        except Exception:
            pass
        df[order_col] = df[order_col].fillna(float("inf"))
        df = df.sort_values(by=order_col, kind="mergesort")  # stable within sheet

        section_items = []
        for _, row in df.iterrows():
            task_text = str(row[task_col]).strip()
            if not task_text:
                continue
            item = {
                "id": next_id,
                "section": sheet.strip(),
                "task": task_text,
                "checked": False
            }
            section_items.append(item)
            flat.append(item)
            next_id += 1

        if section_items:
            grouped[sheet.strip()] = section_items

    return flat, grouped


# Load once at startup (simple); if you want hot-reload on each refresh,
# move this call into the index() route.
CHECKLIST_FLAT, GROUPED = load_checklist()


@app.route("/")
def index():
    return render_template("index.html", grouped_checklist=GROUPED)


def recompute_percent():
    total = len(CHECKLIST_FLAT)
    checked = sum(1 for i in CHECKLIST_FLAT if i["checked"])
    return round((checked / total) * 100, 1) if total else 0.0


@app.route("/update", methods=["POST"])
def update():
    data = request.get_json(force=True)
    item_id = int(data["id"])
    state = bool(data["checked"])
    for item in CHECKLIST_FLAT:
        if item["id"] == item_id:
            item["checked"] = state
            break
    return jsonify(success=True, percent=recompute_percent())


@app.route("/uncheck_below", methods=["POST"])
def uncheck_below():
    data = request.get_json(force=True)
    start_id = int(data["id"])
    for item in CHECKLIST_FLAT:
        if item["id"] > start_id:
            item["checked"] = False
    return jsonify(success=True, percent=recompute_percent())


if __name__ == "__main__":
    app.run(debug=True)
