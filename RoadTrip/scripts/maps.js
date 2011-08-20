

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

function findPathSegmentAtDistance(distance, paths) {
    var accumulatedDistance = 0;
    for (i = 0; i < (paths.length - 1); i = i + 1) {
        var stepDistanceFromPathStart = accumulatedDistance + google.maps.geometry.spherical.computeDistanceBetween(paths[i], paths[i + 1]);
        if (stepDistanceFromPathStart > distance) {
            return i;
        }
        accumulatedDistance = stepDistanceFromPathStart;
    }
}

function findAccumulatedDistanceUpToPath(pathIdx, paths) {
    var accumulatedDistance = 0;
    for (i = 0; i < pathIdx; i = i + 1) {
        accumulatedDistance = accumulatedDistance + google.maps.geometry.spherical.computeDistanceBetween(paths[i], paths[i + 1]);
    }
    return accumulatedDistance;
}

function findDistanceOfPathSegment(pathIdx, paths) {
    return google.maps.geometry.spherical.computeDistanceBetween(paths[pathIdx], paths[pathIdx + 1]);
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

    // crude lerp
    var resultLat = google.maps.geometry.spherical.interpolate(startLat, endLat, lerpRatio);

    // do finder lerping on polyline
    var polyline = steps[stepIdxToStartLerp].polyline;
    var path = google.maps.geometry.encoding.decodePath(polyline.points);
    var idxPathSegment = findPathSegmentAtDistance(remaining, path);
    var remainingInsidePath = remaining - findAccumulatedDistanceUpToPath(idxPathSegment, path);
    var fineLerpRange = findDistanceOfPathSegment(idxPathSegment, path);
    var fineLerpRatio = remainingInsidePath / fineLerpRange;

    var pathStartLocation = path[idxPathSegment];
    var pathEndLocation = path[idxPathSegment + 1];
    var fineResultLat = google.maps.geometry.spherical.interpolate(pathStartLocation, pathEndLocation, fineLerpRatio);

//    console.log("path length: " + google.maps.geometry.spherical.computeLength(path));
//    console.log("step distance: " + steps[stepIdxToStartLerp].distance.value);
//    var verifyLength = 0;
//    for (j = 0; j < path.length - 1; j = j + 1) {
//        verifyLength = verifyLength + google.maps.geometry.spherical.computeDistanceBetween(path[j], path[j + 1]);
//    }
//    console.log("verify path length: " + verifyLength);

    console.log("crudeResult: " + resultLat.toString());
    console.log("fineResult: " + fineResultLat.toString());
    return fineResultLat;
}