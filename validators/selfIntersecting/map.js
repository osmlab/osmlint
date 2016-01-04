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
    var first_coor = coordinates[0];
    var last_coor = coordinates[coordinates.length - 1];
    if (first_coor[0] === last_coor[0] && first_coor[1] === last_coor[1]) {
      return false;
    }
    var map = {};
    var flag = false;
    coordinates.forEach(function(coor) {
      if (map[coor.join(',')]) {
        flag = true;
      }
      map[coor.join(',')] = true;
    });
    return flag;
  });
  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};