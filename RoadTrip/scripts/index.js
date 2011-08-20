function getDirections() {
    var request = {
        origin: 'Vancouver, BC',
        destination: 'Regina, SK',
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
        }
    });
}

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

function init() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);

    getDirections();
}