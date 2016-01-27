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
    'primary': true,
    'secondary': true,
    'tertiary': true,
    'trunk': true,
    'residential': true,
    'unclassified': true,
    'living_street': true,
    'service': true,
    'road': true
  };
  var osmlint = 'crossinghighways';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (preserveType[val.properties.highway] && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString') && val.properties.layer === undefined) {
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
        if (intersect !== undefined && (intersect.geometry.type === 'Point' || intersect.geometry.type === 'MultiPoint')) {
          var highwayCoord = _.flatten(highways[overlap[4]].geometry.coordinates);
          highwayCoord.concat(_.flatten(highways[bbox[4]].geometry.coordinates));
          var intersectCoord = _.flatten(intersect.geometry.coordinates);
          if (_.difference(highwayCoord, intersectCoord).length === highwayCoord.length) {
            highways[overlap[4]].properties._osmlint = osmlint;
            highways[bbox[4]].properties._osmlint = osmlint;
            output[overlap[4]] = highways[overlap[4]];
            output[bbox[4]] = highways[bbox[4]];
            intersect.properties = {
              wayA: overlap[4],
              wayB: bbox[4],
              _osmlint: osmlint
            };
            if (bbox[4] > overlap[4]) {
              output[bbox[4].toString().concat(overlap[4])] = intersect;
            } else {
              output[overlap[4].toString().concat(bbox[4])] = intersect;
            }
          }
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

