'use strict'
var turf = require('turf');
var fs = require('fs');
var path = require('path');
var preserve_type = {
  "motorway": true,
  "primary": true,
  "secondary": true,
  "tertiary": true,
  "trunk": true,
  "residential": true,
  "unclassified": true
};

module.exports = function(tileLayers, tile, writeData, done) {
  var osm = tileLayers.osm.osm;
  var tiger = tileLayers.tiger.tiger2015;
  var osm_fc = osm.features.filter(function(val) {
    return (val.properties.highway && (val.geometry.type === 'LineString') && preserve_type[val.properties.highway] && !val.properties.name)
  });
  var tiger_fc = tiger.features.filter(function(val) {
    return (val.properties.FULLNAME && (val.geometry.type === 'LineString'))
  });
  var result = turf.featurecollection([]);
  if (osm_fc.length > 0) {
    osm_fc.forEach(function(way) {
      var buffer = turf.buffer(way, 0.004, 'miles');
      tiger_fc.forEach(function(line) {
        var tiger_points = turf.explode(line);
        var nodes;
        nodes = turf.within(tiger_points, buffer);
        if (nodes.features.length >= (tiger_points.features.length / 2) && line.properties.FULLNAME) {
          var properties = {
            "_osm_way_id": way.properties._osm_way_id,
            "name": line.properties.FULLNAME,
            "_osmlint": "missinghighwayus"
          };
          way.properties = properties;
          result.features.push(way);
        }
      });
    });
  }

  var fc = turf.featurecollection(result);
  writeData(JSON.stringify(fc) + '\n');
  done(null, null);
};

function void_names(str) {
  str = str.toLowerCase();
  var names = ['unnamed', 'us highway'];
  var exist = false;
  for (var i = 0; i < names.length; i++) {
    if (str.indexOf(names[i]) > -1) {
      exist = true;
    }
  }
  return exist;
}