__author__ = 'cancobanoglu'
import db
import models


class PlacesDao(db.DAO):
    def merge(self, here_id, place=models.TagPlaces):
        '''
        first check whether or not there is an already persisted object with given here_id

        :param place: filled TagPlaces object
        :return: nothing
        '''
        session = self.get_session()
        try:
            q = session.query(models.TagPlaces).filter(models.TagPlaces.here_id == here_id)
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
