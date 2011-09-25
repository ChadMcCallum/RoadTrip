function kmPerHourToMetersPerSecond(kmh) {
    var metersPerSecond = kmh * 1000 / (60.0 * 60.0);
    return metersPerSecond;
}

function findStepAtDistance(distance, steps) {
    var accumulatedDistance = 0;
    var i = 0;
    // search steps while accumulating distance until you pass it
    for (i = 0; i < steps.length; i = i + 1) {
        accumulatedDistance = accumulatedDistance + steps[i].distance.value;
        if (accumulatedDistance > distance) {
            return i;
        }
    }
}

function findAccumulatedDistanceUpToStep(stepNumber, steps) {
    var accumulatedDistance = 0;
    var i = 0;
    for (i = 0; i < stepNumber; i = i + 1) {
        accumulatedDistance = accumulatedDistance + steps[i].distance.value;
    }
    return accumulatedDistance;
}

function getCoordinateXMetersIntoTrip(meters, steps) {
    var stepIdxToStartLerp = findStepAtDistance(meters, steps);

    var remaining = meters - findAccumulatedDistanceUpToStep(stepIdxToStartLerp, steps);
    var lerpRatio = remaining / steps[stepIdxToStartLerp].distance.value;  // percentage into the step

    var startLat = steps[stepIdxToStartLerp].start_location;
    var endLat = steps[stepIdxToStartLerp].end_location;

    var resultLat = google.maps.geometry.spherical.interpolate(startLat, endLat, lerpRatio);

    var results = {
        position: resultLat,
        stepIdx: stepIdxToStartLerp
    };
    return results;
}

function getCoordXSecondsIntoTrip(seconds, steps) {
    var distanceTravelled = seconds * kmPerHourToMetersPerSecond(100);
    return getCoordinateXMetersIntoTrip(distanceTravelled, steps);
}

function PSOverlay(point, data, map) {
    // Now initialize all properties.
    this.point_ = point;
    this.data_ = data;
    this.map_ = map;

    // We define a property to hold the image's
    // div. We'll actually create this div
    // upon receipt of the add() method so we'll
    // leave it null for now.
    this.div_ = null;

    // Explicitly call setMap() on this overlay
    this.setMap(map);
}

PSOverlay.prototype = new google.maps.OverlayView();

PSOverlay.prototype.onAdd = function () {
    // Note: an overlay's receipt of onAdd() indicates that
    // the map's panes are now available for attaching
    // the overlay to the map via the DOM.

    // Create the DIV and set some basic attributes.
    var div = $("#overlay-template").tmpl(this.data_);

    // Set the overlay's div_ property to this DIV
    this.div_ = div;

    // We add an overlay to a map via one of the map's panes.
    // We'll add this overlay to the overlayImage pane.
    var panes = this.getPanes();
    $(panes.floatPane).append(div);
    div.children('.overlay-contents').toggle(350);
};

PSOverlay.prototype.draw = function () {
    // Size and position the overlay. We use a southwest and northeast
    // position of the overlay to peg it to the correct position and size.
    // We need to retrieve the projection from this overlay to do this.
    var overlayProjection = this.getProjection();

    // Retrieve the southwest and northeast coordinates of this overlay
    // in latlngs and convert them to pixels coordinates.
    // We'll use these coordinates to resize the DIV.
    var pt = overlayProjection.fromLatLngToDivPixel(this.point_);

    // Resize the image's DIV to fit the indicated dimensions.
    var $div = $(this.div_);
    $div.css("left", pt.x + 32);
    $div.css("top", pt.y - 32);
};

PSOverlay.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};
