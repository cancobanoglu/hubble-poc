__author__ = 'cancobanoglu'

import pyproj
from shapely.ops import transform
from functools import partial
from shapely.geometry import asLineString, Point
from shapely.wkt import loads
from geoalchemy2 import WKTElement


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


def lat_lon_buffer(lat, lon, radius_m):
    proj4str = '+proj=aeqd +lat_0=%s +lon_0=%s +x_0=0 +y_0=0' % (lat, lon)
    AEQD = pyproj.Proj(proj4str)
    project = partial(pyproj.transform, AEQD, WGS84)
    return transform(project, Point(0, 0).buffer(radius_m))


def to_shape(wkt):
    return loads(wkt)


def wkt_element(object):
    return WKTElement('SRID=4326; ' + object.wkt)


def within_clause(tablename, latitude, longitude, distance):
    """Return a within clause that explicitly casts the `latitude` and
      `longitude` provided to geography type.
    """

    attr = '%s.location' % tablename

    point = 'POINT(%0.8f %0.8f)' % (longitude, latitude)
    location = "ST_GeographyFromText(E'SRID=4326;%s')" % point

    return 'ST_DWithin(%s, %s, %d)' % (attr, location, distance)


def buffer_clause(wkt, radius_of_buffer):
    """Return a buffered polygon
    """

    clause = "ST_AsText(ST_Buffer(ST_GeographyFromText(E'SRID=4326;%s'),%s)) as buffered_polygon" % (
        wkt, radius_of_buffer)
    print clause

    return clause
