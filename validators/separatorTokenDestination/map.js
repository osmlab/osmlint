'use strict';
var turf = require('@turf/turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'separatortokendestination';
  var motorwayRoads = {
    'motorway': true,
    'motorway_link': true,
    'primary': true,
    'primary_link': true,
    'secondary_link': true,
    'secondary': true
  };
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.highway &&
      motorwayRoads[val.properties.highway] &&
      (val.properties.destination && val.properties.destination.indexOf('|') > 0) ||
      ((val.properties['destination:ref'] && val.properties['destination:ref'].indexOf('|') > 0) ||
        (val.properties['destination:street'] && val.properties['destination:street'].indexOf('|') > 0))) {
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
