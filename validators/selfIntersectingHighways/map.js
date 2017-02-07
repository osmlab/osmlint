'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var flatten = require('geojson-flatten');

// Find self intersecting highways.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = [];
  var majorRoads = {
    'motorway': true,
    'trunk': true,
    'primary': true,
    'secondary': true,
    'tertiary': true,
    'motorway_link': true,
    'trunk_link': true,
    'primary_link': true,
    'secondary_link': true,
    'tertiary_link': true
  };
  var minorRoads = {
    'unclassified': true,
    'residential': true,
    'living_street': true,
    'service': true,
    'road': true
  };
  var pathRoads = {
    'pedestrian': true,
    'track': true,
    'footway': true,
    'path': true,
    'cycleway': true,
    'steps': true
  };
  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);
  //preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'selfintersectinghighways';
  for (var i = 0; i < layer.features.length; i++) {
    var highway = layer.features[i];
    if (preserveType[highway.properties.highway] && highway.geometry.type === 'LineString') {
      if (highway.geometry.coordinates.length > 2 && !(highway.geometry.coordinates.length.length === 3 && highway.geometry.coordinates[0][0] !== highway.geometry.coordinates[2][0] && highway.geometry.coordinates[0][1] !== highway.geometry.coordinates[2][1])) {
        highways.push(highway);
      }
    } else if (preserveType[highway.properties.highway] && highway.geometry.type === 'MultiLineString') {
      var arrayWays = flatten(highway);
      for (var f = 0; f < arrayWays.length; f++) {
        if (arrayWays[f].geometry.type === 'LineString' && arrayWays[f].geometry.coordinates.length > 2 && !(arrayWays[f].geometry.coordinates.length.length === 3 && arrayWays[f].geometry.coordinates[0][0] !== arrayWays[f].geometry.coordinates[2][0] && arrayWays[f].geometry.coordinates[0][1] !== highway.geometry.coordinates[2][1])) {
          arrayWays[f].properties = highway.properties;
          highways.push(arrayWays[f]);
        }
      }
    }
  }

  var result = [];

  for (var j = 0; j < highways.length; j++) {
    var highwayToEvaluate = highways[j];
    var highwayToEvaluateCoords = highwayToEvaluate.geometry.coordinates;
    var repeatedCoords = [];
    var vhObjs = {};
    for (var z = 0; z < highwayToEvaluateCoords.length; z++) {
      var key = highwayToEvaluateCoords[z].join('-');
      if (vhObjs[key]) {
        if (z !== 0 && z !== highwayToEvaluateCoords.length - 1) {
          repeatedCoords.push(highwayToEvaluateCoords[z]);
        }
      } else {
        vhObjs[key] = highwayToEvaluateCoords[z];
      }
    }
    var type = classification(majorRoads, minorRoads, pathRoads, highwayToEvaluate.properties.highway);
    if (repeatedCoords.length > 1) {
      // Save multipoints
      for (var p = 0; p < repeatedCoords.length; p++) {
        var repeatedPoint = turf.point(repeatedCoords[p]);
        repeatedPoint.properties._osmlint = osmlint;
        repeatedPoint.properties._fromWay = highwayToEvaluate.properties['@id'];
        repeatedPoint.properties._type = type;
        result.push(repeatedPoint);
      }
      highwayToEvaluate.properties._type = type;
      highwayToEvaluate.properties._osmlint = osmlint;
      result.push(highwayToEvaluate);
    } else {
      var intersect = turf.intersect(highwayToEvaluate, highwayToEvaluate);
      if (intersect.geometry.coordinates.length > highwayToEvaluateCoords.length) {
        var intersectObjs = {};
        for (var m = 0; m < intersect.geometry.coordinates.length; m++) {
          if (!vhObjs[intersect.geometry.coordinates[m][0].join('-')]) {
            intersectObjs[intersect.geometry.coordinates[m][0].join('-')] = intersect.geometry.coordinates[m][0];
          }
        }
        var intersectCoords = _.values(intersectObjs);
        for (var t = 0; t < intersectCoords.length; t++) {
          var intersectPoint = turf.point(intersectCoords[t]);
          intersectPoint.properties._osmlint = osmlint;
          intersectPoint.properties._fromWay = highwayToEvaluate.properties['@id'];
          intersectPoint.properties._type = type;
          result.push(intersectPoint);
        }
        highwayToEvaluate.properties._type = type;
        highwayToEvaluate.properties._osmlint = osmlint;
        result.push(highwayToEvaluate);
      }
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);

};

function classification(major, minor, path, highway) {
  if (major[highway]) {
    return 'major';
  } else if (minor[highway]) {
    return 'minor';
  } else if (path[highway]) {
    return 'path';
  }
}
