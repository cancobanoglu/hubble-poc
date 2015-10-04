__author__ = 'cancobanoglu'
import requests

def do_request_for_reverse_isoline(request_url):
    response = requests.get(request_url)
    data = response.json()
    return data
