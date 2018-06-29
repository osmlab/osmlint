'use strict';
var turf = require('@turf/turf');

// Find highway=service;  service=drive-through without  oneway=yes.
//https://wiki.openstreetmap.org/wiki/Tag:service%3Ddrive-through

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
    var minorRoads = {
    service: true,
  };
  
  var result = layer.features.filter(function(val) {
    if (
      val.properties.highway &&
      val.properties.service == 'drive-through' &&	    
      !val.properties.oneway &&
      val.properties.oneway !== 'no' &&
      !val.properties.layer
    ) {
      val.properties._osmlint = 'missingonewaydrivethrough';
      val.properties._type = classification(
        minorRoads,
        val.properties.highway
      );
      return true;
    }
  });

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};

function classification(major, minor, path, highway) {
  if (major[highway]) {
    return 'major';
  } else if (minor[highway]) {
    return 'minor';
  }
}
