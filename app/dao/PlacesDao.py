__author__ = 'cancobanoglu'
import db
import models


class PlacesDao:
    def __init__(self):
        pass

    @staticmethod
    def merge(self, session, place=models.TagPlaces):
        '''
        first check whether or not there is an already persisted object with given here_id

        :param place: filled TagPlaces object
        :return: nothing
        '''
        try:
            q = session.query(models.TagPlaces).filter(models.TagPlaces.here_id == place.here_id)
            one = q.one()
            if one is None:
                session.add(place)
            else:
                place.id = one.id
                session.merge(place)
        except:
            session.add(place)
            pass

        session.commit()

    def find_all(self, session):
        return session.query(models.TagPlaces).all()

    def find_one(self, session):
        return session.query(models.TagPlaces).first()
