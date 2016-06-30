from geoalchemy2.shape import to_shape

__author__ = 'cancobanoglu'
import db
from models import PoiIsochrones


class IsochroneDao:
    session = None

    def __init__(self):
        self.session = db.get_session()

    def merge(self, here_id, isochrone=PoiIsochrones):

        try:
            q = self.session.query(PoiIsochrones).filter(PoiIsochrones.source_id == here_id)
            one = q.one()

            if one is None:
                self.session.add(isochrone)
            else:
                isochrone.id = one.id
                self.session.merge(isochrone)
        except:
            self.session.add(isochrone)
            pass

        self.session.commit()

    def find_by_source_ids(self, source_ids):

        try:
            q = self.session.query(PoiIsochrones).filter(PoiIsochrones.source_id.in_(source_ids))
            return q.all()
        except ValueError as e:
            print('something bad happened !')
            print(e.message)

        return []

    def find_by_id(self, place_id):
        print place_id
        q = self.session.query(PoiIsochrones).filter(PoiIsochrones.source_id == place_id)
        obj = q.first()
        return obj


