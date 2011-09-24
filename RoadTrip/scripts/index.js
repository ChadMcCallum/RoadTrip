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
            calculateTotalsBeforeCalculatingStops(result.routes[0]);
            calculateStops(result.routes[0]);
            beginCalculateGasStops(result.routes[0]);
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
    $.each(result, function (i, e) {
        var point = new google.maps.LatLng(e.lat, e.lng);
        var marker;
        var business = {
            name: e.name,
            address: e.address
        };
        if (stop.type == 'gasoline') {
            marker = gasMarker(map, point, business);
        } else if (stop.type == 'food') {
            marker = foodMarker(map, point, business);
        } else {
            marker = hotelMarker(map, point, business);
        }
        business.marker = marker;
        if (i == 0) {
            marker.setMap(map);
        }
        stop.options.push(business);
    });
    checkUpdate();
};

$('#save').click(function () {
    //build data object
    var data = {
        origin: $('#input-origin').val(),
        destination: $('#input-destination').val(),
        stops: []
    };
    $.each(route.legs[0].steps, function (i, e) {
        if (e.RoadTripGasStops && e.RoadTripGasStops.length > 0) {
            $.each(e.RoadTripGasStops, function (j, f) {
                data.stops.push(createStopData(f.options[0]));
            });
        }
        if (e.RoadTripFoodStops && e.RoadTripFoodStops.length > 0) {
            $.each(e.RoadTripFoodStops, function (j, f) {
                data.stops.push(createStopData(f.options[0]));
            });
        }
        if (e.RoadTripHotelStops && e.RoadTripHotelStops.length > 0) {
            $.each(e.RoadTripHotelStops, function (j, f) {
                data.stops.push(createStopData(f.options[0]));
            });
        }
    });

    $.ajax({
        type: "POST",
        url: "./services/service.php?action=savetrip",
        data: { data: JSON.stringify(data), email: $('#email').val() },
        dataType: "json",
        success: function (data) {
            alert(data);
        }, error: function () {
        }
    });
});

function createStopData(stop) {
    var stopData = {
        lat: stop.marker.position.Ja,
        lng: stop.marker.position.Ka,
        name: stop.name,
        street: stop.address.street,
        city: stop.address.city,
        province: stop.address.prov,
        pcode: stop.address.pcode
    };
    return stopData;
}

var rollback = 50000;
var retryStop = function (stop, result) {
    stop.offset = stop.offset - rollback;
    stop.options = [];
    if (stop.offset > 0) {
        var computeResult = getCoordinateXMetersIntoTrip(stop.offset, route.legs[0].steps);
        stop.position = computeResult.position;
        stop.stepIdx = computeResult.stepIdx;
        getBusinessesAtStop(stop, getBusinesses, retryStop);
    }
};


var gasMultiplier = 1000;
var foodMultiplier = 100000;
var hotelMultiplier = 100000;

var milage = 400000;
var stopTime = 4 * 100000;
var driveTime = 8 * 100000;
var origin = "";
var destination = "";

// New gas stop calculation (which affects future results if previous result needed to be shifted due to lack of business results)
var gCurrentMileage = 0;
var gTotalTripDistance = 0;
var gGasStops = [];
var gLegSteps;

function calculateTotalsBeforeCalculatingStops(route) {
    gTotalTripDistance = 0;
    _.each(route.legs, function (leg) {
        gTotalTripDistance += leg.distance.value;
    });
}
function beginCalculateGasStops(route) {

    // Store values in globals
    gCurrentMileage = milage;
    gLegSteps = route.legs[0].steps;
    gGasStops = [];

    if (gCurrentMileage > 0) {
        tryToGetStopsAtMileage(gCurrentMileage, gLegSteps, dropMarkersAndCalculateNextGasStop, recalculateCurrentGasStop);
    }
}

function getGasAtStop(stop, success, error) {
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
            else {
                success(result, stop);
            }
        }, error: function () {
            pendingAPICalls--;
        }
    });
}

