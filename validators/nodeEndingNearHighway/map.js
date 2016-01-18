'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var bboxes = [];
  var preserveHighways = {
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
    if (val.geometry.type === 'LineString' && preserveHighways[val.properties.highway]) {
      var bbox = turf.extent(val);
      bbox.push(val.properties._osm_way_id);
      bboxes.push(bbox);
      highways[val.properties._osm_way_id] = {
        highway: val,
        buffer: turf.buffer(val, 0.001, 'miles').features[0]
      };
    }
  });

  var traceTree = rbush(bboxes.length);
  traceTree.load(bboxes);

  var output = {};
  bboxes.forEach(function(valueBbox) {
    var overlapBboxes = traceTree.search(valueBbox);
    var points = [];

    overlapBboxes.forEach(function(overlapBbox) {

      if (valueBbox[4] !== overlapBbox[4]) {
        points = points.concat(_.flatten(highways[overlapBbox[4]].highway.geometry.coordinates));
      }
    });

    var valueHighway = highways[valueBbox[4]].highway;
    var firstCoord = valueHighway.geometry.coordinates[0];
    var endCoord = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];

    if ((points.indexOf(firstCoord[0]) == -1 && points.indexOf(firstCoord[1]) == -1)) {
      var firstPoint = turf.point(firstCoord);
      var endPoint = turf.point(endCoord);
      overlapBboxes.forEach(function(overlap) {
        if (valueBbox[4] !== overlap[4]) {
          if (turf.inside(firstPoint, highways[overlap[4]].buffer)) {

            firstPoint.properties = {
              highway_point: valueBbox[4],
              highway: overlap[4]
            };
            output[valueBbox[4]] = firstPoint;
          }
        }
      });
    }
  });

  var result = [];
  _.each(output, function(v) {
    result.push(v);
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};