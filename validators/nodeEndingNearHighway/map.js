'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxLayer = turf.bboxPolygon(turf.extent(layer));
  bboxLayer.geometry.type = 'LineString';
  bboxLayer.geometry.coordinates = bboxLayer.geometry.coordinates[0];
  var bufferLayer = turf.buffer(bboxLayer, 0.01, 'miles').features[0];
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
  var unit = 'meters';
  var distance = 2;
  var highways = {};
  var bboxes = [];
  var output = {};
  var osmlint = 'nodeendingnearhighway';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.geometry.type === 'LineString' && preserveType[val.properties.highway]) {
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

  for (var m = 0; m < bboxes.length; m++) {
    var valueBbox = bboxes[m];
    var valueHighway = highways[valueBbox[4]].highway;
    var firstCoord = valueHighway.geometry.coordinates[0];
    var firstPoint = turf.point(firstCoord);
    var endCoord = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];
    var endPoint = turf.point(endCoord);
    var overlapsFirstPoint = [];
    if (!turf.inside(firstPoint, bufferLayer)) {
      overlapsFirstPoint = highwaysTree.search(turf.extent(turf.buffer(firstPoint, distance, unit)));
    }
    var overlapsEndPoint = [];
    if (!turf.inside(endPoint, bufferLayer)) {
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
        var overlapPointFirst = overlapsFirstPoint[k];
        if (valueBbox[4] !== overlapPointFirst[4] && (arrayCorrd.indexOf(firstCoord[0]) === -1 || arrayCorrd.indexOf(firstCoord[1]) === -1)) {
          if (turf.inside(firstPoint, highways[overlapPointFirst[4]].buffer)) {
            props.wayB = overlapPointFirst[4];
            firstPoint.properties = props;
            output[valueBbox[4]] = highways[valueBbox[4]].highway;
            output[valueBbox[4]].properties._osmlint = osmlint;
            output[overlapPointFirst[4]] = highways[overlapPointFirst[4]].highway;
            output[overlapPointFirst[4]].properties._osmlint = osmlint;
            if (valueBbox[4] > overlapPointFirst[4]) {
              output[valueBbox[4].toString().concat(overlapPointFirst[4]).concat('first')] = firstPoint;
            } else {
              output[overlapPointFirst[4].toString().concat(valueBbox[4]).concat('first')] = firstPoint;
            }
          }
        }
      }
      for (var l = 0; l < overlapsEndPoint.length; l++) {
        var overlapPointEnd = overlapsEndPoint[l];
        if (valueBbox[4] !== overlapPointEnd[4] && (arrayCorrd.indexOf(endCoord[0]) === -1 || arrayCorrd.indexOf(endCoord[1]) === -1)) {
          if (turf.inside(endPoint, highways[overlapPointEnd[4]].buffer)) {
            props.wayB = overlapPointEnd[4];
            endPoint.properties = props;
            output[valueBbox[4]] = highways[valueBbox[4]].highway;
            output[valueBbox[4]].properties._osmlint = osmlint;
            output[overlapPointEnd[4]] = highways[overlapPointEnd[4]].highway;
            output[overlapPointEnd[4]].properties._osmlint = osmlint;
            if (valueBbox[4] > overlapPointEnd[4]) {
              output[valueBbox[4].toString().concat(overlapPointEnd[4]).concat('end')] = endPoint;
            } else {
              output[overlapPointEnd[4].toString().concat(valueBbox[4]).concat('end')] = endPoint;
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
