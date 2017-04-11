'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = '01_dir_template';
  var result = 0;
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    //here comes all your code to validate the data
    if (val.geometry.type == 'LineString') {
      var dist = turf.lineDistance(val, 'kilometers');
      result = result + dist;
      // writeData(dist + '\n')
    }
    // val.properties._osmlint = osmlint;
    // result.push(val);
  }

  if (result > 0) {
    // var fc = turf.featureCollection(result);
    writeData('"' + tile + '",' + result + '\n');
  }

  done(null, null);
};