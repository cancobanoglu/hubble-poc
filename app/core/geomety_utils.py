__author__ = 'cancobanoglu'


import pyproj
from shapely.ops import transform
from functools import partial
from shapely.geometry import asLineString, Point
from geoalchemy2.shape import from_shape
from shapely.wkt import loads


def make_linestring(routeShape):
    point_list = [None] * len(routeShape)
    counter = 0

    for point in routeShape:
        lat_lng = [float(coord) for coord in point.split(",")]
        point_list.insert(counter, lat_lng)
        counter += 1

    point_list = [x for x in point_list if x is not None]

    linestring = asLineString(point_list)

    return linestring


WGS84 = pyproj.Proj(init='epsg:4326')

def latlonbuffer(lat, lon, radius_m):
    proj4str = '+proj=aeqd +lat_0=%s +lon_0=%s +x_0=0 +y_0=0' % (lat, lon)
    AEQD = pyproj.Proj(proj4str)
    project = partial(pyproj.transform, AEQD, WGS84)
    return transform(project, Point(0, 0).buffer(radius_m))


def to_shape(wkt):
    return loads(wkt)