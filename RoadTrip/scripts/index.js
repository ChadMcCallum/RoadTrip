function getDirections() {
    var request = {
        origin: getParameterByName("o"),
        destination: getParameterByName("d"),
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
//            var lastLeg = result.routes[0].legs[result.routes[0].legs.length - 1];
//            var lastStep = lastLeg.steps[lastLeg.steps.length - 1];
//            var lastPoint = lastStep.end_location;
            calculateStops(result.routes[0]);
        }
    });
}

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

    getDirections();
}

var getBusinesses = function (result, stop) {
    $.each(result.listings, function (i, e) {
        var point = new google.maps.LatLng(e.geoCode.latitude, e.geoCode.longitude);
        var marker = new google.maps.Marker({ position: point, map: map, visible: true });
        stop.options.push({
            marker: marker,
            name: e.name,
            address: e.address
        });
    });
};

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

    var defaultMilage = 400000;
    var gasStops = [];
    for (var i = defaultMilage; i < totalDistance; i += defaultMilage) {
        var position = getCoordinateXMetersIntoTrip(i, route.legs[0].steps);
        gasStops.push(createStop(position, 'gasoline'));
    }
    var foodStops = [];
    var defaultFoodDuration = 4 * 60 * 60;
    for (var i = defaultFoodDuration; i < totalDuration; i += defaultFoodDuration) {
//        var position = getPositionForTime(i, route);
//        foodStops.push(createStop(position, 'food'));
    }
    var hotelStops = [];
    var defaultDriveDuration = 8 * 60 * 60;
    for (var i = defaultDriveDuration; i < totalDuration; i += defaultDriveDuration) {
//        var position = getPositionForTime(i, route);
//        hotelStops.push(createStop(position, 'hotel'));
    }
}

function createStop(position, type) {
    var stop = {
        position: position,
        type: type,
        options: []
    };
    getBusinessesAtStop(stop, getBusinesses);
    return stop;
}

function getBusinessesAtStop(stop, callback) {
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
            callback(result);
        }
    });
}
$(document).ready(function () {
    init();
});