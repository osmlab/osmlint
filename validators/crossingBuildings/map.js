'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var minOverlapArea = 0.1;
  var buildings = {};
  var bboxes = [];
  var output = {};
  var osmlint = 'crossingbuildings';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    val.properties._osmlint = osmlint;
    if (val.geometry.type === 'Polygon' && val.properties.building) {
      var kinks = turf.kinks(val);
      if (kinks && kinks.features.length === 0) {
        bboxes.push(objBbox(val));
        buildings[val.properties['@id']] = val;
      } else if (kinks && kinks.features.length === 1) {
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
    var buildingA = buildings[bbox.id];
    var areabuildingA = turf.area(buildingA);
    var overlaps = buildingTraceTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      var buildingB = buildings[overlap.id];
      if (overlap.id !== bbox.id) {
        var difference = turf.difference(
          buildingA, buildingB
        );
        if (difference && (areabuildingA - turf.area(difference)) > minOverlapArea) {
          var pointsBuildingA = turf.explode(buildingA);
          var pointsDifferece = turf.explode(difference);
          var points = turf.featureCollection([]);
          var existingPoints = {};
          for (var h = 0; h < pointsBuildingA.features.length; h++) {
            existingPoints[pointsBuildingA.features[h].geometry.coordinates.join(',')] = true;
          }
          for (var j = 0; j < pointsDifferece.features.length; j++) {
            if (!existingPoints[pointsDifferece.features[j].geometry.coordinates.join(',')]) {
              points.features.push(pointsDifferece.features[j]);
            }
          }
          var multiPoint;
          if (points.features.length > 1) {
            multiPoint = turf.combine(points).features[0];
          } else {
            multiPoint = turf.combine(pointsDifferece).features[0];
          }
          multiPoint.properties = {
            _fromWay: buildingA.properties['@id'],
            _toWay: buildingB.properties['@id'],
            _osmlint: osmlint
          };
          //save detection
          output[overlap.id] = buildingA;
          output[bbox.id] = buildingB;
          output[(overlap.id + bbox.id) + 'M'] = multiPoint;
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

function objBbox(obj, id) {
  var bboxExtent = ['minX', 'minY', 'maxX', 'maxY'];
  var bbox = {};
  var valBbox = turf.bbox(obj);
  for (var d = 0; d < valBbox.length; d++) {
    bbox[bboxExtent[d]] = valBbox[d];
  }
  bbox.id = id || obj.properties['@id'];
  return bbox;
}
