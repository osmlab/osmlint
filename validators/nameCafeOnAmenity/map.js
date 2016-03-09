'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    if (val.properties.amenity == 'cafe' && val.properties.name && val.properties.name.toLowerCase().indexOf('cafe') !== -1) {

      val.properties._osmlint = 'namecafeonamenity';
      return true;
    }
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};