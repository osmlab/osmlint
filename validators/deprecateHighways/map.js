'use strict';
var turf = require('@turf/turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = [];
  /* eslint-disable camelcase */
  var deprecatedFeatures = {
    incline: true,
    incline_steep: true,
    stile: true,
    unsurfaced: true,
    minor: true,
    byway: true,
    ford: true,
    no: true,
    road: true
  };
  /* eslint-enable camelcase */
  var osmlint = 'deprecateroads';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.highway && deprecatedFeatures[val.properties.highway]) {
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
