'use strict';
var turf = require('turf');
var users = require('mapbox-data-team').getUsernames();

// Filter features touched by list of users defined by users.json
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    return (users.indexOf(val.properties._user) > -1);
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
