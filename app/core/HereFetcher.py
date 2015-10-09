from app.core.map_grid_creator import create_boundingbox_rect_list

__author__ = 'cancobanoglu'
from app.dao.IsochroneDao import IsochroneDao
from app.core.services.HereIsochroneService import *
from app.core.services.HerePlaceService import *
import app.dao.db as db

isochrone_dao = IsochroneDao()
here_isochrone_service = HereIsochroneService()
here_places_service = HerePlaceService()


class HereFetcher:
    def __init__(self):
        pass

    def make_isochrone(self, __range, reverse, place=TagPlaces, mode=ModeType, range_type=RangeType):
        '''
        :param __range: range could be time or distances based value, if range type is time than range must be seconds
        :param place:
        :param mode:
        :param range_type:
        :return:
        '''
        self.here_isochrone_service.set_lat_lng(place.lat, place.lng)
        self.here_isochrone_service.set_mode(mode)
        self.here_isochrone_service.set_range_type(range_type)
        self.here_isochrone_service.set_range(__range)

        parsed_polygon_wkt = here_isochrone_service.parse_polygon(True, reverse)

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

    def create_pedestrian_reverse_isos(self, place=TagPlaces):
        three_mins = self.create_three_min_iso_pedestrian(True, place)
        five_mins = self.create_five_min_iso_pedestrian(True, place)
        ten_mins = self.create_ten_min_iso_pedestrian(True, place)

        isochrone = PoiIsochrones(type=PoiType.PLACES, here_id=place.here_id, geom_3min_isoline=three_mins,
                                  geom_5min_isoline=five_mins, geom_10min_isoline=ten_mins)

        isochrone_dao.merge(place.here_id, isochrone)

    def create_driver_reverse_isos(self, place=TagPlaces, isochrone=PoiIsochrones):
        one_min = self.create_one_min_iso_driver(True, place)
        three_min = self.create_three_min_iso_driver(True, place)
        five_min = self.create_five_min_iso_driver(True, place)

        if isochrone is None:
            iso = PoiIsochrones(type=PoiType.PLACES, here_id=place.here_id, driver_one_min_isoline=one_min,
                                driver_three_min_isoline=three_min, driver_five_min_isoline=five_min)
            isochrone_dao.merge(place.here_id, iso)
        else:
            isochrone.driver_one_min_isoline = one_min
            isochrone.driver_three_min_isoline = three_min
            isochrone.driver_five_min_isoline = five_min

            isochrone_dao.merge(place.here_id, isochrone)

    def fetch_places_by_in(self, ):
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


here_fetcher = HereFetcher()
place_dao = PlacesDao()
session = db.get_session()
l = place_dao.find_one(session)

here_fetcher.create_pedestrian_reverse_isos(l)
