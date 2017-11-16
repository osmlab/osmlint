'use strict';

var turf = require('@turf/turf');
var _ = require('underscore');
var levenshtein = require('fast-levenshtein');

//Finding highway names that match with the user name.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'usernamematch';
  var highways = [];

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.highway &&
      val.properties.name &&
      (val.properties.name.indexOf(' ' + val.properties['@user']) > -1 || val.properties.name.indexOf(val.properties['@user'] + ' ') > -1 ||
        levenshtein.get(val.properties.name, val.properties['@user']) < 2)) {
      val.properties._osmlint = osmlint;
      highways.push(val);
    }
  }

  var result = _.values(highways);
  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};
