from shapely.geometry.point import asPoint
from sqlalchemy.sql.functions import func
from app.core.utils.postgis_utils import intersects_clause, find_places_of_intersected_ones

from json import dumps
import json

from bottle import route, template
from bottle import request  # or route
from bottle import response

from app.core.utils.geomety_utils import *
from app.dao import models
from app.dao.IsochroneDao import *

__author__ = 'cancobanoglu'

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
    # get response body from post request
    response_body = json.load(request.body)
    # route shape A is driver route shape
    route_shape_driver = response_body.get('routeShapeA')
    # route shape B is passenger route shape
    route_shape_passenger = response_body.get('routeShapeB')
    # make a spatial shape of driver route
    line_string_driver = make_linestring(route_shape_driver)
    # make a spatial shape of passenger route
    line_string_passenger = make_linestring(route_shape_passenger)

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

    # pt_stops_clause = within_clause('poi_pt_stop', point_lat, point_lon, radius)
    # print pt_stops_clause
    # query = DBSession.query(models.TagPtStops).filter(pt_stops_clause)
    # pt_stop_list = query.all()
    #
    # for stop in pt_stop_list:
    #     items.append({'position': [stop.lat, stop.lng], 'name': stop.name, 'vicinity': stop.vicinity, 'type': 'PLACE'})

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
    polygon_shape = create_buffered_polygon_of_line(line_string_driver, buff)

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

    return get_response_places_within_area(buffered_route_shape)


@route("/analyze/intersectionArea/places", method='POST')
def find_places_within_intersected_area():
    response_body = json.load(request.body)
    buffered_route_shape = response_body.get('intersected_area')

    return get_response_places_within_area(buffered_route_shape)


@route("/analyze/intersectionArea/availablePlaces", method='POST')
def find_available_places_within_intersected_area():
    '''
    function aims to find available places for driver.
    :return:
    '''
    response_body = json.load(request.body)
    source_ids = response_body.get('source_ids')
    _range = response_body.get('range')
    driver_route_shape = response_body.get('driver_route')
    line_string_driver = make_linestring(driver_route_shape)
    print line_string_driver

    if _range == u'1':
        query = intersects_clause(source_ids, 'driver_one_min_isoline', line_string_driver)
        result = db.get_connection().execute(query)
        return get_response_for_available_places(result)
    elif _range == u'3':
        query = intersects_clause(source_ids, 'driver_three_min_isoline', line_string_driver)
        result = db.get_connection().execute(query)
        return get_response_for_available_places(result)
    elif _range == u'5':
        query = intersects_clause(source_ids, 'driver_five_min_isoline', line_string_driver)
        result = db.get_connection().execute(query)
        return get_response_for_available_places(result)


def get_response_for_available_places(fetched_results):
    places = []
    for row in fetched_results:
        print row.source_id
        places.append(row.source_id)

    resp = dict()
    resp['available_place_id_list'] = places

    response.content_type = 'application/json'
    return dumps(resp)


def get_response_for_places(place_list):
    items = []
    for place in place_list:
        items.append(
            {'position': [place.lat, place.lng], 'name': place.name, 'category': place.category, 'type': 'PLACE',
             'source_id': place.here_id})

    resp = dict()
    resp['items'] = items

    response.content_type = 'application/json'
    return dumps(resp)


@route("/analyze/intersectionArea", method='POST')
def filter_remove_outer_places():
    response_body = json.load(request.body)

    isoline_area = response_body.get('isoline_area')
    isoline_polygon = make_polygon(isoline_area)

    buffered_route_area = response_body.get('buffered_area')
    buffered_route_polygon = make_polygon(buffered_route_area)

    intersected_area = buffered_route_polygon.intersection(isoline_polygon)

    polygon = to_polygon_tuple_array(intersected_area.exterior.coords)

    clause = contained_clause_within(intersected_area.wkt)

    data = db.get_connection().execute(clause)

    places = []
    for row in data:
        places.append({'name': row.name, 'position': [row.lat, row.lng], 'source_id': row.here_id})

    resp = dict()
    resp['shape'] = polygon
    resp['places'] = places

    response.content_type = 'application/json'
    return dumps(resp)


def find_places_within_polygon(polygon):
    clause = contained_clause_within(polygon.wkt)
    data = db.get_connection().execute(clause)
    return data


def get_response_places_within_area(area_shape):
    polygon = make_polygon(area_shape)

    data = find_places_within_polygon(polygon)

    items = []
    for row in data:
        items.append({'name': row.name, 'position': [row.lat, row.lng], 'source_id': row.here_id})

    resp = dict()
    resp['items'] = items

    return resp


