

function printDirectionStep(step) {
//    console.log(step.duration.text + " " + step.duration.value + " " + step.distance.text +
//    " " + step.start_location.toString());
}

function kmPerHourToMetersPerSecond(kmh) {
    var metersPerHour = kmh * 1000;
    var metersPerSecond = metersPerHour / (60.0 * 60.0);
    return metersPerSecond;
}

function findStepAtDistance(distance, steps) {
    var accumulatedDistance = 0;
    // search steps while accumulating distance until you pass it
    for (i = 0; i < steps.length; i = i + 1) {
        var stepDistanceFromStart = accumulatedDistance + steps[i].distance.value;
        if (stepDistanceFromStart > distance) {
            return i;
        }
        accumulatedDistance = stepDistanceFromStart;
    }
}

function findAccumulatedDistanceUpToStep(stepNumber, steps) {
    var accumulatedDistance = 0;
    for (i = 0; i < stepNumber; i = i + 1) {
        accumulatedDistance = accumulatedDistance + steps[i].distance.value;
    }
    return accumulatedDistance;
}

function getCoordinateXMetersIntoTrip(meters, steps) {
    var stepIdxToStartLerp = findStepAtDistance(meters, steps);
    var accumulatedDistanceStartLerp = findAccumulatedDistanceUpToStep(stepIdxToStartLerp, steps);

    var remaining = meters - accumulatedDistanceStartLerp;
    var lerpRange = steps[i].distance.value;

    var lerpRatio = remaining / lerpRange;  // percentage into the step

    var startLat = steps[i].start_location;
    var endLat = steps[i].end_location;

    var resultLat = google.maps.geometry.spherical.interpolate(startLat, endLat, lerpRatio);

    // TODO: debug code
    for (i = 0; i < steps.length; i = i + 1) {

        steps[i].distance
        printDirectionStep(steps[i]);
        var polyline = steps[i].polyline;
        var path = google.maps.geometry.encoding.decodePath(polyline.points);
    }
    //console.log(resultLat.toString());
    return resultLat;
}

function getCoordXSecondsIntoTrip(seconds, steps) {
    var kSpeed = kmPerHourToMetersPerSecond(100);

    var distanceTravelled = seconds * kSpeed;
    return getCoordinateXMetersIntoTrip(distanceTravelled, steps);
}