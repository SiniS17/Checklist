# Excel Checklist Web App ✅

This project converts an Excel workbook into a **multi-tab interactive checklist website**.  
Each sheet in the Excel file becomes a separate tab. Merged rows are displayed as **warning banners**,  
and a column containing “Note” turns into a **checkbox column** where users can check off tasks **in order**.

---

## 🌟 Features

- **Automatic tab generation** — one per Excel sheet.
- **Merged-cell detection** — merged rows are displayed as warning banners (⚠️).
- **Sequential checkboxes** — each box is disabled until the previous one is checked.
- **Local progress saving** — checkbox states persist via localStorage in your browser.
- **Responsive and clean UI** — simple layout with active tab highlighting.

---

## 🧩 Requirements

Install dependencies with:

```bash
pip install -r requirements.txt
