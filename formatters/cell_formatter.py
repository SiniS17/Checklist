from openpyxl.cell.text import InlineFont
from openpyxl.cell.rich_text import TextBlock, CellRichText
from utils.html_utils import html_escape


class CellFormatter:
    """Handles Excel cell formatting to HTML conversion"""

    @staticmethod
    def to_html_with_style(cell):
        """Return cell value as HTML preserving bold/red font, including rich text."""
        v = cell.value
        if v is None:
            return ""

        # Check if cell has rich text (partial formatting)
        if CellFormatter._is_rich_text(cell):
            return CellFormatter._format_rich_text(cell)

        # Regular processing (no rich text)
        return CellFormatter._format_regular_cell(cell, v)

    @staticmethod
    def _is_rich_text(cell):
        """Check if cell contains rich text formatting"""
        try:
            return isinstance(cell._value, CellRichText)
        except:
            return False

    @staticmethod
    def _format_rich_text(cell):
        """Format cell with rich text (mixed formatting)"""
        html_parts = []

        for item in cell._value:
            if isinstance(item, TextBlock):
                text = html_escape(str(item.text))

                # Check for bold
                if item.font and getattr(item.font, 'b', False):
                    text = f"<strong>{text}</strong>"

                # Check for red color
                if CellFormatter._is_red_font(item.font):
                    text = f'<span class="red-text">{text}</span>'

                html_parts.append(text)
            else:
                # Plain string part
                html_parts.append(html_escape(str(item)))

        if html_parts:
            result = ''.join(html_parts)
            result = result.replace("\n", "<br>")
            return result

        return ""

    @staticmethod
    def _format_regular_cell(cell, value):
        """Format regular cell (uniform formatting)"""
        raw = str(value)

        # Handle line breaks
        if "\n" in raw and len(raw.split("\n")) <= 3 and len(raw) < 30:
            text = html_escape(raw.replace("\n", " "))
        else:
            text = html_escape(raw).replace("\n", "<br>")

        # Apply cell-level formatting
        is_bold = getattr(cell.font, "bold", False) if cell.font else False
        is_red = CellFormatter._is_red_font(cell.font)

        if is_bold:
            text = f"<strong>{text}</strong>"
        if is_red:
            text = f'<span class="red-text">{text}</span>'

        return text

    @staticmethod
    def _is_red_font(font):
        """Check if font color is red"""
        if not font:
            return False

        color = getattr(font, "color", None)
        if color and getattr(color, "rgb", None):
            rgb = str(color.rgb).upper()
            return 'FF0000' in rgb

        return False