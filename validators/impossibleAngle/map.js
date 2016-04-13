'use strict';
var turf = require('turf');
var _ = require('underscore');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
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
    // 'service': true,
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
  // preserveType = _.extend(preserveType, pathRoads);
  var highways = [];
  var osmlint = 'impossibleangle';
  var output = {};

  for (var i = 0; i < layer.features.length; i++) {
    var valueHighway = layer.features[i];
    if (preserveType[valueHighway.properties.highway] && valueHighway.geometry.type === 'LineString' && valueHighway.geometry.coordinates.length > 2) {
      highways.push(valueHighway);
    } else if (preserveType[valueHighway.properties.highway] && valueHighway.geometry.type === 'MultiLineString') {
      var flat = flatten(valueHighway);
      for (var f = 0; f < flat.length; f++) {
        if (flat[f].geometry.type === 'LineString' && flat[f].geometry.coordinates.length > 2) {
          flat[f].properties = valueHighway.properties;
          highways.push(flat[f]);
        }
      }
    }
  }

  for (var z = 0; z < highways.length; z++) {
    var coords = highways[z].geometry.coordinates;
    for (var j = 0; j < coords.length - 2; j++) {
      var angle = findAngle(coords[j], coords[j + 1], coords[j + 2]);
      if (angle < 10) {
        var point = turf.point(coords[j + 1]);
        var type;
        if (majorRoads[highways[z].properties.highway]) {
          type = 'major';
        } else if (minorRoads[highways[z].properties.highway]) {
          type = 'minor';
        } else if (pathRoads[highways[z].properties.highway]) {
          type = 'path';
        }
        point.properties = {
          _fromWay: highways[z].properties._osm_way_id,
          _type: type,
          _osmlint: osmlint
        };
        highways[z].properties._osmlint = osmlint;
        output[highways[z].properties._osm_way_id] = highways[z];
        output[coords[j + 1].join('-')] = point;
      }
    }
  }

  var result = _.values(output);

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);

};

function findAngle(A, B, C) {
  //A first point; C second point; B center point
  var pi = 3.14159265;
  var AB = Math.sqrt(Math.pow(B[0] - A[0], 2) + Math.pow(B[1] - A[1], 2));
  var BC = Math.sqrt(Math.pow(B[0] - C[0], 2) + Math.pow(B[1] - C[1], 2));
  var AC = Math.sqrt(Math.pow(C[0] - A[0], 2) + Math.pow(C[1] - A[1], 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * (180 / pi);
}
