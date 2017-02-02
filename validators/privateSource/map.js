'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'privatesource';
  var result = [];
  var unallowedSource = {
    'Google Maps': true,
    'Google Satellite': true,
    'Google Earth': true,
    'Google Street View': true,
    'Waze': true,
    'HERE Maps': true,
    'Geodata from Wikipedia': true,
    'Wikimapia': true,
    'Malfreemaps': true,
    'Malsingmaps': true
  };
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.source && unallowedSource[val.properties.source]) {
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
