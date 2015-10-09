from geoalchemy2 import WKTElement
from shapely.geometry import asPoint

__author__ = 'cancobanoglu'
from app.dao.models import *
from app.dao.PlacesDao import PlacesDao
import config
import requests

place_dao = PlacesDao()


class HerePlaceService:
    access = config.HERE_APP_ACCESS
    param_dict = dict(

        # http://places.cit.api.here.com/places/v1/discover/explore
        # ?app_id={YOUR_APP_ID}
        # &app_code={YOUR_APP_CODE}
        # &at=52.50449,13.39091
        # &pretty

        places_api_url='http://places.cit.api.here.com/places',
        version='v1',
        action='discover/explore',
        scantype='in',
        radius='7000'  # meters
    )

    is_cit = None

    def __init__(self):
        pass

    def use_cit(self, use_cit):
        self.is_cit = use_cit

    def set_at(self, lat, lng):
        str_lat = str(lat)
        str_lng = str(lng)

        self.param_dict['at'] = str_lat + "," + str_lng

    def set_in(self, bbox):
        self.param_dict['in'] = bbox

    def set_radius(self, radius):
        self.param_dict['radius'] = radius

    def build_discover_places_url(self, *cat):
        request_url = '%s/%s/%s%s%s%s%s' % (
            self.param_dict['places_api_url'],
            self.param_dict['version'],
            self.param_dict['action'],
            '?app_id=' + self.access['app_id'],
            '&app_code=' + self.access['app_code'],
            '&in=' + self.param_dict['in'],
            '&size=2000'
        )

        if cat is not None:
            request_url += '&cat='
            for c in cat:
                request_url += c

        return request_url

    def do_get(self, url):
        response = requests.get(url)

        data = None

        try:
            data = response.json()
        except:
            print "error on do_get_request_return_response"
            print data
            print url
            raise Exception('hata aldin firlatiyorum')

        return data

    def parse(self, *cat):
        url = self.build_discover_places_url(*cat)
        data = self.do_get(url)
        self.evaluate_data(data)

    def evaluate_data(self, data):
        results = data.get('results')

        items = None
        next = None

        try:
            if results is None:
                items = data['items']
                next = data.get('next')
            else:
                items = results['items']
                next = results.get('next')
        except:
            print 'Error : ' + str(data)
            raise

        items_len = items.__len__()

        if items_len == 0:
            return

        for item in items:
            self.create_place(item)

        if next is not None:
            self.evaluate_data(self.do_get(next))

    def create_place(self, item):
        position = item['position']
        lat = position[0]
        lng = position[1]

        # Geography data
        loc_el = WKTElement(asPoint(position).wkt)
        place = TagPlaces(here_id=item['id'], name=item['title'], category=item['category']['title'], lat=lat, lng=lng,
                          location=loc_el)

        place_dao.merge(place)
