'use strict';
var turf = require('turf');

// Filter all objects which has fixme tag.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'fixmetag';
  var result = layer.features.filter(function(obj) {
    if (obj.properties.fixme || obj.properties.FIXME) {
      obj.properties._osmlint = osmlint;
      return true;
    }
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};
