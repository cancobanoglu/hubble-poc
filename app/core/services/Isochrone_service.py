from app.core.api_urls import *

__author__ = 'cancobanoglu'


class IsochroneService:
    __access__ = HERE_APP_ACCESS
    param_dict = dict(
        base_url='http://isoline.route.cit.api.here.com/routing',
        version='7.2',
        action="calculateisoline.json",
        mode='fastest;pedestrian;traffic:disabled',
        rangetype='time',
        range='',
        destination=''
    )

    def __init__(self):
        pass

    def set_mode(self, mode):
        self.param_dict['mode'] = mode

    def set_version(self, version):
        self.param_dict['version'] = version

    def set_rangetype(self, type):
        self.param_dict['rangetype'] = type

    def set_range(self, range):
        self.param_dict['range'] = range

    def set_destination_point(self, destination_point):
        self.param_dict['destination'] = destination_point

    def build_isoline_url(self):
        request_url = '%s/%s/%s%s%s%s%s%s%s' % (
            self.param_dict['base_url'],
            self.param_dict['version'],
            self.param_dict['action'],
            '?app_id=' + self.__access__['app_id'],
            '&app_code=' + self.__access__['app_code'],
            '&mode=' + self.param_dict['mode'],
            '&rangetype=' + self.param_dict['rangetype'],
            '&destination=%s' % (self.param_dict['destination']),
            "&range={0}".format(self.param_dict['range'])
        )

        return request_url

    def execute(self):
        url = self.build_isoline_url()

# iso_service = IsochroneService()
# iso_service.set_mode('fastest;pedestrian;traffic:enabled')
# iso_service.set_range('1000')
# iso_service.set_destination_point('41.20,23,34')
# iso_service.execute()


