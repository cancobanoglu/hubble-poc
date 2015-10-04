/**
 * Created by cancobanoglu on 26.09.2015.
 */

var colors = ['blue', 'green', 'red', 'grey', '#FF4433', '#CC0022', '#B00022', '#180022', '#FA0022', '#E5FFCC'];

function random() {
    return Math.floor((Math.random() * 10));
}

var platform = new H.service.Platform({
    'app_id': 'bkXkAirxQ6lW0e5DdpqA',
    'app_code': 'sW742GORuOJB1BR9j19_3A'
});

var intersectionPointLat, intersectionPointLong;

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

var defaultLayers = platform.createDefaultLayers();


// Create the default UI components:
var ui = H.ui.UI.createDefault(map, defaultLayers);

// Create a group object to hold map markers:
var group = new H.map.Group();
// Add the group object to the map:
map.addObject(group);


var routeStartA, routeEndA, routeStartB, routeEndB, routeShapeA, routeShapeB;

var routingParameters = {
    // The routing mode:
    'mode': 'fastest;car',
    // The start point of the route:
    'waypoint0': '',
    // The end point of the route:
    'waypoint1': '',
    // To retrieve the shape of the route we choose the route
    // representation mode 'display'
    'representation': 'display'
};

// Define a callback function to process the routing response:
var onResultA = function (result) {
    var route,
        routeShape,
        startPoint,
        endPoint,
        strip;
    if (result.response.route) {
        // Pick the first route from the response:
        route = result.response.route[0];
        // Pick the route's shape:
        routeShape = route.shape;
        // Create a strip to use as a point source for the route line
        strip = new H.geo.Strip();
        // Push all the points in the shape into the strip:
        routeShape.forEach(function (point) {
            var parts = point.split(',');
            strip.pushLatLngAlt(parts[0], parts[1]);
        });
        routeShapeA = routeShape;
        setInput('routeShapeA', routeShape);
        // Retrieve the mapped positions of the requested waypoints:
        startPoint = route.waypoint[0].mappedPosition;
        endPoint = route.waypoint[1].mappedPosition;
        // Create a polyline to display the route:
        randomColor = colors[random()];
        var routeLine = new H.map.Polyline(strip, {
            style: {strokeColor: randomColor, lineWidth: 7},
            arrows: {fillColor: 'white', frequency: 2, width: 0.5, length: 0.7}
        });
        // Create a marker for the start point:
        var startMarker = new H.map.Marker({
            lat: startPoint.latitude,
            lng: startPoint.longitude
        });
        // Create a marker for the end point:
        var endMarker = new H.map.Marker({
            lat: endPoint.latitude,
            lng: endPoint.longitude
        });

        // Add the route polyline and the two markers to the map:
        map.addObjects([routeLine, startMarker, endMarker]);
        // Set the map's viewport to make the whole route visible:
        map.setViewBounds(routeLine.getBounds());
    }
};

var onResultB = function (result) {
    var route,
        routeShape,
        startPoint,
        endPoint,
        strip;
    if (result.response.route) {
        // Pick the first route from the response:
        route = result.response.route[0];
        // Pick the route's shape:
        routeShape = route.shape;
        // Create a strip to use as a point source for the route line
        strip = new H.geo.Strip();
        // Push all the points in the shape into the strip:
        routeShape.forEach(function (point) {
            var parts = point.split(',');
            strip.pushLatLngAlt(parts[0], parts[1]);
        });
        routeShapeB = routeShape;
        setInput('routeShapeB', routeShape);
        // Retrieve the mapped positions of the requested waypoints:
        startPoint = route.waypoint[0].mappedPosition;
        endPoint = route.waypoint[1].mappedPosition;
        // Create a polyline to display the route:
        randomColor = colors[random()];
        var routeLine = new H.map.Polyline(strip, {
            style: {strokeColor: randomColor, lineWidth: 7},
            arrows: {fillColor: 'white', frequency: 2, width: 0.5, length: 0.7}
        });
        // Create a marker for the start point:
        var startMarker = new H.map.Marker({
            lat: startPoint.latitude,
            lng: startPoint.longitude
        });
        // Create a marker for the end point:
        var endMarker = new H.map.Marker({
            lat: endPoint.latitude,
            lng: endPoint.longitude
        });

        // Add the route polyline and the two markers to the map:
        map.addObjects([routeLine, startMarker, endMarker]);
        // Set the map's viewport to make the whole route visible:
        map.setViewBounds(routeLine.getBounds());
    }
};

// Get an instance of the routing service:
var router = platform.getRoutingService();
// Call calculateRoute() with the routing parameters,
// the callback and an error callback function (called if a
// communication error occurs):


