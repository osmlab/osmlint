'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var overlapArea = 0.3;
  var buildings = {};
  var bboxes = [];
  var output = {};
  var osmlint = 'crossingbuildings';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.geometry.type === 'Polygon' && val.properties.building) {
      var kinks = turf.kinks(val);
      if (kinks && kinks.features.length === 0) {
        var valBbox = turf.bbox(val);
        valBbox.push(val.properties['@id']);
        bboxes.push(valBbox);
        buildings[val.properties['@id']] = val;
      } else if (kinks && kinks.features.length === 1) {
        val.properties._osmlint = osmlint;
        kinks.features[0].properties._osmlint = osmlint;
        kinks.features[0].properties['@id'] = val.properties['@id'];
        //save detection
        output[val.properties['@id']] = val;
        output[val.properties['@id'] + 'P'] = kinks.features[0];
      } else if (kinks && kinks.features.length > 1) {
        var multiPt = turf.combine(kinks).features[0];
        multiPt.properties._osmlint = osmlint;
        multiPt.properties._fromWay = val.properties['@id'];
        //save detection
        output[val.properties['@id']] = val;
        output[val.properties['@id'] + 'M'] = multiPt;
      }
    }
  }
  var buildingTraceTree = rbush(bboxes.length);
  buildingTraceTree.load(bboxes);
  for (var z = 0; z < bboxes.length; z++) {
    var bbox = bboxes[z];
    var overlaps = buildingTraceTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      if (overlap[4] !== bbox[4]) {
        var intersect = turf.intersect(buildings[overlap[4]], buildings[bbox[4]]);
        if (intersect && (intersect.geometry.type === 'Polygon' || intersect.geometry.type === 'MultiPolygon')) {
          var area = turf.area(intersect);
          if (area > overlapArea) {
            var buildingA = buildings[overlap[4]];
            buildingA.properties._osmlint = osmlint;
            var buildingB = buildings[bbox[4]];
            buildingB.properties._osmlint = osmlint;
            var points = turf.explode(intersect);
            var multiPoint = turf.combine(points).features[0];
            multiPoint.properties = {
              _fromWay: buildingA.properties['@id'],
              _toWay: buildingB.properties['@id'],
              _osmlint: osmlint
            };
            //save detection
            output[overlap[4]] = buildingA;
            output[bbox[4]] = buildingB;
            output[overlap[4] + bbox[4] + 'M'] = multiPoint;
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
