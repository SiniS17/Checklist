from flask import Flask
from pathlib import Path
from routes import register_routes
from config import Config


def create_app():
    """Application factory pattern"""
    app = Flask(
        __name__,
        template_folder=str(Config.TEMPLATES_DIR),
        static_folder=str(Config.STATIC_DIR)
    )

    # Register routes
    register_routes(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)