function dropMarkersAndCalculateNextGasStop(result, stopPoint) {
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
                } else if (stop.type == 'food') {
                    marker = foodMarker(map, point, business);
                } else {
                    marker = hotelMarker(map, point, business);
                }
                business.marker = marker;
                stop.options.push(business);
            }
        });
        gCurrentMileage = stop.offset;
        console.log("found businesses around mileage: " + stop.offset + " (" + stop.position.lat() + "," + stop.position.lng() + ")");
    }
    
    // Calculate next gas stop
    gCurrentMileage = gCurrentMileage + milage;
    if (gCurrentMileage < gTotalTripDistance) {
        tryToGetStopsAtMileage(gCurrentMileage, gLegSteps, dropMarkersAndCalculateNextGasStop, recalculateCurrentGasStop);
    }
};

function recalculateCurrentGasStop(stop, result) {
    console.log("invalid results at: " + stop.offset + " recalculate at: " + (stop.offset - rollback));
    stop.offset = stop.offset - rollback;
    stop.options = [];
    var computeResult = getCoordinateXMetersIntoTrip(stop.offset, route.legs[0].steps);
    stop.position = computeResult.position;
    stop.stepIdx = computeResult.stepIdx;
    getGasAtStop(stop, dropMarkersAndCalculateNextGasStop, recalculateCurrentGasStop);
}

function hasValidBusinesses(yellowPagesResult) {
    return (yellowPagesResult.errorCode == 0 && yellowPagesResult.listings.length >= 5);
}

function tryToGetStopsAtMileage(currentMileage, legSteps, success, error) {
    // Try to see if current distance into trip will have valid businesses
    var coordinate = getCoordinateXMetersIntoTrip(currentMileage, legSteps);

    // If following call is successful, record currentMileage and proceed
    // If following call fails, back track currentMileage and try again
    var createdStop = tryCreateGasStop(coordinate.position, coordinate.stepIdx, 'gasoline', currentMileage, success, error);
}

function tryCreateGasStop(position, stepIdx, type, offset, success, error) {
    var stop = {
        position: position,
        stepIdx : stepIdx,
        type: type,
        options: [],
        offset: offset
    };
    getGasAtStop(stop, success, error);
    return stop;
}

function calculateStops(route) {

    if (stopTime > 0) {
        var foodStops = [];
        for (var i = stopTime; i < gTotalTripDistance; i += stopTime) {
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
        for (var i = driveTime; i < gTotalTripDistance; i += driveTime) {
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
        stepIdx: stepIdx,
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
    if (data.lat < 49) data.country = "US";
    else data.country = "CAN";
    pendingAPICalls++;
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/services/searchproxy.asmx/GetBusinessTypesAtLocation",
        data: "{ search: '" + data.search + "', lat: " + data.lat + ", lng: " + data.lng + ", country: '" + data.country + "'}",
        dataType: "json",
        success: function (data) {
            pendingAPICalls--;
            var result = JSON.parse(data.d);
            if (result.length < 5) {
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

var $window = $(window);
var $sidebar = $('.sidebar');
var $header = $('.header');

function enumerate() {
    $("#parameters .input-row").each(function (i, el) {
        $(".option-key", el).html(i + 1);
    });
}

$(document).ready(function () {
    init();

    var showDialog = (!(origin && destination));

    $("#first-run-dialog").dialog({
        title: "Where are you going?",
        modal: true,
        width: 800,
        autoOpen: showDialog,
        dialogClass: 'alert',
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
    var urlOrigin = getParameterByName("o");
    if (urlOrigin) $('#input-origin').val(urlOrigin);
    var urlDestination = getParameterByName("d");
    if (urlDestination) $('#input-destination').val(urlDestination);
    var tripid = getParameterByName("tripid");
    if (tripid) {
        getTripData(tripid);
    }

    $('#dialog-submit').click(function () {
        var url = "index.html?" +
                    "o=" + $("#input-origin").val() +
                    "&d=" + $("#input-destination").val();

        window.location.href = url;
    });

    $('#add-destination').click(function () {
        var newRow = $($("#destination-row").html());
        $("#parameters > .option-row").before(newRow);
        enumerate();
        newRow.slideToggle();
    });

    $('#parameters .option-remove').live("click", function () {
        $(this).parent(".input-row").slideToggle("250", function () {
            $(this).remove();
            enumerate();
        });
    });
});

function SetMapPosition(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    map.panTo(latlng);
    map.setZoom(14);
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}