'use strict';
var turf = require('turf');
var levenshtein = require('fast-levenshtein');
var preserveType = require('./value_area');
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'misspelledtags';
  var preserveTypeKeys = _.keys(preserveType);
  var result = layer.features.filter(function(val) {
    var keys = _.keys(val.properties);
    keys = _.difference(keys, ['@id', '@type', '@version', '@changeset', '@uid', '@user', '@timestamp']);
    for (var i = keys.length - 1; i >= 0; i--) {
      var preserveTypeValueKeys = preserveType[keys[i]];
      if (preserveTypeKeys.indexOf(keys[i]) === -1) {
        for (var j = preserveTypeKeys.length - 1; j >= 0; j--) {
          if (levenshtein.get(keys[i], preserveTypeKeys[j]) < 2) {
            val.properties._osmlint = osmlint;
            return true;
          }
        }
      } else if (preserveTypeValueKeys !== 'undefined' && preserveTypeValueKeys.indexOf(val.properties[keys[i]]) === -1) {
        for (var k = preserveTypeValueKeys.length - 1; k >= 0; k--) {
          if (val.properties[keys[i]] !== preserveTypeValueKeys[k] && levenshtein.get(val.properties[keys[i]], preserveTypeValueKeys[k]) < 2) {
            val.properties._osmlint = osmlint;
            return true;
          }
        }
      }
    }
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};
