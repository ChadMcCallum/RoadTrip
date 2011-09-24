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