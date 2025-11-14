from flask import render_template
from config import Config
from services.excel_service import ExcelService


def register_routes(app):
    """Register all application routes"""
    
    @app.route("/")
    def index():
        """Main checklist page"""
        service = ExcelService()
        model = service.parse_workbook(Config.EXCEL_PATH)
        return render_template("index.html", model=model)
    
    @app.route("/report")
    def report_form():
        """Report form page"""
        return render_template("report.html")
