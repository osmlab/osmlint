'use strict'
var _ = require('underscore');
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = [];
  var values = layer.features.filter(function(val) {
    var hasKeys = _.allKeys(val.properties).filter(function(k) {
      return k.charAt(0) != '_';
    }).length === 0;
    if (hasKeys) {
      val.properties._osmlint = 'untaggedway';
      return true;
    }
  });

  values = values.filter(function(value) {
    var first_coor = value.geometry.coordinates[0];
    var end_coor = value.geometry.coordinates[value.geometry.coordinates.length - 1];
    if (first_coor[0] === end_coor[0] && first_coor[0] === end_coor[0]) {
      value.geometry.type = 'Polygon';
      value.geometry.coordinates = [value.geometry.coordinates];
      var kinks = turf.kinks(value);
      if (kinks.intersections.features.length === 0) {
        return false;
      }
    }
    return true;
  });

  while (values.length > 0) {
    var value = values[0];
    values.splice(0, 1);
    if (value.geometry.value === 'Polygon') {
      var flag = true;
      for (var j = 0; j < values.length; j++) {
        if (values[j].geometry.value === 'Polygon') {
          var intersect = turf.intersect(value, values[j]);
          if (intersect !== undefined) {
            flag = false;
          }
        }
      }
      if (flag) {
        result.push(value);
      }
    }
    result.push(value);
  }


  var fc = turf.featurecollection(result);
  writeData(JSON.stringify(fc) + '\n');

  done(null, null);
};