__author__ = 'cancobanoglu'
import os

ROOT_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), "app")
RESOURCES_PATH = os.path.join(ROOT_PATH, "resources")
BASE_TEMPLATE_PATH = os.path.join(ROOT_PATH, "views")
BIND_TO_PORT = 8080
DEBUG = True