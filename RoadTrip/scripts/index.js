function getDirections() {
    var request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
            route = result.routes[0];
            calculateStops(result.routes[0]);
        }
    });
}

function clearMap() {
    $("#steps").empty();
    var i;
    
    for (i = 0; i < globalMarkerArray.length; i = i + 1) {
        globalMarkerArray[i].setMap(null);
    }
    for (i = 0; i < globalMarkerArray.length; i = i + 1) {
        globalMarkerArray.pop();
    }
}

function getNewDirections() {
    var food = ($("#checkbox-food").attr("checked") == "checked") ? $("#value-food").val() : 0;
    var gas = ($("#checkbox-gas").attr("checked") == "checked") ? $("#value-gas").val() : 0;
    var hotel = ($("#checkbox-hotel").attr("checked") == "checked") ? $("#value-hotel").val() : 0;
    var other = ($("#checkbox-other").attr("checked") == "checked") ? $("#value-other").val() : "";

    milage = gas * gasMultiplier;
    stopTime = food * foodMultiplier;
    driveTime = hotel * hotelMultiplier;
    origin = $("#input-origin").val();
    destination = $("#input-destination").val();

    pendingAPICalls = 0;
    clearMap();
    getDirections();
}

function displaySteps() {
    $('#steps').empty();
    $.each(route.legs[0].steps, function (i, e) {
        $('#step-template').tmpl(e).appendTo('#steps');
        if (e.RoadTripGasStops && e.RoadTripGasStops.length > 0) {
            $.each(e.RoadTripGasStops, function (j, k) {
                $('#gas-stop-template').tmpl(k).appendTo('#steps');
            });
        }
        if (e.RoadTripFoodStops && e.RoadTripFoodStops.length > 0) {
            $.each(e.RoadTripFoodStops, function (j, k) {
                $('#food-stop-template').tmpl(k).appendTo('#steps');
            });
        }
        if (e.RoadTripHotelStops && e.RoadTripHotelStops.length > 0) {
            $.each(e.RoadTripHotelStops, function (j, k) {
                $('#hotel-stop-template').tmpl(k).appendTo('#steps');
            });
        }
    });
}

var route;

gloablSpeedInKmPerHour = 60.0;
var map;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

function init() {
    var latlng = new google.maps.LatLng(49.261307, -123.113537);
    var myOptions = {
        zoom: 8,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);

    parseParams();

    getDirections();

    setInitialValues();

    $("#form-submit").click(getNewDirections);
}

function setInitialValues() {
    $("#input-origin").val(origin);
    $("#input-destination").val(destination);

    $("#value-gas").val(milage / gasMultiplier);
    $("#value-food").val(stopTime / foodMultiplier);
    $("#value-hotel ").val(driveTime / hotelMultiplier);
}

function parseParams() {
    origin = getParameterByName("o");
    destination = getParameterByName("d");
    
    if (getParameterByName("gas")) {
        milage = getParameterByName("gas") * gasMultiplier;
    }
    if (getParameterByName("food")) {
        stopTime = getParameterByName("food") * foodMultiplier;
    }
    if (getParameterByName("hotel")) {
        driveTime = getParameterByName("hotel") * hotelMultiplier;
    }
}

var getBusinesses = function (result, stopPoint) {
    var stop = stopPoint;
    if (result.listings) {
        $.each(result.listings, function (i, e) {
            if (i < 5) {
                var point = new google.maps.LatLng(e.geoCode.latitude, e.geoCode.longitude);
                var marker;
                var business = {
                    name: e.name,
                    address: e.address
                };
                if (stop.type == 'gasoline') {
                    marker = gasMarker(map, point, business);
                    getBusinessReviews(business, function (result) {
                        if (result.businesses.length > 0) {
                            business.rating = result.businesses[0].avg_rating;
                        }
                        checkUpdate();
                    });
                } else if (stop.type == 'food') {
                    marker = foodMarker(map, point, business);
                    getBusinessReviews(business, function (result) {
                        if (result.businesses.length > 0) {
                            business.rating = result.businesses[0].avg_rating;
                        }
                        checkUpdate();
                    });
                } else {
                    marker = hotelMarker(map, point, business);
                    getBusinessReviews(business, function (result) {
                        if (result.businesses.length > 0) {
                            business.rating = result.businesses[0].avg_rating;
                        }
                        checkUpdate();
                    });
                }
                business.marker = marker;
                stop.options.push(business);
            }
        });
    }
};

var rollback = 25000;
var retryStop = function(stop, result) {
    stop.offset = stop.offset - rollback;
    var computeResult = getCoordinateXMetersIntoTrip(stop.offset, route.legs[0].steps);
    stop.position = computeResult.position;
    stop.stepIdx = computeResult.stepIdx;
    getBusinessesAtStop(stop, getBusinesses, retryStop);
};


var gasMultiplier = 1000;
var foodMultiplier = 100000;
var hotelMultiplier = 100000;

var milage = 400000;
var stopTime = 4 * 100000;
var driveTime = 8 * 100000;
var origin = "";
var destination = "";

