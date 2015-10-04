/**
 * Created by cancobanoglu on 26.09.2015.
 */

// Instantiate the Platform class:
var platform = new H.service.Platform({
    'app_id': 'bkXkAirxQ6lW0e5DdpqA',
    'app_code': 'sW742GORuOJB1BR9j19_3A'
});

// Obtain a Categories object through which to submit search requests:
var categories = new H.places.Categories(platform.getPlacesService()),
    categoriesResponse, error;

// Define search parameters:
var params = {
//  Location context that indicates the search is in Berlin
    'at': '52.521,13.3807'
  },
//  Headers object required by the request() method (empty):
  headers = {};

// Run a request for categories, using the parameters, headers, and
// callback functions:
categories.request(params, headers, onResult, onError);

// Success handler - fetch the first set of detailed place data from
// the response:
function onResult(data) {
  categoriesResponse = data;
}

// Define a callback to handle errors:
function onError(data) {
  error = data;
}