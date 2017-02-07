'use strict';
var turf = require('turf');

// Identify Point geometries with a bridge tag.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    if (val.properties.bridge && (val.geometry.type === 'Point')) {
      val.properties._osmlint = 'bridgeonnode';
      return true;
    }
  });

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
