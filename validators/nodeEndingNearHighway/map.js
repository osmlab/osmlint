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
        buffer: turf.buffer(val, 0.002, 'miles').features[0]
      };
    }
  });

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  var output = {};
  bboxes.forEach(function(valueBbox) {
    var valueHighway = highways[valueBbox[4]].highway;
    var firstCoord = valueHighway.geometry.coordinates[0];
    var endCoord = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];
    var overlapsFirstPoint = highwaysTree.search([firstCoord[0], firstCoord[1], firstCoord[0], firstCoord[1]]);
    var overlapsEndPoint = highwaysTree.search([endCoord[0], endCoord[1], endCoord[0], endCoord[1]]);
    var overlapBboxes = overlapsFirstPoint.concat(overlapsEndPoint);
    if (!_.isEqual(firstCoord, endCoord)) {
      var latslons = [];
      overlapBboxes.forEach(function(overlapBbox) {
        if (valueBbox[4] !== overlapBbox[4]) {
          latslons = latslons.concat(_.flatten(highways[overlapBbox[4]].highway.geometry.coordinates));
        }
      });
      var props = {
        near_point: valueBbox[4],
        _osmlint: 'nodeendingnearhighway'
      };

      overlapsFirstPoint.forEach(function(overlapPoint) {
        if (valueBbox[4] !== overlapPoint[4] && latslons.indexOf(firstCoord[0]) == -1 && latslons.indexOf(firstCoord[1]) == -1) {
          var firstPoint = turf.point(firstCoord);
          if (turf.inside(firstPoint, highways[overlapPoint[4]].buffer)) {
            props.near_highway = overlapPoint[4];
            firstPoint.properties = props;
            output[valueBbox[4]] = highways[valueBbox[4]].highway;
            output[overlapPoint[4]] = highways[overlapPoint[4]].highway;
            if (valueBbox[4] > overlapPoint[4]) {
              output[valueBbox[4] + '-' + overlapPoint[4]] = firstPoint;
            } else {
              output[overlapPoint[4] + '-' + valueBbox[4]] = firstPoint;
            }
          }
        }
      });

      overlapsEndPoint.forEach(function(overlapPoint) {
        if (valueBbox[4] !== overlapPoint[4] && latslons.indexOf(endCoord[0]) == -1 && latslons.indexOf(endCoord[1]) == -1) {
          var endPoint = turf.point(endCoord);
          if (turf.inside(endPoint, highways[overlapPoint[4]].buffer)) {
            props.near_highway = overlapPoint[4];
            endPoint.properties = props;
            output[valueBbox[4]] = highways[valueBbox[4]].highway;
            output[overlapPoint[4]] = highways[overlapPoint[4]].highway;
            if (valueBbox[4] > overlapPoint[4]) {
              output[valueBbox[4] + '-' + overlapPoint[4]] = endPoint;
            } else {
              output[overlapPoint[4] + '-' + valueBbox[4]] = endPoint;
            }
          }
        }
      });
    }
  });

  var result = _.values(output);

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};