'use strict';
var turf = require('turf');
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
      if (highway.geometry.coordinates.length > 2) {
        highways.push(highway);
      }
    } else if (preserveType[highway.properties.highway] && highway.geometry.type === 'MultiLineString') {
      var arrayWays = flatten(highway);
      for (var f = 0; f < arrayWays.length; f++) {
        if (arrayWays[f].geometry.type === 'LineString' && arrayWays[f].geometry.coordinates.length > 2) {
          arrayWays[f].properties = highway.properties;
          highways.push(arrayWays[f]);
        }
      }
    }
  }

  var result = [];

  for (var j = 0; j < highways.length; j++) {
    var valueHighway = highways[j];
    var valueHighwaysCoords = valueHighway.geometry.coordinates;
    var repeatedCoords = [];
    var vhObjs = {};
    for (var z = 0; z < valueHighwaysCoords.length; z++) {
      var key = valueHighwaysCoords[z].join('-');
      if (vhObjs[key]) {
        if (z !== 0 && z !== valueHighwaysCoords.length - 1) {
          repeatedCoords.push(valueHighwaysCoords[z]);
        }
      } else {
        vhObjs[key] = valueHighwaysCoords[z];
      }
    }
    var type = classification(majorRoads, minorRoads, pathRoads, valueHighway.properties.highway);
    if (repeatedCoords.length > 0) {
      //save the multipoints
      for (var p = 0; p < repeatedCoords.length; p++) {
        var pointSurface = turf.point(repeatedCoords[p]);
        pointSurface.properties._osmlint = osmlint;
        pointSurface.properties._fromWay = valueHighway.properties['@id'];
        pointSurface.properties._type = type;
        result.push(pointSurface);
      }
      valueHighway.properties._type = type;
      valueHighway.properties._osmlint = osmlint;
      result.push(valueHighway);
    } else {
      var intersect = turf.intersect(valueHighway, valueHighway);

      if (intersect.geometry.coordinates.length > valueHighwaysCoords.length) {
        //MultiLinestring to Linestring
        var intersectCoords = intersect.geometry.coordinates.map(function(v) {
          return v[0];
        });

        for (var h = 0; h < intersectCoords.length; h++) {
          if (vhObjs[intersectCoords[h].join('-')]) {
            intersectCoords.splice(h, 1);
          }
        }
        for (var t = 0; t < intersectCoords.length; t++) {
          var pointIntersect = turf.point(intersectCoords[t]);
          pointIntersect.properties._osmlint = osmlint;
          pointIntersect.properties._fromWay = valueHighway.properties['@id'];
          pointIntersect.properties._type = type;
          result.push(pointIntersect);
        }
        valueHighway.properties._type = type;
        valueHighway.properties._osmlint = osmlint;
        result.push(valueHighway);
      }
    }
  }

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
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
