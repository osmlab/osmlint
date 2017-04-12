'use strict';
var turf = require('turf');

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
    'wikimapia'
  ];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.source && typeof val.properties.source !== 'number') {
      for (var k = 0; k < unallowedSource.length; k++) {
        var source = val.properties.source.toLowerCase();
        if (source.indexOf(unallowedSource[k]) > -1) {
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
