from twisted.python.util import println
from app.core.map_grid_creator import create_boundingbox_rect_list

__author__ = 'cancobanoglu'
from app.dao.IsochroneDao import IsochroneDao
from app.dao.PtStopsDao import PtStopsDao
from app.core.services.HereIsochroneService import *
from app.core.services.HerePlaceService import *
import app.dao.db as db

isochrone_dao = IsochroneDao()
here_isochrone_service = HereIsochroneService()
here_reverse_isochrone_service = HereReverseIsochrone()
here_places_service = HerePlaceService()
stops_dao = PtStopsDao()
place_dao = PlacesDao()
session = db.get_session()


class HereFetcher:
    def __init__(self):
        pass

    def make_isochrone(self, target, reverse, place=TagPlaces, mode=ModeType, range_type=RangeType):
        '''
        :param __range: range could be time or distances based value, if range type is time than range must be seconds
        :param place:
        :param mode:
        :param range_type:
        :return:
        '''

        if not reverse:
            here_isochrone_service.set_lat_lng(place.lat, place.lng)
            here_isochrone_service.set_mode(mode)
            here_isochrone_service.set_range_type(range_type)
            here_isochrone_service.set_range(target)

            parsed_polygon_wkt = here_isochrone_service.parse_polygon(True)
        else:
            here_reverse_isochrone_service.set_mode(mode)
            here_reverse_isochrone_service.set_lat_lng(place.lat, place.lng)
            here_reverse_isochrone_service.set_range(target)

            parsed_polygon_wkt = here_reverse_isochrone_service.parse_polygon(True)

        return parsed_polygon_wkt

    def create_three_min_iso_pedestrian(self, reverse, place=TagPlaces):
        return self.make_isochrone(180, True, place, ModeType.PEDESTRIAN, RangeType.TIME)

    def create_five_min_iso_pedestrian(self, reverse, place=TagPlaces):
        return self.make_isochrone(300, True, place, ModeType.PEDESTRIAN, RangeType.TIME)

    def create_ten_min_iso_pedestrian(self, reverse, place=TagPlaces):
        return self.make_isochrone(600, True, place, ModeType.PEDESTRIAN, RangeType.TIME)

    def create_one_min_iso_driver(self, reverse, place=TagPlaces):
        return self.make_isochrone(60, True, place, ModeType.DRIVER, RangeType.TIME)

    def create_three_min_iso_driver(self, reverse, place=TagPlaces):
        return self.make_isochrone(180, True, place, ModeType.DRIVER, RangeType.TIME)

    def create_five_min_iso_driver(self, reverse, place=TagPlaces):
        return self.make_isochrone(300, True, place, ModeType.DRIVER, RangeType.TIME)

    def pedestrian_reverse_isolines(self, place=TagPlaces):
        three_mins = self.create_three_min_iso_pedestrian(True, place)
        five_mins = self.create_five_min_iso_pedestrian(True, place)
        ten_mins = self.create_ten_min_iso_pedestrian(True, place)

        isochrone = PoiIsochrones(type=PoiType.PLACES, here_id=place.here_id, geom_3min_isoline=three_mins,
                                  geom_5min_isoline=five_mins, geom_10min_isoline=ten_mins)

        isochrone_dao.merge(place.here_id, isochrone)

    def car_reverse_isolines(self, place=TagPlaces, isochrone=PoiIsochrones):
        one_min = self.create_one_min_iso_driver(True, place)
        three_min = self.create_three_min_iso_driver(True, place)
        five_min = self.create_five_min_iso_driver(True, place)

        if isochrone is None:
            iso = PoiIsochrones(type=PoiType.PLACES, source_id=place.here_id, source='HERE',
                                driver_one_min_isoline=one_min,
                                driver_three_min_isoline=three_min, driver_five_min_isoline=five_min)
            isochrone_dao.merge(place.here_id, iso)
        else:
            isochrone.driver_one_min_isoline = one_min
            isochrone.driver_three_min_isoline = three_min
            isochrone.driver_five_min_isoline = five_min

            isochrone_dao.merge(place.here_id, isochrone)

    def fetch_places_by_in(self):
        self.here_places_service.set_radius()

    def explore_places_by_bbox(self, *cat):
        bbox_list = create_boundingbox_rect_list()
        print 'processing for : ' + cat[0]

        for box in bbox_list:
            try:
                self.here_places_service.set_in(box)
                self.here_places_service.parse(*cat)
            except Exception, err:
                print 'Error: %s' % str(err)
                print 'Latest bbox position :' + str(box)

    def fetch_place_categories(self):
        pass

    @staticmethod
    def start_fetching_stops_isolines():
        place_list = place_dao.find_stops_without_isolines(session)
        print place_list.__len__()
        for place in place_list:
            println(place.here_id, place.id)
            try:
                here_fetcher.car_reverse_isolines(place, None)
            except ValueError:
                pass


if __name__ == '__main__':
    here_fetcher = HereFetcher()
    here_fetcher.start_fetching_stops_isolines()
