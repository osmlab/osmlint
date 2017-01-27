  'use strict';
  var turf = require('turf');

  module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var osmlint = 'missingroundabout';
    var result = [];
    for (var i = 0; i < layer.features.length; i++) {
      var val = layer.features[i];
      if (val.geometry.type === 'LineString' && (val.properties.highway === 'motorway' || val.properties.highway === 'trunk' || val.properties.highway === 'primary' || val.properties.highway === 'secondary' || val.properties.highway === 'tertiary' || val.properties.highway === 'residential' && val.properties.highway === 'tertiary' && val.properties.highway === 'service' && val.properties.service === 'parking_aisle') && !val.properties.junction && !val.properties.oneway && val.geometry.coordinates[0][0] === val.geometry.coordinates[val.geometry.coordinates.length - 1][0] && val.geometry.coordinates[0][1] === val.geometry.coordinates[val.geometry.coordinates.length - 1][1]) {
        val.properties._osmlint = osmlint;
        result.push(val);
      }
    }

    if (result.length > 0) {
      var fc = turf.featurecollection(result);
      writeData(JSON.stringify(fc) + '\n');
    }

    done(null, null);
  };
