'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var start = Date.parse('Jul 1, 2017') / 1000;

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var output = {};
  for (var z = 0; z < layer.features.length; z++) {
    var obj = layer.features[z];
    if (obj.properties.highway && hasTag(obj.properties) && obj.properties['@timestamp'] >= start) {
      output[obj.properties['@id']] = obj;
    }
  }
  var result = _.values(output);
  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};

function hasTag(properties) {
  var preserveTags = {
    destination: true,
    'destination:ref': true,
    'destination:street': true,
    'destination:lanes': true,
    'destination:ref:lanes': true,
    'destination:ref:to': true,
    'destination:ref:to:lanes': true,
    ref: true,
    'ref:left': true,
    'ref:right': true,
    noref: true
  };
  for (var prop in properties) {
    if (preserveTags[prop]) {
      return true;
    }
  }
  return false;
}
