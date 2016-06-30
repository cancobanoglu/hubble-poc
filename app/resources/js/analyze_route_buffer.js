/**
 * Created by cancobanoglu on 10.10.2015.
 */

(function () {
    $('select').selectpicker();
    var colors = ['blue', 'green', 'red', 'grey', '#FF4433', '#CC0022', '#B00022', '#180022', '#FA0022', '#E5FFCC'];
    var colorRed = 'red';
    var colorBlue = 'blue';
    var intersectionAreaPolygon;
    var radiusOfCircle;
    var intersectionPointLat, intersectionPointLong;

    var platform = new H.service.Platform({
        'app_id': 'bkXkAirxQ6lW0e5DdpqA',
        'app_code': 'sW742GORuOJB1BR9j19_3A'
    });

    // Get an instance of the enterprise routing service:
    var enterpriseRouter = platform.getEnterpriseRoutingService();

    // Instantiate a map inside the DOM element with id map. The
    // map center is in San Francisco, the zoom level is 10:
    var map = new H.Map(document.getElementById('mapContainer'),
        platform.createDefaultLayers().normal.map, {
            center: {lat: 41.02583, lng: 29.05842},
            zoom: 12
        });
    // Enable the event system on the map instance:
    var mapEvents = new H.mapevents.MapEvents(map),
        behavior = new H.mapevents.Behavior(mapEvents),
        defaultLayers = platform.createDefaultLayers(),
        ui = H.ui.UI.createDefault(map, defaultLayers),
        group = new H.map.Group();

    // Add the group object to the map:
    map.addObject(group);
    var driverRouteStart, driverRouteEnd, passengerRouteStart, passengerRouteEnd, driverRouteShape, passengerRouteShape, passangerRouteLine,
        bufferedRoutePolygon,
        bufferedRouteShape,
        circlePolygon;

    var routingParametersDriver = {
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

    var router = platform.getRoutingService();
    var foundPlacesSourceIdList = [];
    // Define a callback function to process the routing response:
    var onResultDriverRouteCallback = function (result) {
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

            // Create a polyline to display the route:
            var randomColor = colors[random()];
            var routeLine = new H.map.Polyline(strip, {
                style: {strokeColor: randomColor, lineWidth: 7},
                arrows: {fillColor: 'white', frequency: 2, width: 0.5, length: 0.7}
            });
            // Add the route polyline and the two markers to the map:
            map.addObjects([routeLine]);
            // Set the map's viewport to make the whole route visible:
            map.setViewBounds(routeLine.getBounds());
        }
    };

    var onResultPassengerRouteCallback = function (result) {
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

    map.addEventListener('tap', function (event) {
        var click_coords = eventToLocation(event);

        if (driverRouteStart == null) {
            driverRouteStart = getCustomMarker(click_coords.lat, click_coords.lng, 'SB', 'Sürücünün başlangıç noktası', 'A', 'http://icons.iconarchive.com/icons/icons8/windows-8/24/Transport-Driver-icon.png', null);
            group.addObject(driverRouteStart);
            routingParametersDriver.waypoint0 = driverRouteStart.getPosition().lat + ',' + driverRouteStart.getPosition().lng;
            setInput('routeStartA', routingParametersDriver.waypoint0);
        } else if (driverRouteEnd == null) {
            driverRouteEnd = new H.map.Marker(click_coords);
            group.addObject(driverRouteEnd);
            routingParametersDriver.waypoint1 = driverRouteEnd.getPosition().lat + ',' + driverRouteEnd.getPosition().lng;
            setInput('routeEndA', routingParametersDriver.waypoint1);
            drawDriverRoute();

        } else if (passengerRouteStart == null) {
            passengerRouteStart = getCustomMarker(click_coords.lat, click_coords.lng, 'YB', 'Yolcunun başlangıç noktası', '', 'http://icons.iconarchive.com/icons/icons8/windows-8/32/Sports-Walking-icon.png');
            group.addObject(passengerRouteStart);
            routingParametersDriver.waypoint0 = passengerRouteStart.getPosition().lat + ',' + passengerRouteStart.getPosition().lng;
            setInput('routeStartB', routingParametersDriver.waypoint0);
        } else if (passengerRouteEnd == null) {
            passengerRouteEnd = new H.map.Marker(click_coords);
            group.addObject(passengerRouteEnd);
            routingParametersDriver.waypoint1 = passengerRouteEnd.getPosition().lat + ',' + passengerRouteEnd.getPosition().lng;
            setInput('routeEndB', routingParametersDriver.waypoint1);
            drawPassengerRoute();
        }
    });

    $("#calculateIntersectionBtn").click(function () {
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

    function drawDriverRoute() {
        router.calculateRoute(
            routingParametersDriver,
            onResultDriverRouteCallback,
            function (error) {
                alert(error.message);
            });
    }

    function drawPassengerRoute() {
        router.calculateRoute(
            routingParametersDriver,
            onResultPassengerRouteCallback,
            function (error) {
                alert(error.message);
            });
    }


    function eventToLocation(event) {
        return map.screenToGeo(event.currentPointer.viewportX, event.currentPointer.viewportY);
    }


    function setInput(inputId, value) {

        var elem = document.getElementById(inputId);
        elem.value = value;
    }

    function random() {
        return Math.floor((Math.random() * 10));
    }


    function addPolygonToMap(polygon, customStyle, removeBuffered, isIntersectionArea, isCircle) {
        var localPolygon;

        if (bufferedRoutePolygon != null)
            if (removeBuffered)
                map.removeObject(bufferedRoutePolygon);

        var strip = new H.geo.Strip();
        polygon.forEach(function (coords) {
            strip.pushLatLngAlt.apply(strip, coords.split(','));
        });

        if (isCircle) {
            circlePolygon = new H.map.Polygon(strip, {style: customStyle});
            localPolygon = circlePolygon;
        } else {
            bufferedRoutePolygon = new H.map.Polygon(strip, {style: customStyle});
            localPolygon = bufferedRoutePolygon;
        }

        if (isIntersectionArea)
            intersectionAreaPolygon = polygon;

        // Add the polygon and marker to the map:
        map.addObject(localPolygon);
        // Center and zoom the map so that the whole isoline polygon is
        // in the viewport:
        map.setViewBounds(localPolygon.getBounds());
    }


    function addPlacesToMap(result) {
        result.forEach(function (item) {
            var marker = getCustomMarker(item.position[0], item.position[1], 'P', item.name, item.category, null, item.source_id);
            foundPlacesSourceIdList.push(item.source_id);
            marker.getData()['source_id'] = item.source_id;
            marker.addEventListener('tap', function (e) {
                $.ajax({
                    url: '/analyze/isoline/' + e.target.getData()['source_id'],
                    type: 'GET',
                    success: function (result) {
                        console.log(result.shapes);
                        var customStyle = {
                            strokeColor: 'red',
                            fillColor: 'rgba(255, 153, 153, 0.1',
                            lineWidth: 1,
                            lineCap: 'square',
                            lineJoin: 'bevel'
                        };
                        addPolygonToMap(result.shapes.one_min_shape, customStyle, false, false);
                        //addPolygonToMap(result.shapes.three_min_shape, customStyle, false, false);
                        //addPolygonToMap(result.shapes.five_min_shape, customStyle, true, false);
                    },
                    error: function (result) {
                        alert("Something is not OK");
                    },
                });
            });
            group.addObject(marker);
        });
    }

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

    function getIsolineRangesFromSelecteds(selectedModes) {
        var modeString = '';
        selectedModes.forEach(function (modeObject) {
            modeString += modeObject.value + ';';
        });

        return modeString.substring(0, modeString.length - 1);
    }

    function getCustomMarker(lat, lng, iconText, itemName, category, ic, source_id) {
        console.log('heeeee');
        console.log(source_id);
        // Define a variable holding SVG mark-up that defines an icon image:
        var markupTemplate = '<svg xmlns="http://www.w3.org/2000/svg" width="28px" height="36px"><path d="M 19 31 C 19 32.7 16.3 34 13 34 C 9.7 34 7 32.7 7 31 C 7 29.3 9.7 28 13 28 C 16.3 28 19 29.3 19 31 Z" fill="#000" fill-opacity=".2"/><path d="M 13 0 C 9.5 0 6.3 1.3 3.8 3.8 C 1.4 7.8 0 9.4 0 12.8 C 0 16.3 1.4 19.5 3.8 21.9 L 13 31 L 22.2 21.9 C 24.6 19.5 25.9 16.3 25.9 12.8 C 25.9 9.4 24.6 6.1 22.1 3.8 C 19.7 1.3 16.5 0 13 0 Z" fill="#fff"/><path d="M 13 2.2 C 6 2.2 2.3 7.2 2.1 12.8 C 2.1 16.1 3.1 18.4 5.2 20.5 L 13 28.2 L 20.8 20.5 C 22.9 18.4 23.8 16.2 23.8 12.8 C 23.6 7.07 20 2.2 13 2.2 Z" fill="#18d"/><text x="13" y="19" font-size="12pt" font-weight="bold" text-anchor="middle" fill="#fff">${text}</text></svg>';

        // Set your text here.
        var text = iconText;

        var markup = markupTemplate.replace('${text}', text);

        // Create an icon, an object holding the latitude and longitude, and a marker:
        var icon;
        if (ic != null) icon = new H.map.Icon(ic); else icon = new H.map.Icon(markup);


        var marker = new H.map.Marker({lat: lat, lng: lng}, {icon: icon});
        marker.setData({'title': itemName, 'category': category, 'source_id': source_id});

        marker.addEventListener('tap', function (e) {
            var spatial = e.target;
            // Output meta data for the spatial object to the console:
            var bubbleContent = '<b style="font-size:8px;">' + e.target.getData()['title'] + '</b><br/>' +
                '<b style="font-size:8px;">' + e.target.getData()['category'] + '</b>' +
                '<b style="font-size:8px;">' + e.target.getData()['source_id'] + '</b>';

            var bubble = new H.ui.InfoBubble({
                lng: spatial.getPosition().lng,
                lat: spatial.getPosition().lat
            }, {content: bubbleContent});
            ui.addBubble(bubble);
        });
        return marker;
    }

    var foundPlaces = [];

    function updateMarker(source_id) {
        var groupObjects = group.getObjects();
        groupObjects.forEach(function (object) {
            if (object instanceof H.map.Marker) {
                if (object.getData()) {
                    if (object.getData()['category'] != 'A')
                        if (object.getData()['source_id'] == source_id) {
                            foundPlaces.push(object);
                        }
                }
            }
        });
    }

    function updateMarkers(source_id_list) {
        console.log(source_id_list);
        source_id_list.forEach(function (id) {
            updateMarker(id);
        });
        group.getObjects().forEach(function (ob) {
            if ((foundPlaces.indexOf(ob) == -1)) {
                group.removeObject(ob);
            }
        });

        console.log(foundPlaces);
    }

    var isolineParameters = {
        'mode': '',
        'start': '',
        'quality': '1'
    };

    $("#drawIsolineForPassengerBtn").click(function () {

        isolineParameters.start = passengerRouteStart.getPosition().lat + ',' + passengerRouteStart.getPosition().lng;
        isolineParameters.start = passengerRouteStart.getPosition().lat + ',' + passengerRouteStart.getPosition().lng;

        var selected_ranges = getSelectedValuesFromSelectPicker('.passenger-range-selectpicker'),
            ranges = getIsolineRangesFromSelecteds(selected_ranges);
        console.log(ranges);
        isolineParameters.time = 'PT0H' + ranges + 'M';

        var mode = 'shortestWalk;pedestrian';
        isolineParameters.mode = mode;

        // Call the Enterprise Routing API to calculate an isoline:
        enterpriseRouter.calculateIsoline(
            isolineParameters,
            onIsolineResult,
            function (error) {
                alert(error.message);
            }
        );
    });

    var isolinePolygons = [];
    var lastPassengerIsolineShape;

    $("#clearPassengerBtn").click(function () {
        group.removeObject(passengerRouteStart);
        passengerRouteStart = null;
        map.removeObjects(isolinePolygons);
    });


    var onIsolineResult = function (result) {
        var isolineCoords = result.Response.isolines[0].value,
            strip = new H.geo.Strip(),
            isolinePolygon;

        // Add the returned isoline coordinates to a strip:
        isolineCoords.forEach(function (coords) {
            strip.pushLatLngAlt.apply(strip, coords.split(','));
        });
        // Create a polygon and a marker representing the isoline:
        lastPassengerIsolineShape = isolineCoords;
        isolinePolygon = new H.map.Polygon(strip);
        isolinePolygons.push(isolinePolygon);
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

    $("#findIntersectedAreaBtn").click(function () {
        $.ajax({
            url: '/analyze/intersectionArea',
            type: 'POST',
            data: JSON.stringify({'isoline_area': lastPassengerIsolineShape, 'buffered_area': bufferedRouteShape}),
            success: function (result) {
                var shape = result.shape;
                var places = result.places;
                var customStyle = {
                    strokeColor: 'black',
                    fillColor: 'rgba(232, 240, 247, 0.1',
                    lineWidth: 4,
                    lineCap: 'square',
                    lineJoin: 'bevel'
                };
                addPolygonToMap(shape, customStyle, false, true, true);
                $("#placesDiv").removeClass('hidden');
                $("#findPlacesWithinIntersectedAreaDiv").removeClass('hidden');
            },
            error: function (result) {
                alert("Something is not OK")
            },
        });
    });

    $("#findPlacesWithinIntersectedAreaBtn").click(function () {
        console.log(intersectionAreaPolygon);
        $.ajax({
            url: '/analyze/intersectionArea/places',
            type: 'POST',
            data: JSON.stringify({'intersected_area': intersectionAreaPolygon}),
            success: function (result) {
                foundPlacesSourceIdList.clear;
                addPlacesToMap(result.items)
            },
            error: function (result) {
                alert("Something is not OK");
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
                bufferedRouteShape = items;
                addPolygonToMap(items, customStyle, true, false,true);
            },
            error: function (result) {
                alert("Something is not OK")
            },
        });
    });

    $("#findPlacesWithinAreaBtn").click(function () {
        if (bufferedRoutePolygon == null) alert('You should draw area first !');
        $.ajax({
            url: '/analyze/route/buffer/places',
            type: 'POST',
            data: JSON.stringify({'buffered_area': bufferedRouteShape}),
            success: function (result) {
                foundPlacesSourceIdList.clear;
                addPlacesToMap(result.items)
            },
            error: function (result) {
                alert("Something is not OK")
            },
        });
    });

    $("#findAccessiblePlacesForDriverBtn").click(function () {
        var selected_modes = getSelectedValuesFromSelectPicker('.detourrange-selectpicker'),
            range = getIsolineRangesFromSelecteds(selected_modes);
        $.ajax({
            url: '/analyze/intersectionArea/availablePlaces',
            type: 'POST',
            data: JSON.stringify({
                'source_ids': foundPlacesSourceIdList,
                'range': range,
                'driver_route': driverRouteShape
            }),
            success: function (result) {
                console.log(result.available_place_id_list.length);
                updateMarkers(result.available_place_id_list);
            },
            error: function (result) {
                alert("Something is not OK")
            },
        });
    });

    $("#suggestBtn").click(function () {
        var selected_modes = getSelectedValuesFromSelectPicker('.detourrange-selectpicker'),
            range = getIsolineRangesFromSelecteds(selected_modes);
        var radiusOfBuffer = $('#radiusOfBufferInput').val();
        $.ajax({
            url: '/analyze/suggest',
            type: 'POST',
            data: JSON.stringify({
                'driverRouteShape': driverRouteShape,
                'passengerStartPoint': [passengerRouteStart.getPosition().lat, passengerRouteStart.getPosition().lng],
                'intersectionPoint' : [intersectionPointLat, intersectionPointLong],
                'detourRange': range,
                'radiusOfBuffer': radiusOfBuffer
            }),
            success: function (result) {
                addPlacesToMap(result.items);
            },
            error: function (result) {

            },
        });
    });


    $("#drawCircleBtn").click(function () {
        $.ajax({
            url: '/analyze/circle',
            type: 'POST',
            data: JSON.stringify({
                'passengerStartPoint': [passengerRouteStart.getPosition().lat, passengerRouteStart.getPosition().lng],
                'intersectionPoint': [intersectionPointLat, intersectionPointLong]
            }),
            success: function (result) {
                var radius = result.radius;
                console.log(radius);
                addPolygonToMap(result.shape, null, false, false, true);

                radiusOfCircle = radius;
                map.addObject(circle);
            },
            error: function (result) {

            },
        });
    });

    function putFirstIntersectedPoint(latitude, longitude) {

        intersectionPointLat = latitude;
        intersectionPointLong = longitude;

        $.ajax({
            url: '/analyze/intersection/distance',
            type: 'POST',
            data: JSON.stringify({
                'intersectionPointLat': intersectionPointLat,
                'intersectionPointLng': intersectionPointLong,
                'passengerStartPointLat': passengerRouteStart.getPosition().lat,
                'passengerEndPointLng': passengerRouteStart.getPosition().lng
            }),
            success: function (result) {
                distancePedestrianRoute = Math.round(result.item.distancePedestrianRoute * 100) / 100;
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
})();