map.addEventListener('tap', function (event) {

    var click_coords = eventToLocation(event);

    if (routeStartA == null) {
        routeStartA = new H.map.Marker(click_coords);
        group.addObject(routeStartA);
        routingParameters.waypoint0 = routeStartA.getPosition().lat + ',' + routeStartA.getPosition().lng;
        setInput('routeStartA', routingParameters.waypoint0);
    } else if (routeEndA == null) {
        routeEndA = new H.map.Marker(click_coords);
        group.addObject(routeEndA);
        routingParameters.waypoint1 = routeEndA.getPosition().lat + ',' + routeEndA.getPosition().lng;
        setInput('routeEndA', routingParameters.waypoint1);
        drawRouteA();

    } else if (routeStartB == null) {
        routeStartB = new H.map.Marker(click_coords);
        group.addObject(routeStartB);
        routingParameters.waypoint0 = routeStartB.getPosition().lat + ',' + routeStartB.getPosition().lng;
        setInput('routeStartB', routingParameters.waypoint0);
    } else if (routeEndB == null) {
        routeEndB = new H.map.Marker(click_coords);
        group.addObject(routeEndB);
        routingParameters.waypoint1 = routeEndB.getPosition().lat + ',' + routeEndB.getPosition().lng;
        setInput('routeEndB', routingParameters.waypoint1);
        drawRouteB();

    }
});

function drawRouteA() {
    router.calculateRoute(routingParameters, onResultA,
        function (error) {
            alert(error.message);
        });
}

function drawRouteB() {
    router.calculateRoute(routingParameters, onResultB,
        function (error) {
            alert(error.message);
        });
}

function eventToLocation(event) {
    return map.screenToGeo(event.currentPointer.viewportX, event.currentPointer.viewportY);
}

function clearObjects() {
    group.removeObjects([pointA, pointB]);
    pointA = null;
    pointB = null;
}


function setInput(inputId, value) {

    var elem = document.getElementById(inputId);
    elem.value = value;
}

function putFirstIntersectedPoint(latitude, longitude) {
    intersectionPointLat = latitude;
    intersectionPointLong = longitude;

    var ic = new H.map.Icon('http://download.st.vcdn.nokia.com/p/d/places2_stg/icons/categories/21.icon');
    var intersectionPointMarker = new H.map.Marker({
        lat: latitude,
        lng: longitude
    }, {icon: ic});
    group.addObject(intersectionPointMarker);
    map.setCenter({lat: latitude, lng: longitude});
    map.setZoom(15);
}


$("#submitBtn").click(function () {
    //var routeShapeA = $('#routeShapeA').val();
    //var routeShapeB = $('#routeShapeB').val();

    $.ajax({
        url: '/analyze/calculateIntersection',
        type: 'POST',
        data: JSON.stringify({'routeShapeA': routeShapeA, 'routeShapeB': routeShapeB}),
        success: function (result) {
            console.log(result.first_intersected_point.lat);
            putFirstIntersectedPoint(result.first_intersected_point.lat, result.first_intersected_point.lng);
            if (result.success == false) {
                alert("asdasa");
            }
        },
        error: function (result) {
            alert("Something is not OK")
        },
    });


});


$("#findPlacesSimpleBtn").click(function () {
    var radius = $('#radiusInput').val();
    addSimpleCircle(radius);
    $.ajax({
        url: '/analyze/basicWithinPlaces?radius=' + radius + '&lat=' + intersectionPointLat + '&lon=' + intersectionPointLong,
        type: 'GET',
        success: function (result) {
            var items = result.items;
            console.log(items);
            addPlacesToMap(items);
        },
        error: function (result) {
            alert("Something is not OK")
        },
    });
});

function addPlacesToMap(result) {
    result.forEach(addMarker);
}

function addMarker(item) {
// Define a variable holding SVG mark-up that defines an icon image:
    var markupTemplate = '<svg xmlns="http://www.w3.org/2000/svg" width="28px" height="36px"><path d="M 19 31 C 19 32.7 16.3 34 13 34 C 9.7 34 7 32.7 7 31 C 7 29.3 9.7 28 13 28 C 16.3 28 19 29.3 19 31 Z" fill="#000" fill-opacity=".2"/><path d="M 13 0 C 9.5 0 6.3 1.3 3.8 3.8 C 1.4 7.8 0 9.4 0 12.8 C 0 16.3 1.4 19.5 3.8 21.9 L 13 31 L 22.2 21.9 C 24.6 19.5 25.9 16.3 25.9 12.8 C 25.9 9.4 24.6 6.1 22.1 3.8 C 19.7 1.3 16.5 0 13 0 Z" fill="#fff"/><path d="M 13 2.2 C 6 2.2 2.3 7.2 2.1 12.8 C 2.1 16.1 3.1 18.4 5.2 20.5 L 13 28.2 L 20.8 20.5 C 22.9 18.4 23.8 16.2 23.8 12.8 C 23.6 7.07 20 2.2 13 2.2 Z" fill="#18d"/><text x="13" y="19" font-size="12pt" font-weight="bold" text-anchor="middle" fill="#fff">${text}</text></svg>';

    // Set your text here.
    var text = 'B';

    var markup = markupTemplate.replace('${text}', text);

// Create an icon, an object holding the latitude and longitude, and a marker:
    var icon = new H.map.Icon(markup);

    var marker = new H.map.Marker({lat: item.position[0], lng: item.position[1]}, {icon: icon});
    marker.setData({'title': item.name});
    marker.addEventListener('tap', function (e) {
        var spatial = e.target;
        // Output meta data for the spatial object to the console:
        console.log(spatial.getPosition());
        var bubbleContent = '<b style="font-size:8px;">' + e.target.getData()['title'] + '</b>';
        console.log(bubbleContent);


        var bubble = new H.ui.InfoBubble({
            lng: spatial.getPosition().lng,
            lat: spatial.getPosition().lat
        }, {content: bubbleContent});
        ui.addBubble(bubble);
    });
    group.addObject(marker);
}


