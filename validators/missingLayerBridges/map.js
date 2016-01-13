'use strict';
var turf = require('turf');

// Find bridges that does not have a layer tag
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    if (val.properties.bridge && val.geometry.type === 'LineString') {
      if (!val.properties.layer) {
        val.properties._osmlint = 'missinglayerbridges';
        return true;
      }
    }
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};

