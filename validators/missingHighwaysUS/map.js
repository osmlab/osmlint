'use strict';
var turf = require('turf');
var preserveType = {
  'motorway': true,
  'primary': true,
  'secondary': true,
  'tertiary': true,
  'trunk': true,
  'residential': true,
  'unclassified': true
};

module.exports = function(tileLayers, tile, writeData, done) {
  var osm = tileLayers.osm.osm;
  var tiger = tileLayers.tiger.tiger2015;
  var osmFC = osm.features.filter(function(val) {
    return val.properties.highway && (val.geometry.type === 'LineString') && preserveType[val.properties.highway] && !val.properties.name && !val.properties.ref;
  });
  var tigerFC = tiger.features.filter(function(val) {
    return val.properties.FULLNAME && (val.geometry.type === 'LineString');
  });
  var result = [];
  if (osmFC.length > 0) {
    osmFC.forEach(function(way) {
      var buffer = turf.buffer(way, 0.004, 'miles');
      tigerFC.forEach(function(line) {
        var tigerPoints = turf.explode(line);
        var nodes;
        nodes = turf.within(tigerPoints, buffer);
        if (nodes.features.length >= (tigerPoints.features.length / 2) && line.properties.FULLNAME) {
          way.properties._osmlint = 'missinghighwayus';
          way.properties.name = line.properties.FULLNAME;
          result.push(way);
        }
      });
    });
  }

  var fc = turf.featurecollection(result);
  writeData(JSON.stringify(fc) + '\n');

  done(null, null);
};
