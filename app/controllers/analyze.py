from shapely.geometry.point import asPoint

__author__ = 'cancobanoglu'

from json import dumps
import json

from bottle import route, template
from bottle import request  # or route
from bottle import response

from app.core.utils.geomety_utils import *
# from app.core.fetcher import *
from app.dao import db, models
from app.dao.IsochroneDao import *

isochrone_dao = IsochroneDao()
DBSession = db.get_session()


@route('/analyze')
def index():
    return template('analyze')


@route('/analyze/bufferedArea')
def index_buffered_area():
    return template('analyze_route_buffer')


@route('/analyze/intersection', method='POST')
def calculate_intersection():
    response_body = json.load(request.body)
    route_shape_driver = response_body.get('routeShapeA')
    route_shape_passenger = response_body.get('routeShapeB')

    line_string_driver = make_linestring(route_shape_driver)
    print line_string_driver
    line_string_passenger = make_linestring(route_shape_passenger)
    print line_string_passenger

    intersected_shapes = line_string_driver.buffer(0.00001).intersection(line_string_passenger.buffer(0.00001))

    point = None

    for _p in route_shape_passenger:
        point = asPoint([float(coord) for coord in _p.split(",")])
        if point.within(intersected_shapes):
            break

    print 'first intersected point ::: ' + point.wkt

    lat = point.x
    lng = point.y

    return {'success': True, 'first_intersected_point': {'lat': lat, 'lng': lng}}


@route("/analyze/places/within")
def within():
    radius = int(request.GET.get('radius'))

    point_lat = float(request.GET.get('lat'))
    point_lon = float(request.GET.get('lon'))

    clause = within_clause('poi_place', point_lat, point_lon, radius)
    print clause
    query = DBSession.query(models.TagPlaces).filter(clause)
    place_list = query.all()

    items = []
    for place in place_list:
        items.append(
            {'position': [place.lat, place.lng], 'name': place.name, 'category': place.category, 'type': 'PLACE'})

    pt_stops_clause = within_clause('poi_pt_stop', point_lat, point_lon, radius)
    print pt_stops_clause
    query = DBSession.query(models.TagPtStops).filter(pt_stops_clause)
    pt_stop_list = query.all()

    for stop in pt_stop_list:
        items.append({'position': [stop.lat, stop.lng], 'name': stop.name, 'vicinity': stop.vicinity, 'type': 'PLACE'})

    resp = dict()
    resp['items'] = items

    response.content_type = 'application/json'
    return dumps(resp)


@route("/analyze/route/buffer", method='POST')
def buffered_route_polygon():
    response_body = json.load(request.body)
    buff = response_body.get('buffer')
    route_shape_driver = response_body.get('routeShapeA')

    line_string_driver = make_linestring(route_shape_driver)
    buffered_route_clause = 'SELECT ' + buffer_clause(line_string_driver, buff)

    result = db.get_connection().execute(buffered_route_clause)
    data = result.fetchone()
    polygon_shape = to_shape(data[0])

    polygon = []
    for point_tuple in polygon_shape.exterior.coords:
        polygon.append(str(point_tuple[0]) + ',' + str(point_tuple[1]))

    resp = dict()
    resp['items'] = polygon

    response.content_type = 'application/json'
    return dumps(resp)


@route("/analyze/route/buffer/places", method='POST')
def places_within_buffer():
    response_body = json.load(request.body)
    buffered_route_shape = response_body.get('buffered_area')

    polygon = make_polygon(buffered_route_shape)

    clause = contains_clause_within_polyhon(polygon.wkt)

    data = db.get_connection().execute(clause)

    items = []
    for row in data:
        items.append({'name': row.name, 'position': [row.lat, row.lng], 'source_id': row.here_id})

    resp = dict()
    resp['items'] = items

    response.content_type = 'application/json'
    return dumps(resp)


@route("/analyze/route/buffer/isolines/<range>", method='POST')
def get_isoline_of_places(range):
    print range
    response_body = json.load(request.body)
    source_ids = response_body.get('source_ids')

    isochrone_dao.find_by_source_ids(range, source_ids)


#
# a = buffer_clause(
#     'LINESTRING (41.0509184 29.0764277, 41.0502112 29.0764761, 41.0497606 29.0764868, 41.0493422 29.0764117)',
#     10)
#
# buffered_route_clause = 'SELECT ' + a
#
# print buffered_route_clause
#
# result = get_connection().execute(buffered_route_clause)
#
# data = result.fetchone()
#
# print data[0]
#
# polygon = to_shape(data[0])
#
# print polygon.exterior.coords[0]
#
# for point_tuple in polygon.exterior.coords:
#         print point_tuple
