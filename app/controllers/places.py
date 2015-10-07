__author__ = 'cancobanoglu'

from bottle import route, run, template, view
from app.core.fetcher import *


@route('/place')
@view('pt_stops')
def index(name='World'):
    return dict(name=name)


@route('/places', method='GET')
def get_places():
    from bottle import response
    from json import dumps

    pt_stops = find_places()

    resp = []

    for stop in pt_stops:
        resp.append({'position': [stop.lat, stop.lng], 'name': stop.name})

    response.content_type = 'application/json'
    return dumps(resp)
