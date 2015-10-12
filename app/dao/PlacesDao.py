__author__ = 'cancobanoglu'
import db
import models


class PlacesDao:
    session = None

    def __init__(self):
        self.session = db.get_session()

    def merge(self, place=models.TagPlaces):
        '''
        first check whether or not there is an already persisted object with given here_id

        :param place: filled TagPlaces object
        :return: nothing
        '''
        try:
            q = self.session.query(models.TagPlaces).filter(models.TagPlaces.here_id == place.here_id)
            one = q.one()
            if one is None:
                self.session.add(place)
            else:
                place.id = one.id
                self.session.merge(place)
        except:
            self.session.add(place)
            pass

        self.session.commit()

    @staticmethod
    def find_all(session):
        return session.query(models.TagPlaces).all()

    @staticmethod
    def find_one(session):
        return session.query(models.TagPlaces).first()
