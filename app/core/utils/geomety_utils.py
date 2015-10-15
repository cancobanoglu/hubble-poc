__author__ = 'cancobanoglu'

import pyproj
from shapely.geometry.polygon import asPolygon
from shapely.geometry import box, Polygon
from math import radians, cos, sin, asin, sqrt
from shapely.ops import transform
from functools import partial
from shapely.geometry import asLineString, Point
from shapely.wkt import loads
from geoalchemy2 import WKTElement


def make_linestring(route_shape):
    point_list = [None] * len(route_shape)
    counter = 0

    for point in route_shape:
        lat_lng = [float(coord) for coord in point.split(",")]
        point_list.insert(counter, lat_lng)
        counter += 1

    point_list = [x for x in point_list if x is not None]

    linestring = asLineString(point_list)

    return linestring


def make_polygon(buffered_route_shape):
    point_list = [None] * len(buffered_route_shape)
    counter = 0

    for point in buffered_route_shape:
        lat_lng = [float(coord) for coord in point.split(",")]
        point_list.insert(counter, lat_lng)
        counter += 1

    point_list = [x for x in point_list if x is not None]

    return asPolygon(point_list)


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


def within_clause(table_name, latitude, longitude, distance):
    """Return a within clause that explicitly casts the `latitude` and
      `longitude` provided to geography type.
    """

    attr = '%s.location' % table_name

    point = 'POINT(%0.8f %0.8f)' % (longitude, latitude)
    location = "ST_GeographyFromText(E'SRID=4326;%s')" % point

    return 'ST_DWithin(%s, %s, %d)' % (attr, location, distance)


def buffer_clause(wkt, radius_of_buffer):
    """Return a buffered polygon
    """

    clause = "ST_AsText(ST_Buffer(ST_GeographyFromText(E'SRID=4326;%s'),%s)) as buffered_polygon" % (
        wkt, radius_of_buffer)

    return clause


# def contained_clause_within(wkt):
#     clause = "SELECT p.* FROM poi_place p WHERE ST_Covers(ST_GeographyFromText('%s'), p.location::geography)" % (
#         wkt)
#
#     return clause


def contained_clause_within(wkt):
    clause = "SELECT p.* FROM poi_place p WHERE ST_Covers(ST_GeographyFromText('%s'), ST_GeographyFromText(ST_AsText(ST_MakePoint(p.lat,p.lng))))" % (
        wkt)
    return clause


def distance_between_two_points(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    """

    # Convert latitude and longitude to
    # spherical coordinates in radians.
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # Haversine Formula
    diff_lon = lon2 - lon1
    diff_lat = lat2 - lat1
    a = sin(diff_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(diff_lon / 2) ** 2
    c = 2 * asin(sqrt(a))
    # Remember to multiply arc by the radius of the earth
    # in your favorite set of units to get length.
    meters = 6367 * c * 1000

    return meters


def overlap_polygon(polygon1, polygon2):
    return polygon1.intersects(polygon2)

