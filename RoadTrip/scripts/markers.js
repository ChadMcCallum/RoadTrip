var foodImage = new google.maps.MarkerImage(
  '/images/icons/food.png',
  new google.maps.Size(64, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 64)
);

var gasImage = new google.maps.MarkerImage(
  '/images/icons/gas.png',
  new google.maps.Size(64, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 64)
);

var hotelImage = new google.maps.MarkerImage(
  '/images/icons/hotels.png',
  new google.maps.Size(64, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 64)
);

var markerShadow = new google.maps.MarkerImage(
  '/images/icons/shadow.png',
  new google.maps.Size(100, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 64)
);

var markerShape = {
    coord: [0, 0, 64, 64],
    type: 'rect'
};

var globalMarkerArray = [];

function foodMarker(map, position, business) {
    var marker = new google.maps.Marker({
        icon: foodImage,
        shadow: markerShadow,
        shape: markerShape,
        position: position,
        business: business
    });
    globalMarkerArray.push(marker);
    return marker;
}

function gasMarker(map, position, business) {
var marker = new google.maps.Marker({
        icon: gasImage,
        shadow: markerShadow,
        shape: markerShape,
        position: position,
        business: business
    });
    globalMarkerArray.push(marker);
    return marker;
}

function hotelMarker(map, position, business) {
    var marker = new google.maps.Marker({
        icon: hotelImage,
        shadow: markerShadow,
        shape: markerShape,
        position: position,
        business: business
    });
    globalMarkerArray.push(marker);
    return marker;
}