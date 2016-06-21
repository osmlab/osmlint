'use strict';
var time = require('time')(Date);
var turf = require('turf');
var users = require('mapbox-data-team').getUsernames();
var today = (time.time() - 7 * 24 * 60 * 60);

users = users.reduce(function(memo, currentValue) {
  memo[currentValue.toString()] = true;
  return memo;
}, {});

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = layer.features.filter(function(val) {
    val.properties._osmlint = 'filterdatateam';
    return (users.hasOwnProperty(val.properties['@user']) && val.properties['@timestamp'] >= today);
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
