from utils.html_utils import html_escape


class CellFormatter:
    """Handles Excel cell value conversion to HTML"""

    @staticmethod
    def to_html_with_style(cell):
        """Return cell value as plain HTML text."""
        v = cell.value
        if v is None:
            return ""

        raw = str(v)
        
        # Handle line breaks
        if "\n" in raw and len(raw.split("\n")) <= 3 and len(raw) < 30:
            text = html_escape(raw.replace("\n", " "))
        else:
            text = html_escape(raw).replace("\n", "<br>")

        return text
