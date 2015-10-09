__author__ = 'cancobanoglu'
from app.core.api_urls import *
from shapely.geometry import asPolygon
from app.core.utils.geomety_utils import *
import requests, config

'''
    IsochroneService class is responsible for getting isoline polygon from HERE map isochrone service
    with execute function you can get wkt element of shape data
'''


class HereIsochroneService:
    access = config.HERE_APP_ACCESS
    param_dict = dict(
        base_url='http://isoline.route.cit.api.here.com/routing',
        version='7.2',
        action="calculateisoline.json",
        mode='fastest;pedestrian;traffic:disabled',
        rangetype='time',
        range='',
        destination=''
    )

    reverse_isochrone_api = dict(

    )

    response_data = None
    wkt_element = None

    def __init__(self):
        pass

    def set_mode(self, mode=ModeType):
        '''
        :param mode: ModeType.DRIVER = 0 and ModeType.PEDESTRIAN = 1
        :return: nothing
        '''

        if mode is ModeType.DRIVER:
            self.param_dict['mode'] = 'fastest;car;traffic:disabled'
        elif mode is ModeType.PEDESTRIAN:
            pass

    def set_version(self, version):
        self.param_dict['version'] = version

    def set_range_type(self, range_type=RangeType):
        '''
        :param type: RangeType.TIME = 'time' and RangeType = 'distance'
        :return: nothing
        '''

        self.param_dict['rangetype'] = range_type

    def set_range(self, __range):
        self.param_dict['range'] = __range

    def set_destination_point(self, destination_point):
        self.param_dict['destination'] = destination_point

    def set_lat_lng(self, lat, lng):
        str_lat = str(lat)
        str_lng = str(lng)

        self.set_destination_point(str_lat + "," + str_lng)

    def build_isoline_url(self, reverse):
        request_url = None
        if reverse:
            # TODO
            request_url = ''
        else:
            request_url = '%s/%s/%s%s%s%s%s%s%s' % (
                self.param_dict['base_url'],
                self.param_dict['version'],
                self.param_dict['action'],
                '?app_id=' + self.access['app_id'],
                '&app_code=' + self.access['app_code'],
                '&mode=' + self.param_dict['mode'],
                '&rangetype=' + self.param_dict['rangetype'],
                '&destination=%s' % (self.param_dict['destination']),
                "&range={0}".format(self.param_dict['range'])
            )

        return request_url

    def parse_polygon(self, as_wkt, reverse):
        url = self.build_isoline_url(reverse)
        response = requests.get(url)
        self.response_data = response.json()
        shape_data = self.response_data['response']['isoline'][0]['component'][0]['shape']
        polygon_data = self.build_polygon(shape_data)

        if as_wkt is True:
            return wkt_element(polygon_data)

        return polygon_data

    @staticmethod
    def build_polygon(shape_data):
        point_list = [None] * len(shape_data)
        counter = 0

        for point in shape_data:
            lat_lng = [float(coord) for coord in point.split(",")]
            point_list.insert(counter, lat_lng)
            counter += 1

        point_list = [x for x in point_list if x is not None]

        p = asPolygon(point_list)

        return p


class ModeType:
    def __init__(self):
        pass

    PEDESTRIAN = 0
    DRIVER = 1


class RangeType:
    def __init__(self):
        pass

    TIME = 'time'
    DISTANCE = 'distance'

# iso_service = HereIsochroneService()
# iso_service.set_mode('fastest;pedestrian;traffic:enabled')
# iso_service.set_range('1000')
# iso_service.set_destination_point('41.20,23,34')
# iso_service.execute()
