'use strict'
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    val.properties._osmlint = 'selfintersecting';
    return (val.properties.highway && val.geometry.type === 'LineString');
  });
  result = result.filter(function(road) {
    var coordinates = road.geometry.coordinates;
    for (var i = 0; i < coordinates.length - 1; i++) {
      var line = turf.linestring([coordinates[i], coordinates[i + 1]]);
      var intersect = turf.intersect(line, road);
      if (intersect.geometry.type !== 'LineString') {
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