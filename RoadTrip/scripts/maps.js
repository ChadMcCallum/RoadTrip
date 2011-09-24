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
    var lerpRange = steps[stepIdxToStartLerp].distance.value;

    var lerpRatio = remaining / lerpRange;  // percentage into the step

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
    var kSpeed = kmPerHourToMetersPerSecond(100);

    var distanceTravelled = seconds * kSpeed;
    return getCoordinateXMetersIntoTrip(distanceTravelled, steps);
}