$("[name='traffic-condition']").bootstrapSwitch('state');
$("[name='role']").bootstrapSwitch('state');
$("[name='range-type']").bootstrapSwitch('state');
$("[name='calculation-type']").bootstrapSwitch('state');
$("[name='isoline-point']").bootstrapSwitch('state');
$('select').selectpicker();

$('.rangeTypeSwitch').on('switchChange.bootstrapSwitch', function (event, state) {
    if (state) {
        $("#timeDiv").removeClass('hidden');
        $("#distanceDiv").addClass('hidden');
    } else {
        $("#timeDiv").addClass('hidden');
        $("#distanceDiv").removeClass('hidden');
    }
});


$('.rangeTypeSwitch').on('switchChange.bootstrapSwitch', function (event, state) {
    if (state) {
        $("#timeDiv").removeClass('hidden');
        $("#distanceDiv").addClass('hidden');
    } else {
        $("#timeDiv").addClass('hidden');
        $("#distanceDiv").removeClass('hidden');
    }
});

$("#clearBtn").click(function () {
    location.reload();
});

var isolineParameters = {
    'mode': '',
    'start': '',
    'quality': '1'
}

var onIsolineResult = function (result) {
    var center = new H.geo.Point(
            result.Response.Center.Latitude,
            result.Response.Center.Longitude),
        isolineCoords = result.Response.isolines[0].value,
        strip = new H.geo.Strip(),
        isolinePolygon,
        isolineCenter;
// Add the returned isoline coordinates to a strip:
    isolineCoords.forEach(function (coords) {
        strip.pushLatLngAlt.apply(strip, coords.split(','));
    });
// Create a polygon and a marker representing the isoline:
    isolinePolygon = new H.map.Polygon(strip);
    isolineCenter = new H.map.Marker(center);
    // Add the polygon and marker to the map:
    map.addObjects([isolineCenter, isolinePolygon]);
// Center and zoom the map so that the whole isoline polygon is
// in the viewport:
    map.setViewBounds(isolinePolygon.getBounds());
};

$("#drawIsochroneBtn").click(function () {
    var isolineFor = $("[name='isoline-point']").bootstrapSwitch('state');

    // isolineFor true means that polygon will be calculated for intersection point
    // otherwise it will be for passenger
    if (isolineFor) {
        isolineParameters.start = intersectionPointLat + ',' + intersectionPointLong;
    } else {
        isolineParameters.start = routeStartA.getPosition().lat + ',' + routeStartA.getPosition().lng;
    }


    var rangeType = $("[name='range-type']").bootstrapSwitch('state');
    var traficCondition = $("[name='traffic-condition']").bootstrapSwitch('state');
    var roleType = $("[name='role']").bootstrapSwitch('state');

    // if true time is enbaled
    if (rangeType) {
        var timeRangeInput = $('#timeRangeInput').val();
        isolineParameters.time = timeRangeInput;
    } else {
        var distanceRangeInput = $('#distanceRangeInput').val();
        isolineParameters.distance = distanceRangeInput;
        isolineParameters.rangetype = 'distance';
    }

    var data = [];
    var $el = $(".selectpicker");
    $el.find('option:selected').each(function () {
        data.push({value: $(this).val(), text: $(this).text()});
    });

    console.log(data);

    if (roleType) {
        if (traficCondition) {

            var mode = 'fastest;car;traffic:enabled';
            isolineParameters.mode = mode;
        } else {
            var mode = 'fastest;car;traffic:disabled';
            isolineParameters.mode = mode;
        }
    }
    else {
        var mode = 'shortestWalk;pedestrian';
        isolineParameters.mode = mode;
    }

    // Get an instance of the enterprise routing service:
    var enterpriseRouter = platform.getEnterpriseRoutingService();
// Call the Enterprise Routing API to calculate an isoline:
    enterpriseRouter.calculateIsoline(
        isolineParameters,
        onIsolineResult,
        function (error) {
            alert(error.message);
        }
    );
});

$("#resetDrawedOnes").click(function () {
    var mapObjects = map.getObjects();
    mapObjects.forEach(function (object) {
        if (object instanceof H.map.Polygon) {
            map.removeObject(object);
        }
    });
});


function addSimpleCircle(radius) {
    var customStyle = {
        strokeColor: 'blue',
        fillColor: 'rgba(232, 240, 247, 0.5',
        lineWidth: 2,
        lineCap: 'square',
        lineJoin: 'bevel'
    };
    // Instantiate a circle object (using the default style):
    var circle = new H.map.Circle({
        lat: intersectionPointLat,
        lng: intersectionPointLong
    }, radius, {style: customStyle});
// Add the circle to the map:
    map.addObject(circle);
}