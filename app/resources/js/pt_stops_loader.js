/**
 * Created by cancobanoglu on 26.09.2015.
 */

$(document).ready(function () {

    $.ajax
    ({
        url: 'http://localhost:8080/places',
        success: function (data) {
            myItems = data;
            addPlacesToMap();
            $.each(data, function (index, value) {
                alert("index: " + index + " , value: " + value);
            });
        },
        /*
         if dataType not set, the Accept in request header is:
         'Accept': '* / *'
         dataType = json :
         'Accept': 'application/json, text/javascript, * /*; q=0.01'
         */
        dataType: 'json'
    });

});


var platform = new H.service.Platform({
    'app_id': 'bkXkAirxQ6lW0e5DdpqA',
    'app_code': 'sW742GORuOJB1BR9j19_3A'
});

// Instantiate a map inside the DOM element with id map. The
// map center is in San Francisco, the zoom level is 10:
var map = new H.Map(document.getElementById('mapContainer'),
    platform.createDefaultLayers().normal.map, {
        center: {lat: 41.02583, lng: 29.05842},
        zoom: 12
    });

// Enable the event system on the map instance:
var mapEvents = new H.mapevents.MapEvents(map);
// Add event listener:

// Instantiate the default behavior, providing the mapEvents object:
var behavior = new H.mapevents.Behavior(mapEvents);

// Create a group object to hold map markers:
var group = new H.map.Group();

var defaultLayers = platform.createDefaultLayers();

// Create the default UI components:
var ui = H.ui.UI.createDefault(map, defaultLayers);

// Add the group object to the map:
map.addObject(group);
var ic = new H.map.Icon('http://download.st.vcdn.nokia.com/p/d/places2_stg/icons/categories/11.icon');
// This function adds markers to the map, indicating each of
// the located places:
function addPlacesToMap(result) {
    group.addObjects(myItems.map(function (place) {
        var marker = new H.map.Marker({lat: place.position[0], lng: place.position[1]});
        marker.setIcon(ic);
        marker.setData({'title': place.name})
        return marker;
    }));
}

group.addEventListener('tap', function (e) {
    // Save a reference to the clicked spatial object:
    var spatial = e.target;
    // Output meta data for the spatial object to the console:
    console.log(spatial.getPosition());
    var bubbleContent = '<b>' + e.target.getData()['title'] + '</b>';
    console.log(bubbleContent);


    var bubble = new H.ui.InfoBubble({
        lng: spatial.getPosition().lng,
        lat: spatial.getPosition().lat
    }, {content: bubbleContent});
    ui.addBubble(bubble);
});
