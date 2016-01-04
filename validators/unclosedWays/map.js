'use strict'
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    val.properties._osmlint = 'unclosedWays';
    var preserve_type = (val.properties.aeroway || val.properties.landuse || val.properties.building || val.properties.leisure); // no val.properties.natural
    if (val.geometry.type === 'LineString' && preserve_type) {
      var coordinates = val.geometry.coordinates;
      var first_coor = coordinates[0];
      var last_coor = coordinates[coordinates.length - 1];
      if (first_coor[0] === last_coor[0] && first_coor[1] === last_coor[1]) {
        return false;
      }
      return true;
    }
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};