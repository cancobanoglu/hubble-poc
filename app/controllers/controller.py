__author__ = 'cancobanoglu'

import config, bottle

from bottle import route, run, template, view
from bottle import get, post, request # or route

from bottle import error
from app.core.fetcher import *
from shapely.geometry import asLineString, Point
import json

import pyproj
from shapely.ops import transform
from functools import partial





@route('/place')
@view('pt_stops')
def hello(name='World'):
    return dict(name=name)


@route('/calculateIntersection', method='POST')
def calculateIntersection():
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

    return {'success': True, 'first_intersected_point': {'lat':lat, 'lng':lng}}


def build_linestring(routeShape):
    point_list = [None] * len(routeShape)
    counter = 0

    for point in routeShape:
        lat_lng = [float(coord) for coord in point.split(",")]
        point_list.insert(counter, lat_lng)
        counter += 1

    point_list = [x for x in point_list if x is not None]

    linestring = asLineString(point_list)
    return  linestring


WGS84 = pyproj.Proj(init='epsg:4326')

def latlonbuffer(lat, lon, radius_m):
    proj4str = '+proj=aeqd +lat_0=%s +lon_0=%s +x_0=0 +y_0=0' % (lat, lon)
    AEQD = pyproj.Proj(proj4str)
    project = partial(pyproj.transform, AEQD, WGS84)
    return transform(project, Point(0, 0).buffer(radius_m))


@route('/places', method='GET')
def get_places():
    from bottle import response
    from json import dumps

    pt_stops = find_places()

    resp = [{'position': [41.02, 29.06013]}]

    for stop in pt_stops:
        resp.append({'position':[stop.lat, stop.lng], 'name':stop.name })

    response.content_type = 'application/json'
    return dumps(resp)



