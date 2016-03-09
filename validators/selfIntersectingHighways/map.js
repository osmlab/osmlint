'use strict';
var turf = require('turf');
var _ = require('underscore');

// Find self intersecting highways.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var output = [];
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
        output.push(highway);
      }
    }
  }
  var result = [];

  for (var j = 0; j < output.length; j++) {
    var road = output[j];
    var roadLength = output[j].geometry.coordinates.length;
    var intersect = turf.intersect(road, output[j]);
    if (intersect.geometry.coordinates.length > roadLength) {
      if (majorRoads[road.properties.highway]) {
        intersect.properties._type = 'major';
      } else if (minorRoads[road.properties.highway]) {
        intersect.properties._type = 'minor';
      } else if (pathRoads[road.properties.highway]) {
        intersect.properties._type = 'path';
      }
      road.properties._osmlint = osmlint;
      result.push(road);
    }
  }
  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};
