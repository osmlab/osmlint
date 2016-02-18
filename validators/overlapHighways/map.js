'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var bboxes = [];
  var preserveType = {
    'motorway': true,
    'motorway_link': true,
    'primary': true,
    'primary_link': true,
    'secondary': true,
    'secondary_link': true,
    'tertiary': true,
    'tertiary_link': true,
    'trunk': true,
    'trunk_link': true,
    'residential': true,
    'unclassified': true,
    'living_street': true,
    'road': true,
    'service': true
  };
  var osmlint = 'overlaphighways';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (preserveType[val.properties.highway] && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString')) {
      var bboxHighway = turf.extent(val);
      bboxHighway.push(val.properties._osm_way_id);
      bboxes.push(bboxHighway);
      highways[val.properties._osm_way_id] = val;
    }
  }
  var traceTree = rbush(bboxes.length);
  traceTree.load(bboxes);
  var output = {};
  for (var j = 0; j < bboxes.length; j++) {
    var bbox = bboxes[j];
    var overlaps = traceTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      if (bbox[4] !== overlap[4]) {
        var intersect = turf.intersect(highways[overlap[4]], highways[bbox[4]]);
        if (intersect !== undefined && (intersect.geometry.type === 'LineString' || intersect.geometry.type === 'MultiLineString')) {
          var coordinates = intersect.geometry.coordinates;
          output[coordinates[0].join('-')] = turf.point(coordinates[0], {
            _osmlint: osmlint
          });
          output[coordinates[coordinates.length - 1].join('-')] = turf.point(coordinates[coordinates.length - 1], {
            _osmlint: osmlint
          });
          highways[bbox[4]].properties._osmlint = osmlint;
          highways[overlap[4]].properties._osmlint = osmlint;
          output[bbox[4]] = highways[bbox[4]];
          output[overlap[4]] = highways[overlap[4]];
        }
      }
    }
  }
  var result = _.values(output);

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);

};