function calculateStops(route) {
    var totalDistance = 0;
    _.each(route.legs, function (leg) {
        totalDistance += leg.distance.value;
    });
    var totalDuration = 0;
    _.each(route.legs, function (leg) {
        totalDuration += leg.duration.value;
    });
    var startTime = 8 * 60 * 60;

    if (milage > 0) {
        var gasStops = [];
        for (var i = milage; i < totalDistance; i += milage) {
            var result = getCoordinateXMetersIntoTrip(i, route.legs[0].steps);
            var stop = createStop(result.position, result.stepIdx, 'gasoline', i);
            if (!route.legs[0].steps[result.stepIdx].RoadTripGasStops) {
                route.legs[0].steps[result.stepIdx].RoadTripGasStops = [];
            }
            route.legs[0].steps[result.stepIdx].RoadTripGasStops.push(stop);
            gasStops.push(stop);
        }
    }
    if (stopTime > 0) {
        var foodStops = [];
        for (var i = stopTime; i < totalDistance; i += stopTime) {
            var result = getCoordinateXMetersIntoTrip(i, route.legs[0].steps);
            var stop = createStop(result.position, result.stepIdx, 'food', i);
            if (!route.legs[0].steps[result.stepIdx].RoadTripFoodStops) {
                route.legs[0].steps[result.stepIdx].RoadTripFoodStops = [];
            }
            route.legs[0].steps[result.stepIdx].RoadTripFoodStops.push(stop);
            foodStops.push(stop);
        }
    }
    if (driveTime > 0) {
        var hotelStops = [];
        for (var i = driveTime; i < totalDistance; i += driveTime) {
            var result = getCoordinateXMetersIntoTrip(i, route.legs[0].steps);
            var stop = createStop(result.position, result.stepIdx, 'hotel', i);
            if (!route.legs[0].steps[result.stepIdx].RoadTripHotelStops) {
                route.legs[0].steps[result.stepIdx].RoadTripHotelStops = [];
            }
            route.legs[0].steps[result.stepIdx].RoadTripHotelStops.push(stop);
            hotelStops.push(createStop(result.position, result.stepIdx, 'hotel', i));
        }
    }
}

function createStop(position, stepIdx, type, offset) {
    var stop = {
        position: position,
        stepIdx : stepIdx,
        type: type,
        options: [],
        offset: offset
    };
    getBusinessesAtStop(stop, getBusinesses, retryStop);
    return stop;
}

function getBusinessesAtStop(stop, success, error) {
    var data = {
        search: stop.type,
        lat: stop.position.lat(),
        lng: stop.position.lng()
    };
    pendingAPICalls++;
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/services/yellowproxy.asmx/GetBusinessTypesAtLocation",
        data: "{ search: '" + data.search + "', lat: " + data.lat + ", lng: " + data.lng + "}",
        dataType: "json",
        success: function (data) {
            pendingAPICalls--;
            var result = JSON.parse(data.d);
            if (result.errorCode || result.listings.length < 5) {
                error(stop, result);
            }
            success(result, stop);
        }, error: function () {
            pendingAPICalls--;
        }
    });
}

var pendingAPICalls = 0;
function checkUpdate() {
    if (pendingAPICalls == 0) {
        displaySteps();
    }
}
function getBusinessReviews(business, success) {
    var address = business.address.street + ", " + business.address.city + ", " +
        business.address.prov + ", " + business.address.pcode;
    address = encodeURI(address);
    var data = {
        name: business.name,
        address: address
    };
    pendingAPICalls++;
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/services/yellowproxy.asmx/GetBusinessReviews",
        data: "{ name: '" + data.name + "', address: '" + data.address + "'}",
        dataType: "json",
        success: function (data) {
            pendingAPICalls--;
            var result = JSON.parse(data.d);

            success(result, stop);
        }, error: function () {
            pendingAPICalls--;
        }
    });
}

function getGasPrice(location, success) {
    pendingAPICalls++;
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/services/yellowproxy.asmx/GetGasPrice",
        data: "{ lat: " + location.lat() + ", lng: " + location.lng() + "}",
        dataType: "json",
        success: function (data) {
            pendingAPICalls--;
            var result = JSON.parse(data.d);

            success(result, stop);
        }, error: function () {
            pendingAPICalls--;
        }
    });
}

var $window = $(window);
var $sidebar = $('.sidebar');
var $header = $('.header');

$(document).ready(function () {
    init();
    SetMapSize();

    var showDialog = (!(origin && destination));

    $("#first-run-dialog").dialog({
        title: "Where are you going?",
        modal: true,
        width: 800,
        autoOpen: showDialog,
        dialogClass: 'alert',
        close: SetMapSize,
        resizable: false
    });

    $("#input-origin, #input-destination").focus(function () {
        if ($(this).val().toLowerCase() === "origin..." || $(this).val().toLowerCase() === "destination...") {
            $(this).val("");
        }
    }).blur(function () {
        if ($(this).val().trim().toLowerCase() === "") {
            if ($(this).attr("id") == "input-origin")
                $(this).val("Origin...");
            else
                $(this).val("Destination...");
        }
    });

    $('#dialog-submit').click(function () {
        var url = "index.html?" +
                    "o=" + $("#input-origin").val() +
                    "&d=" + $("#input-destination").val();

        window.location.href = url;
    });
    $window.bind('resize', SetMapSize);
});

function SetMapSize() {
    var mapWidth = $window.width() - $sidebar.outerWidth();
    var mapHeight = $window.height() - $header.outerHeight();

    $("#map_canvas").css("width", mapWidth).css("height", mapHeight);
    $sidebar.css("height", mapHeight);
}

function SetMapPosition(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    map.panTo(latlng);
    map.setZoom(14);
}
