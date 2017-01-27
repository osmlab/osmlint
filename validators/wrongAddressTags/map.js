'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'wrongaddresstags';
  var result = [];

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];

    if (val.properties['addr:housenumber'] && !(val.properties['addr:street'] || val.properties['addr:place'])) {
      val.properties._osmlint = osmlint;
      result.push(val);
    }
  }

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
