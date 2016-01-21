'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxLineString = turf.bboxPolygon(turf.extent(layer));
  bboxLineString.geometry.type = 'LineString';
  bboxLineString.geometry.coordinates = bboxLineString.geometry.coordinates[0];
  var bufferTile = turf.buffer(bboxLineString, 0.01, 'miles').features[0];
  var preserveHighways = {
    'motorway': true,
    'primary': true,
    'secondary': true,
    'tertiary': true,
    'trunk': true,
    'residential': true,
    'unclassified': true,
    'living_street': true,
    'road': true,
    'service': true
  };
  var unit = 'meters';
  var distance = 2;
  var highways = {};
  var bboxes = [];
  var output = {};
  var osmlint = 'nodeendingnearhighway';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.geometry.type === 'LineString' && preserveHighways[val.properties.highway]) {
      var bbox = turf.extent(val);
      bbox.push(val.properties._osm_way_id);
      bboxes.push(bbox);
      highways[val.properties._osm_way_id] = {
        highway: val,
        buffer: turf.buffer(val, distance, unit).features[0]
      };
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);

  for (var i = 0; i < bboxes.length; i++) {
    var valueBbox = bboxes[i];
    var valueHighway = highways[valueBbox[4]].highway;
    var firstCoord = valueHighway.geometry.coordinates[0];
    var firstPoint = turf.point(firstCoord);
    var endCoord = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];
    var endPoint = turf.point(endCoord);
    var overlapsFirstPoint = [];
    if (!turf.inside(firstPoint, bufferTile)) {
      overlapsFirstPoint = highwaysTree.search(turf.extent(turf.buffer(firstPoint, distance, unit)));
    }
    var overlapsEndPoint = [];
    if (!turf.inside(endPoint, bufferTile)) {
      overlapsEndPoint = highwaysTree.search(turf.extent(turf.buffer(endPoint, distance, unit)));
    }
    var overlapBboxes = overlapsFirstPoint.concat(overlapsEndPoint);
    if (!_.isEqual(firstCoord, endCoord)) {
      var arrayCorrd = [];
      for (var j = 0; j < overlapBboxes.length; j++) {
        var overlapBbox = overlapBboxes[j];
        if (valueBbox[4] !== overlapBbox[4]) {
          arrayCorrd = arrayCorrd.concat(_.flatten(highways[overlapBbox[4]].highway.geometry.coordinates));
        }
      }
      var props = {
        wayA: valueBbox[4],
        _osmlint: osmlint
      };
      for (var k = 0; k < overlapsFirstPoint.length; k++) {
        var overlapPoint = overlapsFirstPoint[k];
        if (valueBbox[4] !== overlapPoint[4] && (arrayCorrd.indexOf(firstCoord[0]) === -1 || arrayCorrd.indexOf(firstCoord[1]) === -1)) {
          if (turf.inside(firstPoint, highways[overlapPoint[4]].buffer)) {
            props.wayB = overlapPoint[4];
            firstPoint.properties = props;
            output[valueBbox[4]] = highways[valueBbox[4]].highway;
            output[valueBbox[4]].properties._osmlint = osmlint;
            output[overlapPoint[4]] = highways[overlapPoint[4]].highway;
            output[overlapPoint[4]].properties._osmlint = osmlint;
            if (valueBbox[4] > overlapPoint[4]) {
              output[valueBbox[4].toString().concat(overlapPoint[4]).concat('first')] = firstPoint;
            } else {
              output[overlapPoint[4].toString().concat(valueBbox[4]).concat('first')] = firstPoint;
            }
          }
        }
      }

      for (var l = 0; l < overlapsEndPoint.length; l++) {
        var overlapPoint = overlapsEndPoint[l];
        if (valueBbox[4] !== overlapPoint[4] && (arrayCorrd.indexOf(endCoord[0]) === -1 || arrayCorrd.indexOf(endCoord[1]) === -1)) {
          if (turf.inside(endPoint, highways[overlapPoint[4]].buffer)) {
            props.wayB = overlapPoint[4];
            endPoint.properties = props;
            output[valueBbox[4]] = highways[valueBbox[4]].highway;
            output[valueBbox[4]].properties._osmlint = osmlint;
            output[overlapPoint[4]] = highways[overlapPoint[4]].highway;
            output[overlapPoint[4]].properties._osmlint = osmlint;
            if (valueBbox[4] > overlapPoint[4]) {
              output[valueBbox[4].toString().concat(overlapPoint[4]).concat('end')] = endPoint;
            } else {
              output[overlapPoint[4].toString().concat(valueBbox[4]).concat('end')] = endPoint;
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