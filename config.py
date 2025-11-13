from pathlib import Path

class Config:
    """Application configuration"""
    APP_ROOT = Path(__file__).parent.resolve()
    TEMPLATES_DIR = APP_ROOT / "templates"
    STATIC_DIR = APP_ROOT / "static"
    EXCEL_PATH = APP_ROOT / "Checklist.xlsx"