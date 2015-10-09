__author__ = 'cancobanoglu'

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from models import *
import config


def engine_factory():
    settings = config.DB_SETTINGS
    postgresql_path = 'postgresql://%s:%s@%s:%s/%s' % (
        settings['db_user'],
        settings['db_password'],
        settings['db_host'],
        settings['db_port'],
        settings['db_name']
    )
    return create_engine(postgresql_path)


engine = engine_factory()
session = scoped_session(sessionmaker(bind=engine))
Base.metadata.create_all(engine)


def get_session():
    return session()  # establish conversation between database


def get_connection():
    return engine.connect()
