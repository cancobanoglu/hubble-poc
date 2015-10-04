from geoalchemy2.shape import from_shape

__author__ = 'cancobanoglu'

from bottle import route, template, view
from bottle import get, post, request  # or route

from app.core.fetcher import *
from shapely.geometry import asLineString, Point
from geoalchemy2.functions import GenericFunction
from sqlalchemy import func, select
from bottle import response
from json import dumps
import json

DBSession = get_session()


@route('/analyze')
def index():
    return template('analyze')


@route('/analyze/calculateIntersection', method='POST')
def calculate_intersection():
    response_body = json.load(request.body)
    routeShapeA = response_body.get('routeShapeA')
    routeShapeB = response_body.get('routeShapeB')

    line_string_a = build_linestring(routeShapeA)
    line_string_b = build_linestring(routeShapeB)

    intersected_shapes = line_string_a.buffer(0.00001).intersection(line_string_b.buffer(0.00001))

    # from shapely.geometry import GeometryCollection, shape
    #
    # intersected_points = [elem for elem in intersected_shapes if shape(elem).type == 'Point']
    #
    global point

    for _p in routeShapeA:
        point = asPoint([float(coord) for coord in _p.split(",")])
        if point.within(intersected_shapes):
            break

    print 'first intersected point ::: ' + point.wkt

    lat = point.x
    lng = point.y

    return {'success': True, 'first_intersected_point': {'lat': lat, 'lng': lng}}


def build_linestring(routeShape):
    point_list = [None] * len(routeShape)
    counter = 0

    for point in routeShape:
        lat_lng = [float(coord) for coord in point.split(",")]
        point_list.insert(counter, lat_lng)
        counter += 1

    point_list = [x for x in point_list if x is not None]

    linestring = asLineString(point_list)
    return linestring


@route("/analyze/basicWithinPlaces")
def within():
    radius = int(request.GET.get('radius'))

    point_lat = float(request.GET.get('lat'))
    point_lon = float(request.GET.get('lon'))

    point = Point(point_lat, point_lon)
    point_wkb = from_shape(point, srid=4326)

    clause = within_clause('poi_place', point_lat, point_lon, radius)
    print clause
    query = DBSession.query(TagPlaces).filter(clause)
    place_list = query.all()

    items = []
    for place in place_list:
        items.append({'position': [place.lat, place.lng], 'name': place.name, 'category': place.category})

    resp = dict()
    resp['items'] = items

    response.content_type = 'application/json'
    return dumps(resp)


def within_clause(tablename, latitude, longitude, distance):
    """Return a within clause that explicitly casts the `latitude` and
      `longitude` provided to geography type.
    """

    attr = '%s.location' % tablename

    point = 'POINT(%0.8f %0.8f)' % (longitude, latitude)
    location = "ST_GeographyFromText(E'SRID=4326;%s')" % point

    return 'ST_DWithin(%s, %s, %d)' % (attr, location, distance)