@route("/analyze/isoline/<place_id>")
def get_isolines(place_id):
    isoline = isochrone_dao.find_by_id(place_id)

    one_min_polygon = to_shape(isoline.driver_one_min_isoline)
    three_min_polygon = to_shape(isoline.driver_three_min_isoline)
    five_min_polygon = to_shape(isoline.driver_five_min_isoline)

    one_min_polygon_tuple_arr = to_polygon_tuple_array(one_min_polygon.exterior.coords)
    three_min_polygon_tuple_arr = to_polygon_tuple_array(three_min_polygon.exterior.coords)
    five_min_polygon_tuple_arr = to_polygon_tuple_array(five_min_polygon.exterior.coords)

    shapes = {'one_min_shape': one_min_polygon_tuple_arr, 'three_min_shape': three_min_polygon_tuple_arr,
              'five_min_shape': five_min_polygon_tuple_arr}

    resp = dict()
    resp['shapes'] = shapes

    response.content_type = 'application/json'
    return dumps(resp)


@route("/analyze/intersection/distance", method='POST')
def distance_to_intersection():
    response_body = json.load(request.body)
    lat1 = response_body.get('intersectionPointLat')
    lon1 = response_body.get('intersectionPointLng')
    lat2 = response_body.get('passengerStartPointLat')
    lon2 = response_body.get('passengerEndPointLng')

    distance = distance_between_two_points(lat1, lon1, lat2, lon2)

    resp = dict()
    item = {'distancePedestrianRoute': distance}
    resp['item'] = item

    response.content_type = 'application/json'
    return dumps(resp)


@route("/analyze/intersection/polygon", method='POST')
def get_intersection_of_polygons():
    response_body = json.load(request.body)
    polygon1 = response_body.get('polygon1')
    polygon2 = response_body.get('polygon2')

    intersect_poly = get_intersection_of_polygons(polygon1, polygon2)
    resp = dict()
    item = {'intersectPoly': intersect_poly}
    resp['item'] = item

    response.content_type = 'application/json'
    return dumps(resp)


@route("/analyze/suggest", method='POST')
def suggest_places():
    response_body = json.load(request.body)
    route_shape_driver = response_body.get('driverRouteShape')
    passenger_start_point = response_body.get('passengerStartPoint')
    intersection_point = response_body.get('intersectionPoint')
    detour_range = response_body.get('detourRange')
    radius_buffered_area = response_body.get('radiusOfBuffer')

    # create buffer area using radius
    line_string_driver = make_linestring(route_shape_driver)
    buffered_route = create_buffered_polygon_of_line(line_string_driver, radius_buffered_area)

    passenger_point = Point(passenger_start_point[0], passenger_start_point[1])
    intersection_p = Point(intersection_point[0], intersection_point[1])

    radius_of_circle = distance(passenger_point, intersection_p)
    circle_polygon = create_circle_polygon(passenger_point, radius_of_circle)

    # find intersections
    intersected_area_of_circle_and_buffer = circle_polygon.intersection(buffered_route)

    # find places within intersected area
    places = find_places_within_polygon(intersected_area_of_circle_and_buffer)

    source_ids = object_to_ids(places)

    if detour_range == u'1':
        query = find_places_of_intersected_ones(source_ids, 'driver_one_min_isoline', line_string_driver)
        result = db.get_connection().execute(query)
        return get_response_for_places(result)
    elif detour_range == u'3':
        query = find_places_of_intersected_ones(source_ids, 'driver_three_min_isoline', line_string_driver)
        result = db.get_connection().execute(query)
        return get_response_for_places(result)
    elif detour_range == u'5':
        query = find_places_of_intersected_ones(source_ids, 'driver_five_min_isoline', line_string_driver)
        result = db.get_connection().execute(query)
        return get_response_for_places(result)


def object_to_ids(places):
    ids = []
    for row in places:
        ids.append(row.here_id)

    return ids


@route("/analyze/circle", method='POST')
def circle_radius():
    response_body = json.load(request.body)
    passenger_start_point = response_body.get('passengerStartPoint')
    intersection_point = response_body.get('intersectionPoint')

    passenger_point = Point(passenger_start_point[0], passenger_start_point[1])

    radius = distance(passenger_point,
                      Point(intersection_point[0], intersection_point[1]))

    circle_polygon = create_circle_polygon(passenger_point, radius)

    polygon_point_array = to_polygon_tuple_array(circle_polygon.exterior.coords)

    resp = dict()

    resp['radius'] = radius
    resp['shape'] = polygon_point_array

    response.content_type = 'application/json'
    return dumps(resp)

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
