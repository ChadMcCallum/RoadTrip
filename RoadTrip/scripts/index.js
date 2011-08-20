function getDirections() {
    var request = {
        origin: getParameterByName("o"),
        destination: getParameterByName("d"),
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
            route = result.routes[0];
            //            var lastLeg = result.routes[0].legs[result.routes[0].legs.length - 1];
            //            var lastStep = lastLeg.steps[lastLeg.steps.length - 1];
            //            var lastPoint = lastStep.end_location;
            calculateStops(result.routes[0]);
        }
    });
}

var route;

gloablSpeedInKmPerHour = 60.0;
var map;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

function init() {
    var latlng = new google.maps.LatLng(-34.397, 150.644);
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
}

function parseParams() {
    if (getParameterByName("gas")) {
        milage = getParameterByName("gas");
    }
    if (getParameterByName("food")) {
        stopTime = getParameterByName("food") * 100000;
    }
    if (getParameterByName("hotel")) {
        driveTime = getParameterByName("hotel") * 100000;
    }
}

var getBusinesses = function (result, stopPoint) {
    var stop = stopPoint;
    $.each(result.listings, function (i, e) {
        var point = new google.maps.LatLng(e.geoCode.latitude, e.geoCode.longitude);
        var marker;
        if (stop.type == 'gasoline') {
            marker = gasMarker(map, point);
        } else if (stop.type == 'food') {
            marker = foodMarker(map, point);
        } else {
            marker = hotelMarker(map, point);
        }
        stop.options.push({
            marker: marker,
            name: e.name,
            address: e.address
        });
    });
}

var rollback = 25000;
var retryStop = function (stop, result) {
    stop.offset = stop.offset - rollback;
    stop.position = getCoordinateXMetersIntoTrip(stop.offset, route.legs[0].steps);
    getBusinessesAtStop(stop, getBusinesses, retryStop);
}

var milage = 400000;
var stopTime = 4 * 100000;
var driveTime = 8 * 100000;
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
            var position = getCoordinateXMetersIntoTrip(i, route.legs[0].steps);
            gasStops.push(createStop(position, 'gasoline', i));
        }
    }
    if (stopTime > 0) {
        var foodStops = [];
        for (var i = stopTime; i < totalDistance; i += stopTime) {
            var position = getCoordinateXMetersIntoTrip(i, route.legs[0].steps);
            foodStops.push(createStop(position, 'food', i));
        }
    }
    if (hotelStops > 0) {
        var hotelStops = [];
        for (var i = driveTime; i < totalDistance; i += driveTime) {
            var position = getCoordinateXMetersIntoTrip(i, route.legs[0].steps);
            hotelStops.push(createStop(position, 'hotel', i));
        }
    }
}

function createStop(position, type, offset) {
    var stop = {
        position: position,
        type: type,
        options: [],
        offset: offset
    };
    getBusinessesAtStop(stop, getBusinesses, retryStop);
    return stop;
}

function getBusinessesAtStop(stop, callback, error) {
    var data = {
        search: stop.type,
        lat: stop.position.lat(),
        lng: stop.position.lng()
    };
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/services/yellowproxy.asmx/GetBusinessTypesAtLocation",
        data: "{ search: '" + data.search + "', lat: " + data.lat + ", lng: " + data.lng + "}",
        dataType: "json",
        success: function (data) {
            var result = JSON.parse(data.d);
            if (result.errorCode) {
                error(stop, result);
            }
            callback(result, stop);
        }
    });
}

$(document).ready(function () {
    init();
});