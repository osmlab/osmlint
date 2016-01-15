'use strict';
var turf = require('turf');

// Identify Point geometries with a bridge tag.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    if (val.properties.junction && val.properties.junction === 'roundabout') {
      var coordinates = val.geometry.coordinates;
      var coordinatesLength = coordinates.length;
      var start = turf.point(coordinates[0]);
      var end = turf.point(coordinates[coordinatesLength - 1]);
      var distance = turf.distance(start, end, 'kilometers');
      if (distance >= 0.02) {
        val.properties._osmlint = 'falseroundabout';
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
