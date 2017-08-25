'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'signpuntuaction';
  var result = [];
  var highways = {
    'motorway': true,
    'motorway_link': true,
    'trunk': true,
    'primary': true,
    'primary_link': true,
    'secondary_link': true,
    'tertiary': true,
    'residential': true,
    'service': true,
    'secondary': true,
    'unclassified': true
  };

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    val.properties._osmlint = osmlint;
    if (val.properties.highway &&
      highways[val.properties.highway] &&
      (val.properties.name &&
      (val.properties.name.indexOf('!') > -1 ||
      val.properties.name.indexOf('"') > -1 ||
      val.properties.name.indexOf('#') > -1 ||
      val.properties.name.indexOf('$') > -1 ||
      val.properties.name.indexOf('&') > -1 ||
      val.properties.name.indexOf('/') > -1 ||
      val.properties.name.indexOf('(') > -1 ||
      val.properties.name.indexOf(')') > -1 ||
      val.properties.name.indexOf('*') > -1 ||
      val.properties.name.indexOf('+') > -1 ||
      val.properties.name.indexOf(',') > -1 ||
      val.properties.name.indexOf('-') > -1 ||
      val.properties.name.indexOf(':') > -1 ||
      val.properties.name.indexOf(';') > -1 ||
      val.properties.name.indexOf('<') > -1 ||
      val.properties.name.indexOf('>') > -1 ||
      val.properties.name.indexOf('=') > -1 ||
      val.properties.name.indexOf('?') > -1 ||
      val.properties.name.indexOf('@') > -1 ||
      val.properties.name.indexOf('[') > -1 ||
      val.properties.name.indexOf(']') > -1 ||
      val.properties.name.indexOf('^') > -1 ||
      val.properties.name.indexOf('_') > -1 ||
      val.properties.name.indexOf('{') > -1 ||
      val.properties.name.indexOf('}') > -1)))
      result.push(val);
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
