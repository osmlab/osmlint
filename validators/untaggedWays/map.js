'use strict';

var _ = require('underscore');
var turf = require('turf');

// Find untagged ways.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    var hasKeys = _.allKeys(val.properties).filter(function(k) {
      return k.charAt(0) !== '_';
    }).length === 0;
    if (hasKeys) {
      val.properties._osmlint = 'untaggedway';
      return true;
    }
  });

  result = result.filter(function(value) {
    var firstCoord = value.geometry.coordinates[0];
    var endCoord = value.geometry.coordinates[value.geometry.coordinates.length - 1];
    if (firstCoord[0] === endCoord[0] && firstCoord[1] === endCoord[1]) {
      return false;
    }
    return true;
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
