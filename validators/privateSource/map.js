'use strict';
var turf = require('turf');
var fastl = require('fast-levenshtein');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'privatesource';
  var result = [];
  var unallowedSource = [
    'google',
    'nokia',
    'here',
    'waze',
    'apple',
    'tomtom',
    'import',
    'wikimapia'
  ];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.source) {
      for (var k = 0; k < unallowedSource.length; k++) {
        if (val.properties.source.toLowerCase().includes(unallowedSource[k]) || fastl.get(val.properties.source.toLowerCase(), unallowedSource[k]) < 3) {
          val.properties._osmlint = osmlint;
          result.push(val);
        }
      }
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
