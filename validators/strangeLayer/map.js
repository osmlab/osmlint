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
  preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'strangelayer';
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var valueHighway = layer.features[i];
    if (valueHighway.properties.bridge && valueHighway.properties.bridge !== 'no' && valueHighway.properties.layer && (isNaN(valueHighway.properties.layer) || parseInt(valueHighway.properties.layer) < 0)) {
      result.push(valueHighway);
    } else if (valueHighway.properties.tunnel && valueHighway.properties.tunnel !== 'no' && valueHighway.properties.layer && (isNaN(valueHighway.properties.layer) || parseInt(valueHighway.properties.layer) > 0)) {
      result.push(valueHighway);
    }
  }

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);

};