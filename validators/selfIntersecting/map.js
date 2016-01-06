'use strict'
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    val.properties._osmlint = 'selfintersecting';
    return (val.properties.highway && val.geometry.type === 'LineString');
  });
  result = result.filter(function(val) {
    var highway = val;
    var road_length = val.geometry.coordinates.length;
    var intersect = turf.intersect(highway, val);
    if (intersect.geometry.coordinates.length > road_length) {
      return true;
    }
  });
  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};