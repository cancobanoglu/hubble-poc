__author__ = 'cancobanoglu'
import db
import models


class PtStopsDao:
    session = None

    def __init__(self):
        self.session = db.get_session()

    @staticmethod
    def find_all(session):
        return session.query(models.TagPtStops).all()
