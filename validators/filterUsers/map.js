'use strict';

var turf = require('@turf/turf');
var users = require('mapbox-data-team').getUsernames();

users = users.reduce(function(memo, currentValue) {
  memo[currentValue.toString()] = true;
  return memo;
}, {});

// Filter features touched by list of users defined by users.json
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    return (users.hasOwnProperty(val.properties['@user']));

  });
  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
