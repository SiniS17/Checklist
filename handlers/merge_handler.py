class MergeHandler:
    """Handles Excel merged cell logic"""

    def __init__(self, worksheet):
        self.worksheet = worksheet
        self.top_left, self.covers = self._build_merged_map()

    def _build_merged_map(self):
        """Build mapping of merged cells"""
        top_left = {}
        covers = set()

        for mr in self.worksheet.merged_cells.ranges:
            min_row, min_col = mr.min_row, mr.min_col
            max_row, max_col = mr.max_row, mr.max_col
            rowspan = max_row - min_row + 1
            colspan = max_col - min_col + 1

            top_left[(min_row, min_col)] = (rowspan, colspan)

            for rr in range(min_row, max_row + 1):
                for cc in range(min_col, max_col + 1):
                    covers.add((rr, cc))

        return top_left, covers

    def is_warning_row(self, row_num):
        """Check if row is a warning row (merged cell spanning 2+ columns)"""
        for (rr, cc), (rs, cs) in self.top_left.items():
            if rr == row_num and cs >= 2:
                return True
        return False

    def get_warning_text(self, row_num, formatter):
        """Get warning text for a warning row"""
        for (rr, cc), (rs, cs) in self.top_left.items():
            if rr == row_num and cs >= 2:
                cell = self.worksheet.cell(row=rr, column=cc)
                return formatter.to_html_with_style(cell)
        return ""

    def is_covered(self, row, col):
        """Check if cell is covered by a merge"""
        return (row, col) in self.covers

    def get_span(self, row, col):
        """Get rowspan/colspan for a cell if it's a merge top-left"""
        return self.top_left.get((row, col))