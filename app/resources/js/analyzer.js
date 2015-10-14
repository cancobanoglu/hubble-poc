/**
 * Created by cancobanoglu on 26.09.2015.
 */
(function () {
    $("[name='traffic-condition']").bootstrapSwitch('state');
    $("[name='role']").bootstrapSwitch('state');
    $("[name='range-type']").bootstrapSwitch('state');
    $("[name='calculation-type']").bootstrapSwitch('state');
    $("[name='isoline-point']").bootstrapSwitch('state');
    $("[name='route-type']").bootstrapSwitch('state');
    $('select').selectpicker();

    var colorRed = 'red';
    var colorBlue = 'blue';
    var intersectionPointLat, intersectionPointLong;

    var polygonAroundIntersectionPoint;
    var polygon5MinsDriver;

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

    var defaultLayers = platform.createDefaultLayers();


    // Create the default UI components:
    var ui = H.ui.UI.createDefault(map, defaultLayers);

    // Create a group object to hold map markers:
    var group = new H.map.Group();
    // Add the group object to the map:
    map.addObject(group);

    var driverRouteStart, driverRouteEnd, passengerRouteStart, passengerRouteEnd, driverRouteShape, passengerRouteShape, passangerRouteLine;

    var bufferedRoutePolygon;

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

    var intersectionPointMarker;

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
            driverRouteShape = routeShape;
            setInput('routeShapeA', routeShape);
            // Retrieve the mapped positions of the requested waypoints:
            startPoint = route.waypoint[0].mappedPosition;
            endPoint = route.waypoint[1].mappedPosition;
            // Create a polyline to display the route:
            var routeLine = new H.map.Polyline(strip, {
                style: {strokeColor: colorRed, lineWidth: 7},
                arrows: {fillColor: 'white', frequency: 2, width: 0.5, length: 0.7}
            });
            //// Create a marker for the start point:
            //var startMarker = new H.map.Marker({
            //    lat: startPoint.latitude,
            //    lng: startPoint.longitude
            //});
            //// Create a marker for the end point:
            //var endMarker = new H.map.Marker({
            //    lat: endPoint.latitude,
            //    lng: endPoint.longitude
            //});

            // Add the route polyline and the two markers to the map:
            map.addObjects([routeLine]);
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
            passengerRouteShape = routeShape;
            setInput('routeShapeB', routeShape);
            // Retrieve the mapped positions of the requested waypoints:
            startPoint = route.waypoint[0].mappedPosition;
            endPoint = route.waypoint[1].mappedPosition;
            // Create a polyline to display the route:
            passangerRouteLine = new H.map.Polyline(strip, {
                style: {strokeColor: colorBlue, lineWidth: 7},
                arrows: {fillColor: 'white', frequency: 2, width: 0.5, length: 0.7}
            });
            //// Create a marker for the start point:
            //var startMarker = new H.map.Marker({
            //    lat: startPoint.latitude,
            //    lng: startPoint.longitude
            //});
            //// Create a marker for the end point:
            //var endMarker = new H.map.Marker({
            //    lat: endPoint.latitude,
            //    lng: endPoint.longitude
            //});

            // Add the route polyline and the two markers to the map:
            map.addObjects([passangerRouteLine]);
            // Set the map's viewport to make the whole route visible:
            map.setViewBounds(passangerRouteLine.getBounds());
        }
    };

// Get an instance of the routing service:
    var router = platform.getRoutingService();
