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
    'service': true
  };

  layer.features.forEach(function(val) {
    if (preserveType[val.properties.highway] && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString') && val.properties.layer === undefined) {
      var bbox = turf.extent(val);
      bbox.push(val.properties._osm_way_id);
      bboxes.push(bbox);
      highways[val.properties._osm_way_id] = val;
    }
  });

  var traceTree = rbush(bboxes.length);
  traceTree.load(bboxes);
  var output = {};

  bboxes.forEach(function(bbox) {
    var overlaps = traceTree.search(bbox);
    overlaps.forEach(function(overlap) {
      if (bbox[4] !== overlap[4]) {
        var intersect = turf.intersect(highways[overlap[4]], highways[bbox[4]]);
        if (intersect !== undefined && (intersect.geometry.type === 'Point' || intersect.geometry.type === 'MultiPoint')) {
          var highwayCoord = _.flatten(highways[overlap[4]].geometry.coordinates);
          highwayCoord.concat(_.flatten(highways[bbox[4]].geometry.coordinates));
          var intersectCoord = _.flatten(intersect.geometry.coordinates);
          if (_.difference(highwayCoord, intersectCoord).length === highwayCoord.length) {
            var osmlint = 'crossinghighways';
            var highwayA = highways[overlap[4]];
            highwayA.properties._osmlint = osmlint;
            var highwayB = highways[bbox[4]];
            highwayB.properties._osmlint = osmlint;
            output[overlap[4]] = highwayA;
            output[bbox[4]] = highwayB;
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
    });
  });

  var result = _.values(output);

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
