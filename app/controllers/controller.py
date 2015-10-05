__author__ = 'cancobanoglu'

from bottle import route, run, template, view
from bottle import get, post, request  # or route

from bottle import error
from app.core.fetcher import *
from app.core.geomety_utils import *
import json


@route('/place')
@view('pt_stops')
def hello(name='World'):
    return dict(name=name)


@route('/places', method='GET')
def get_places():
    from bottle import response
    from json import dumps

    pt_stops = find_places()

    resp = [{'position': [41.02, 29.06013]}]

    for stop in pt_stops:
        resp.append({'position': [stop.lat, stop.lng], 'name': stop.name})

    response.content_type = 'application/json'
    return dumps(resp)
