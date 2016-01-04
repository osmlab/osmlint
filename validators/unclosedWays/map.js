'use strict'
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    val.properties._osmlint = 'unclosedWays';
    if (val.geometry.type === 'LineString' && (val.properties.landuse || val.properties.building)) {
      var coordinates = val.geometry.coordinates;
      var first_coor = coordinates[0];
      var last_coor = coordinates[coordinates.length - 1];
      if (first_coor[0] === last_coor[0] && first_coor[1] === last_coor[1]) {
        return false;
      }
      return true;
      // var first_point = turf.point(first_coor);
      // var point_last = turf.point(last_coor);
      // var units = "kilometers";
      // var distance = turf.distance(first_point, point_last, units) / 1000; //meters
      // return (distance < 5); //return ways wich are unclosed 
    }
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};