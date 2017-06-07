'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxes = [];
  var bboxLayer = turf.bboxPolygon(turf.bbox(layer));
  bboxLayer.geometry.type = 'LineString';
  bboxLayer.geometry.coordinates = bboxLayer.geometry.coordinates[0];
  var bufferLayer = turf.buffer(bboxLayer, 0.01, 'miles');
  var highways = {};
  var preserveType = {
    'motorway': true,
    'trunk': true,
    'primary': true,
    'secondary': true,
    'tertiary': true,
    'motorway_link': true,
    'trunk_link': true,
    'primary_link': true,
    'secondary_link': true,
    'tertiary_link': true
  };

  var roadSegments = {};
  var osmlint = 'missingturnlinks';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.highway && preserveType[val.properties.highway] && val.geometry.type === 'LineString') {
      var segmets = turf.lineSegment(val);
      var id = val.properties['@id'];
      for (var d = 0; d < segmets.features.length; d++) {
        var segment = segmets.features[d];
        var idsegment = segment.properties['@id'] + '-' + segment.id;
        roadSegments[idsegment] = segment;
        bboxes.push(segment.bbox.concat({
          osmid: segment.properties['@id'],
          localid: idsegment
        }));
      }
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  var result = [];
  for (var key in roadSegments) {
    var valueSegment = roadSegments[key];
    var overlapsegements = highwaysTree.search(valueSegment.bbox);
    for (var y = 0; y < overlapsegements.length; y++) {
      // writeData(valueSegment.properties['@id'] +'====================\n')
      if (valueSegment.properties['@id'] !== overlapsegements[y][4].osmid) {
        var overlapsegement = roadSegments[overlapsegements[y][4].localid]
        var valueSegmentCoordA = valueSegment.geometry.coordinates[0];
        var valueSegmentCoordB = valueSegment.geometry.coordinates[1];
        var overlapSegmentCoordA = overlapsegement.geometry.coordinates[0];
        var overlapSegmentCoordB = overlapsegement.geometry.coordinates[1];
        if (valueSegmentCoordB[0] === overlapSegmentCoordA[0] && valueSegmentCoordB[1] === overlapSegmentCoordA[1]) {
          var angle = findAngle(valueSegmentCoordA, valueSegmentCoordB, overlapSegmentCoordB)
          if (angle < 70 && angle > 60) {
            result.push(valueSegment);
            result.push(overlapsegement);
          }
        }
      }
    }
    // writeData(JSON.stringify(overlapsegements.length) + '\n');
  }
  // var features = {};

  // var result = _.values(features);
  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);

};


function findAngle(A, B, C) {
  //A first point; C second point; B center point
  var pi = 3.14159265;
  var AB = Math.sqrt(Math.pow(B[0] - A[0], 2) + Math.pow(B[1] - A[1], 2));
  var BC = Math.sqrt(Math.pow(B[0] - C[0], 2) + Math.pow(B[1] - C[1], 2));
  var AC = Math.sqrt(Math.pow(C[0] - A[0], 2) + Math.pow(C[1] - A[1], 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * (180 / pi);
}


function connection(position, oneway) {
  if (position === 'first' && oneway === -1) {
    return 'input';
  } else if (position === 'first' && (oneway === 'yes' || oneway === 1)) {
    return 'output';
  } else if (position === 'end' && (oneway === 'yes' || oneway === 1)) {
    return 'input';
  } else if (position === 'end' && oneway === -1) {
    return 'output';
  } else {
    return 'connection';
  }
}

function classification(major, minor, path, highway) {
  if (major[highway]) {
    return 'major';
  } else if (minor[highway]) {
    return 'minor';
  } else if (path[highway]) {
    return 'path';
  }
}