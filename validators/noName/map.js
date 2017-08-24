'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'noname';
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];

    if (val.properties.highway && val.properties.name && val.properties.name.replace(/\s/g, '').replace(/-/g, '').toLowerCase().indexOf('noname') > -1) {
      val.properties._osmlint = osmlint;
      result.push(val);
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
