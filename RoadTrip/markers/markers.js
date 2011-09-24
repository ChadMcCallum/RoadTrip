var foodImage = new google.maps.MarkerImage(
  '/markers/food/marker-images/image.png',
  new google.maps.Size(64, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 64)
);

var foodShadow = new google.maps.MarkerImage(
  '/markers/food/marker-images/shadow.png',
  new google.maps.Size(100, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 64)
);

var foodShape = {
    coord: [0, 0, 64, 64],
    type: 'rect'
};

var globalMarkerArray = [];

function foodMarker(map, position, business) {
    var marker = new google.maps.Marker({
        icon: foodImage,
        shadow: foodShadow,
        shape: foodShape,
        position: position,
        business: business
    });
    globalMarkerArray.push(marker);
    addMarkerListener(marker);
    return marker;
}

var gasImage = new google.maps.MarkerImage(
  '/markers/gas/marker-images/image.png',
  new google.maps.Size(64, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 64)
);

var gasShadow = new google.maps.MarkerImage(
  '/markers/gas/marker-images/shadow.png',
  new google.maps.Size(100, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 64)
);

var gasShape = {
    coord: [0, 0, 64, 64],
    type: 'rect'
};

function gasMarker(map, position, business) {
var marker = new google.maps.Marker({
        icon: gasImage,
        shadow: gasShadow,
        shape: gasShape,
        position: position,
        business: business
    });
    globalMarkerArray.push(marker);
    addMarkerListener(marker);
    return marker;
}

var hotelImage = new google.maps.MarkerImage(
  '/markers/hotel/marker-images/image.png',
  new google.maps.Size(64, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 64)
);

var hotelShadow = new google.maps.MarkerImage(
  '/markers/hotel/marker-images/shadow.png',
  new google.maps.Size(100, 64),
  new google.maps.Point(0, 0),
  new google.maps.Point(0, 64)
);

var hotelShape = {
    coord: [0, 0, 64, 64],
    type: 'rect'
};

function hotelMarker(map, position, business) {
    var marker = new google.maps.Marker({
        icon: hotelImage,
        shadow: hotelShadow,
        shape: hotelShape,
        position: position,
        business: business
    });
    globalMarkerArray.push(marker);
    addMarkerListener(marker);
    return marker;
}

var infoWindow = new google.maps.InfoWindow();
function addMarkerListener(marker) {
    google.maps.event.addListener(marker, 'click', function () {
        $('#detail-dialog .detail-left img').attr('src', marker.getIcon().url);
        $('#detail-dialog .detail-right .name').html(marker.business.name);
        var address = marker.business.address.street + "<br />" + marker.business.address.city + ", " +
            marker.business.address.prov;
        $('#detail-dialog .detail-right .address').html(address);
        infoWindow.setContent($('#detail-dialog').html());
        infoWindow.open(map, marker);
    });
}