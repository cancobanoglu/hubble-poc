__author__ = 'cancobanoglu'
import db
from models import PoiIsochrones


class IsochroneDao:
    def __init__(self):
        pass

    def merge(self, here_id, isochrone_polygon):

        session = self.get_session()
        try:
            q = session.query(PoiIsochrones).filter(PoiIsochrones.here_id == here_id)
            one = q.one()

            if one is None:
                session.add(isochrone_polygon)
            else:
                isochrone_polygon.id = one.id
                session.merge(isochrone_polygon)
        except:
            session.add(isochrone_polygon)
            pass

        session.commit()
