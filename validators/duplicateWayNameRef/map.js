'use strict';
var turf = require('@turf/turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'duplicatewaynameref';
  var majorRoads = {
    motorway: true,
    trunk: true,
    primary: true,
    secondary: true,
    tertiary: true,
    motorway_link: true,
    trunk_link: true,
    primary_link: true,
    secondary_link: true,
    tertiary_link: true
  };
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.name && val.properties.ref) {
      var ref = val.properties.ref.replace(/\s+/g, '').toLowerCase();
      var name = val.properties.name.replace(/\s+/g, '').toLowerCase();
      if (
        val.properties.highway &&
        majorRoads[val.properties.highway] &&
        (ref.indexOf('-') > -1 || (name.indexOf(ref) > -1 && hasNumbers(ref) && ref.length > 1))
      ) {
        val.properties._osmlint = osmlint;
        result.push(val);
      }
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};

function hasNumbers(t) {
  var regex = /\d/g;
  return regex.test(t);
}
