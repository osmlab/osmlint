'use strict';
var time = require('time')(Date);
var today = time.time() - 7 * 24 * 60 * 60;
var turf = require('@turf/turf');

// Filter features that are touched in the last 7 days.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(obj) {
    return obj.properties['@timestamp'] >= today;
  });

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
