  'use strict';
  var turf = require('turf');
  var _ = require('underscore');

  module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var osmlint = 'missingroundabout';
    var result = [];
    var majorRoads = {
      'motorway': true,
      'trunk': true,
      'primary': true,
      'secondary': true,
      'tertiary': true,
      'motorway_link': true,
      'trunk_link': true,
      'primary_link': true,
      'secondary_link': true,
      'tertiary_link': true
    };
    var minorRoads = {
      'unclassified': true,
      'residential': true
    };

    var preserveType = {};
    preserveType = _.extend(preserveType, majorRoads);
    preserveType = _.extend(preserveType, minorRoads);

    for (var i = 0; i < layer.features.length; i++) {
      var val = layer.features[i];
      var coords = val.geometry.coordinates;
      if (val.geometry.type === 'LineString' && preserveType[val.properties.highway] &&
        !val.properties.junction && !val.properties.oneway &&
        coords[0][0] === coords[coords.length - 1][0] &&
        coords[0][1] === val.geometry.coordinates[coords.length - 1][1]) {
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
