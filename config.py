__author__ = 'cancobanoglu'
import os

ROOT_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), "app")
RESOURCES_PATH = os.path.join(ROOT_PATH, "resources")
BASE_TEMPLATE_PATH = os.path.join(ROOT_PATH, "views")
BIND_TO_PORT = 8080
DEBUG = True

DB_SETTINGS = dict(
    db_name='poi',
    db_user='postgres',
    db_password='1234',
    db_host='localhost',
    db_port=5432
)

HERE_APP_ACCESS = dict(
    app_id="kvTMp5y2JFGERc9pWR6o",
    app_code="PBy3H_B24TMLr03MECgKFQ"
)
