'use strict';
var turf = require('turf');
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var obj = layer.features[i];
    if (obj.properties.natural == 'wood' && obj.properties['@type'] === 'relation') {
      result.push(obj);
    }
  }

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};