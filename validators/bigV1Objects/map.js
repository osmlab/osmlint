'use strict';
var time = require('time')(Date);
var turf = require('@turf/turf');
var today = time.time() - 3 * 24 * 60 * 60;

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'bigv1objects';
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (
      (val.properties.aeroway ||
        val.properties.leisure ||
        val.properties.landuse ||
        val.properties.man_made ||
        val.properties.building) &&
      val.geometry.type === 'Polygon' &&
      val.properties['@version'] === 1 &&
      val.properties['@timestamp'] > today
    ) {
      var fc = {
        type: 'FeatureCollection',
        features: [val]
      };
      var area = turf.area(fc);
      if (area > 200000) {
        val.properties._osmlint = osmlint;
        result.push(val);
      }
    }
  }

  if (result.length > 0) {
    var features = turf.featureCollection(result);
    writeData(JSON.stringify(features) + '\n');
  }

  done(null, null);
};
