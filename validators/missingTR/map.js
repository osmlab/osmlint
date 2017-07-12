'use strict';
var turf = require('turf');
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.outputgeojson;
  var osmlint = '01_dir_template';
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var members = {
      from: false,
      via: false,
      to: false
    }
    for (var j = 0; j < val.properties.members.length; j++) {
      var m = val.properties.members[j];
      if (members[m.label]) {
        members[n.label] = true;
      }
    }
    if (_.uniq(_.values(members)).length === 2) {
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