// Call calculateRoute() with the routing parameters,
// the callback and an error callback function (called if a
// communication error occurs):


    map.addEventListener('tap', function (event) {

        var click_coords = eventToLocation(event);

        if (driverRouteStart == null) {
            driverRouteStart = getCustomMarker(click_coords.lat, click_coords.lng, 'SB', 'Sürücünün başlangıç noktası', '', 'http://icons.iconarchive.com/icons/icons8/windows-8/24/Transport-Driver-icon.png');
            group.addObject(driverRouteStart);
            routingParameters.waypoint0 = driverRouteStart.getPosition().lat + ',' + driverRouteStart.getPosition().lng;
            setInput('routeStartA', routingParameters.waypoint0);
        } else if (driverRouteEnd == null) {
            driverRouteEnd = new H.map.Marker(click_coords);
            group.addObject(driverRouteEnd);
            routingParameters.waypoint1 = driverRouteEnd.getPosition().lat + ',' + driverRouteEnd.getPosition().lng;
            setInput('routeEndA', routingParameters.waypoint1);
            drawRouteA();

        } else if (passengerRouteStart == null) {
            passengerRouteStart = getCustomMarker(click_coords.lat, click_coords.lng, 'YB', 'Yolcunun başlangıç noktası', '', 'http://icons.iconarchive.com/icons/icons8/windows-8/32/Sports-Walking-icon.png');
            group.addObject(passengerRouteStart);
            routingParameters.waypoint0 = passengerRouteStart.getPosition().lat + ',' + passengerRouteStart.getPosition().lng;
            setInput('routeStartB', routingParameters.waypoint0);
        } else if (passengerRouteEnd == null) {
            passengerRouteEnd = new H.map.Marker(click_coords);
            group.addObject(passengerRouteEnd);
            routingParameters.waypoint1 = passengerRouteEnd.getPosition().lat + ',' + passengerRouteEnd.getPosition().lng;
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
        var routeType = $("[name='route-type']").bootstrapSwitch('state');
        console.log(routeType);
        if (routeType) {
            routingParameters.mode = "fastest;car";
            router.calculateRoute(routingParameters, onResultB,
                function (error) {
                    alert(error.message);
                });
        } else {
            routingParameters.mode = "shortest;pedestrian";
            router.calculateRoute(routingParameters, onResultB,
                function (error) {
                    alert(error.message);
                });
        }
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

        $.ajax({
                url: '/analyze/intersection/distance',
                type: 'POST',
                data: JSON.stringify({'intersectionPointLat': intersectionPointLat,
                                       'intersectionPointLng': intersectionPointLong,
                                       'passengerStartPointLat': passengerRouteStart.getPosition().lat,
                                       'passengerEndPointLng': passengerRouteStart.getPosition().lng}),
                success: function (result) {
                    distancePedestrianRoute = Math.round(result.item.distancePedestrianRoute*100)/100;
                    setInput('distancePedestrianRoute', distancePedestrianRoute + " meters");
                    if (result.success == false) {
                        alert("result.success is false");
                    }
                },
                error: function (result) {
                    alert("Something is not OK")
                },
            });

        var ic = new H.map.Icon('http://download.st.vcdn.nokia.com/p/d/places2_stg/icons/categories/21.icon');

        intersectionPointMarker = new H.map.Marker({
            lat: latitude,
            lng: longitude
        }, {icon: ic});


        intersectionPointMarker.draggable = true;
        intersectionPointMarker.addEventListener('dragstart', function (e) {
            //handle drag start here
            console.log(e);
        });
        intersectionPointMarker.addEventListener('drag', function (e) {
            //handle drag here
        });
        intersectionPointMarker.addEventListener('dragend', function (e) {
            var spatial = e.target;
            intersectionPointLat = spatial.getPosition().lat;
            intersectionPointLong = spatial.getPosition().lng;
        });

        map.addEventListener('dragstart', function (ev) {
            var target = ev.target;
            if (target instanceof H.map.Marker) {
                behavior.disable();
            }
        }, false);

        map.addEventListener('dragend', function (ev) {
            var target = ev.target;
            if (target instanceof mapsjs.map.Marker) {
                behavior.enable();
            }
        }, false);

        map.addEventListener('drag', function (ev) {
            var target = ev.target,
                pointer = ev.currentPointer;
            if (target instanceof mapsjs.map.Marker) {
                var newPosition = map.screenToGeo(pointer.viewportX, pointer.viewportY);
                target.setPosition(newPosition);
            }
        }, false);

        group.addObject(intersectionPointMarker);
        map.setCenter({lat: latitude, lng: longitude});
        map.setZoom(15);

    }


    $("#submitBtn").click(function () {
        //var routeShapeA = $('#routeShapeA').val();
        //var routeShapeB = $('#routeShapeB').val();

        $.ajax({
            url: '/analyze/intersection',
            type: 'POST',
            data: JSON.stringify({'routeShapeA': driverRouteShape, 'routeShapeB': passengerRouteShape}),
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

    $("#drawBufferedAreaBtn").click(function () {
        var radiusOfBuffer = $('#radiusOfBufferInput').val();
        if (radiusOfBuffer == null) alert('You should specify radius of buffer area !');
        $.ajax({
            url: '/analyze/route/buffer',
            type: 'POST',
            data: JSON.stringify({'buffer': radiusOfBuffer, 'routeShapeA': driverRouteShape}),
            success: function (result) {
                var items = result.items;
                var customStyle = {
                    strokeColor: 'blue',
                    fillColor: 'rgba(232, 240, 247, 0.5',
                    lineWidth: 2,
                    lineCap: 'square',
                    lineJoin: 'bevel'
                };
                addPolygonToMap(items, customStyle);
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
            url: '/analyze/places/within?radius=' + radius + '&lat=' + intersectionPointLat + '&lon=' + intersectionPointLong,
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

    function addPolygonToMap(polygon, customStyle) {

        if (bufferedRoutePolygon != null) map.removeObject(bufferedRoutePolygon);

        var strip = new H.geo.Strip();
        console.log(polygon);
        polygon.forEach(function (coords) {
            strip.pushLatLngAlt.apply(strip, coords.split(','));
        });

        bufferedRoutePolygon = new H.map.Polygon(strip, {style: customStyle});
        // Add the polygon and marker to the map:
        map.addObject(bufferedRoutePolygon);
        // Center and zoom the map so that the whole isoline polygon is
        // in the viewport:
        map.setViewBounds(bufferedRoutePolygon.getBounds());
    }

    function addPlacesToMap(result) {
        result.forEach(function (item) {
            marker = getCustomMarker(item.position[0], item.position[1], 'P', item.name, item.category);
            group.addObject(marker);
        });
    }

    $('.routeTypeSwitch').on('switchChange.bootstrapSwitch', function (event, state) {
        map.removeObject(passangerRouteLine);
        drawRouteB();
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

    var isoline1Polygon, isoline2Polygon;

    var onIsolineResult = function (result) {
        var isolineCoords = result.Response.isolines[0].value,
            strip = new H.geo.Strip(),
            isolinePolygon;

        // Add the returned isoline coordinates to a strip:
        isolineCoords.forEach(function (coords) {
            strip.pushLatLngAlt.apply(strip, coords.split(','));
        });
        // Create a polygon and a marker representing the isoline:

        isolinePolygon = new H.map.Polygon(strip);
        isolinePolygon.addEventListener('tap', function (event) {
            var spatial = event.target;
            console.log(spatial);

        });
        // Add the polygon and marker to the map:
        map.addObjects([isolinePolygon]);
        // Center and zoom the map so that the whole isoline polygon is
        // in the viewport:
        map.setViewBounds(isolinePolygon.getBounds());
    };

    var onIsoline1Result = function (result) {
        var isolineCoords = result.Response.isolines[0].value,
            strip = new H.geo.Strip();

        // Add the returned isoline coordinates to a strip:
        isolineCoords.forEach(function (coords) {
            strip.pushLatLngAlt.apply(strip, coords.split(','));
        });
        // Create a polygon and a marker representing the isoline:

        isoline1Polygon = new H.map.Polygon(strip);
        isoline1Polygon.addEventListener('tap', function (event) {
            var spatial = event.target;
            console.log(spatial);

        });
        // Add the polygon and marker to the map:
        map.addObjects([isoline1Polygon]);
        // Center and zoom the map so that the whole isoline polygon is
        // in the viewport:
        map.setViewBounds(isoline1Polygon.getBounds());

        if (isoline2Polygon != null) {
         // TODO
        }
    };

    var onIsoline2Result = function (result) {
        var isolineCoords = result.Response.isolines[0].value,
            strip = new H.geo.Strip(),
            isoline2Polygon;

        // Add the returned isoline coordinates to a strip:
        isolineCoords.forEach(function (coords) {
            strip.pushLatLngAlt.apply(strip, coords.split(','));
        });
        // Create a polygon and a marker representing the isoline:

        isoline2Polygon = new H.map.Polygon(strip);
        isoline2Polygon.addEventListener('tap', function (event) {
            var spatial = event.target;
            console.log(spatial);

        });
        // Add the polygon and marker to the map:
        map.addObjects([isoline2Polygon]);
        // Center and zoom the map so that the whole isoline polygon is
        // in the viewport:
        map.setViewBounds(isoline2Polygon.getBounds());

        if (isoline1Polygon != null) {
         // TODO
        }
    };

    $("#quickIsochroneBtn").click(function () {

        $("#resetDrawedOnes").click();

        console.log("reset drawed ones performed");

        var isoline1Params = {
            'mode': 'fastest;car;traffic:enabled',
            'start': '',
            'quality': '1',
            'time': 'PT0H5M'
//            'rangetype': 'distance',
//            'distance': 1000
        }

        var isoline2Params = {
            'mode': 'shortestWalk;pedestrian',
            'start': '',
            'quality': '1',
            'rangetype': 'distance',

        }
        isoline1Params.start = intersectionPointLat + ',' + intersectionPointLong;
        isoline2Params.start = passengerRouteStart.getPosition().lat + ',' + passengerRouteStart.getPosition().lng;
        isoline2Params.distance = distancePedestrianRoute;

        console.log("distance = " + distancePedestrianRoute);

        isoline1Polygon = null; isoline2Polygon = null;
        // Get an instance of the enterprise routing service:
        var enterpriseRouter = platform.getEnterpriseRoutingService();
        // Call the Enterprise Routing API to calculate an isoline:
        enterpriseRouter.calculateIsoline(
            isoline1Params,
            onIsoline1Result,
            function (error) {
                alert(error.message);
            }
        );

        enterpriseRouter.calculateIsoline(
            isoline2Params,
            onIsoline2Result,
            function (error) {
                alert(error.message);
            }
        );

    });

    $("#drawIsochroneBtn").click(function () {
        var isolineFor = $("[name='isoline-point']").bootstrapSwitch('state');

        // isolineFor true means that polygon will be calculated for intersection point
        // otherwise it will be for passenger
        if (isolineFor) {
            isolineParameters.start = intersectionPointLat + ',' + intersectionPointLong;
        } else {
            isolineParameters.start = passengerRouteStart.getPosition().lat + ',' + passengerRouteStart.getPosition().lng;
        }

        var rangeType = $("[name='range-type']").bootstrapSwitch('state');
        var traficCondition = $("[name='traffic-condition']").bootstrapSwitch('state');
        var roleType = $("[name='role']").bootstrapSwitch('state');

        // if true time is enbaled
        if (rangeType) {
            var timeRangeInput = $('#timeRangeInput').val();
            isolineParameters.time = timeRangeInput;
            delete isolineParameters.rangetype;
            delete isolineParameters.distance;

        } else {
            var distanceRangeInput = $('#distanceRangeInput').val();
            isolineParameters.distance = distanceRangeInput;
            isolineParameters.rangetype = 'distance';
            delete isolineParameters.time;
        }


        var selected_modes = getSelectedValuesFromSelectPicker('.selectpicker');
        var mode = getIsolineModeFromSelecteds(selected_modes);

        if (roleType) {
            if (traficCondition) {

                mode += ';traffic:enabled';
                isolineParameters.mode = mode;
            } else {
                mode += '';
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

    function getIsolineModeFromSelecteds(selectedModes) {
        var modeString = '';
        selectedModes.forEach(function (modeObject) {
            modeString += modeObject.value + ';';
        });

        return modeString.substring(0, modeString.length - 1);
    }

    $("#resetDrawedOnes").click(function () {
        var mapObjects = map.getObjects();
        mapObjects.forEach(function (object) {
            if (object instanceof H.map.Polygon) {
                map.removeObject(object);
            }
        });
    });


    function getSelectedValuesFromSelectPicker(selector) {
        var data = [];
        // .selectpicker
        var $el = $(selector);
        $el.find('option:selected').each(function () {
            data.push({value: $(this).val(), text: $(this).text()});
        });
        console.log(data);
        return data;
    }

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


    function getCustomMarker(lat, lng, iconText, itemName, category, ic) {
        // Define a variable holding SVG mark-up that defines an icon image:
        var markupTemplate = '<svg xmlns="http://www.w3.org/2000/svg" width="28px" height="36px"><path d="M 19 31 C 19 32.7 16.3 34 13 34 C 9.7 34 7 32.7 7 31 C 7 29.3 9.7 28 13 28 C 16.3 28 19 29.3 19 31 Z" fill="#000" fill-opacity=".2"/><path d="M 13 0 C 9.5 0 6.3 1.3 3.8 3.8 C 1.4 7.8 0 9.4 0 12.8 C 0 16.3 1.4 19.5 3.8 21.9 L 13 31 L 22.2 21.9 C 24.6 19.5 25.9 16.3 25.9 12.8 C 25.9 9.4 24.6 6.1 22.1 3.8 C 19.7 1.3 16.5 0 13 0 Z" fill="#fff"/><path d="M 13 2.2 C 6 2.2 2.3 7.2 2.1 12.8 C 2.1 16.1 3.1 18.4 5.2 20.5 L 13 28.2 L 20.8 20.5 C 22.9 18.4 23.8 16.2 23.8 12.8 C 23.6 7.07 20 2.2 13 2.2 Z" fill="#18d"/><text x="13" y="19" font-size="12pt" font-weight="bold" text-anchor="middle" fill="#fff">${text}</text></svg>';

        // Set your text here.
        var text = iconText;

        var markup = markupTemplate.replace('${text}', text);

        // Create an icon, an object holding the latitude and longitude, and a marker:
        var icon;
        if (ic != null) icon = new H.map.Icon(ic); else icon = new H.map.Icon(markup);


        var marker = new H.map.Marker({lat: lat, lng: lng}, {icon: icon});
        marker.setData({'title': itemName, 'category': category});

        marker.addEventListener('tap', function (e) {
            var spatial = e.target;
            // Output meta data for the spatial object to the console:
            var bubbleContent = '<b style="font-size:8px;">' + e.target.getData()['title'] + '</b><br/>' +
                '<b style="font-size:8px;">' + e.target.getData()['category'] + '</b>';

            var bubble = new H.ui.InfoBubble({
                lng: spatial.getPosition().lng,
                lat: spatial.getPosition().lat
            }, {content: bubbleContent});
            ui.addBubble(bubble);
        });
        return marker;
    }

    function random() {
        return Math.floor((Math.random() * 10));
    }
})();