'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = '01_dir_template';
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];

    if (val.properties.aeroway && val.properties.aerodrome && (val.geometry.type === 'Polygon' || val.geometry.type === 'MultiPolygon')) {
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