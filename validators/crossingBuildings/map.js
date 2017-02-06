'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var buildings = {};
  var bboxes = [];

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.geometry.type === 'Polygon' && val.properties.building) {

      // var kinks = turf.kinks(val);
      // if (kinks.intersections.features.length === 0) {
      var bbox = turf.bbox(val);
      bbox.push(val.properties['@id']);
      bboxes.push(bbox);
      buildings[val.properties['@id']] = val;
      // }
    }
  }

  // writeData(bboxes.length + '\n');

  var buildingTraceTree = rbush(bboxes.length);
  buildingTraceTree.load(bboxes);
  var output = {};
  for (var z = 0; z < bboxes.length; z++) {
    var bbox = bboxes[z];
    var overlaps = buildingTraceTree.search(bbox);

    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      if (overlap[4] !== bbox[4]) {
        // writeData('=======================================\n');

        var intersect = turf.intersect(buildings[overlap[4]], buildings[bbox[4]]);
        // if (intersect) {
        //   writeData(JSON.stringify(intersect) + 'n');
        // }
        // var difference = turf.difference(buildings[overlap[4]], buildings[bbox[4]]);
        // writeData('=====\n');

        // if (difference) {
        //   writeData(JSON.stringify(difference) + '\n');
        // }
        if (intersect && intersect.geometry.type === 'Polygon') {
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
    }
  }

  var result = _.values(output);

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};