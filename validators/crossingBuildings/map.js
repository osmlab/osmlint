'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var buildings = {};
  var bboxes = [];
  layer.features.forEach(function(val) {
    if (val.geometry.type === 'Polygon' && val.geometry.coordinates.length === 1 && val.properties.building === 'yes') {
      var kinks = turf.kinks(val);
      if (kinks.intersections.features.length === 0) {
        var bbox = turf.extent(val);
        bbox.push(val.properties._osm_way_id);
        bboxes.push(bbox);
        buildings[val.properties._osm_way_id] = val;
      }
    }
  });

  var traceTree = rbush(bboxes.length);
  traceTree.load(bboxes);
  var output = {};
  bboxes.forEach(function(bbox) {
    var overlaps = traceTree.search(bbox);
    overlaps.forEach(function(overlap) {
      if (overlap[4] !== bbox[4]) {
        var intersect = turf.intersect(buildings[overlap[4]], buildings[bbox[4]]);
        if (intersect !== undefined && intersect.geometry.type === 'Polygon') {
          var area = turf.area(intersect);
          if (area > 0.4) {
            var buildingA = buildings[overlap[4]];
            buildingA.properties._osmlint = 'crossingbuildings';
            var buildingB = buildings[bbox[4]];
            buildingB.properties._osmlint = 'crossingbuildings';
            output[overlap[4]] = buildingA;
            output[bbox[4]] = buildingB;
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
