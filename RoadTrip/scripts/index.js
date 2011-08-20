function getDirections() {
    var request = {
        origin: getParameterByName("o"),
        destination: getParameterByName("d"),
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
            var lastLeg = result.routes[0].legs[result.routes[0].legs.length - 1];
            var lastStep = lastLeg.steps[lastLeg.steps.length - 1];
            var lastPoint = lastStep.end_location;
            getBusinessesAtPoint("pizza", lastPoint.lat(), lastPoint.lng());
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

function calculateStops(route) {
    var totalDistance = _.sum(route.legs, function (leg) {
        return leg.Distance.value;
    });
    var totalDuration = _.sum(route.legs, function (leg) {
        return leg.Duration.value;
    });
    var startTime = 8 * 60 * 60;

    var defaultMilage = 400000;
    var gasStops = [];
    for (var i = defaultMilage; i < totalDistance; i += defaultMilage) {
        var position = getPositionForDistance(i, route);
        gasStop.push(position);
    }
    var foodStops = [];
    var defaultFoodDuration = 4 * 60 * 60;
    for (var i = defaultFoodDuration; i < totalDuration; i += defaultFoodDuration) {
        var position = getPositionForTime(i, route);
        foodStops.push(position);
    }
    var hotelStops = [];
    var defaultDriveDuration = 8 * 60 * 60;
    for (var i = defaultDriveDuration; i < totalDuration; i += defaultDriveDuration) {
        var position = getPositionForTime(i, route);
        hotelStops.push(position);
    }
}

function getBusinessesAtPoint(type, lat, long) {
    var data = {
        search: type,
        lat: lat,
        lng: long
    };
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/services/yellowproxy.asmx/GetBusinessTypesAtLocation",
        data: "{ search: '" + type + "', lat: " + lat + ", lng: " + long + "}",
        dataType: "json",
        success: function (data) {
            var result = JSON.parse(data.d);
            $.each(result.listings, function (i, e) {
                if (i < 3) {
                    var point = new google.maps.LatLng(e.geoCode.latitude, e.geoCode.longitude);
                    var marker = new google.maps.Marker({ position: point, map: map });
                }
            });
        }
    });
}

$(document).ready(function () {
    init();
});