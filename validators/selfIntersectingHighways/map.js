'use strict';
var turf = require('turf');

// Find self intersecting highways.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    val.properties._osmlint = 'selfintersectinghighways';
    return val.properties.highway && val.geometry.type === 'LineString';
  });
  result = result.filter(function(val) {
    var highway = val;
    var roadLength = val.geometry.coordinates.length;
    var intersect = turf.intersect(highway, val);
    if (intersect.geometry.coordinates.length > roadLength) {
      return true;
    }
  });

  var fc = turf.featurecollection(result);
  writeData(JSON.stringify(fc) + '\n');

  done(null, null);
};
