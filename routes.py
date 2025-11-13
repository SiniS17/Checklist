from flask import render_template
from services.excel_service import ExcelService
from config import Config


def register_routes(app):
    """Register all application routes"""

    @app.route("/")
    def index():
        excel_service = ExcelService()
        model = excel_service.parse_workbook(Config.EXCEL_PATH)
        return render_template("index.html", model=model)