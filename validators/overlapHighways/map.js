'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var bboxes = [];
  var majorRoads = {
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
  var minorRoads = {
    'unclassified': true,
    'residential': true,
    'living_street': true,
    // 'service': true,
    'road': true
  };
  var pathRoads = {
    'pedestrian': true,
    'track': true,
    'footway': true,
    'path': true,
    'cycleway': true,
    'steps': true
  };
  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);
  //preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'overlaphighways';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (preserveType[val.properties.highway] && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString') && val.properties.layer === undefined) {
      var bboxHighway = turf.bbox(val);
      bboxHighway.push(val.properties['@id']);
      bboxes.push(bboxHighway);
      highways[val.properties['@id']] = val;
    }
  }
  var traceTree = rbush(bboxes.length);
  traceTree.load(bboxes);
  var output = {};
  for (var j = 0; j < bboxes.length; j++) {
    var bbox = bboxes[j];
    var overlaps = traceTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      if (bbox[4] !== overlap[4]) {
        var fromHighway = highways[bbox[4]];
        var toHighway = highways[overlap[4]];
        var intersect = turf.intersect(toHighway, fromHighway);
        if (intersect !== undefined && (intersect.geometry.type === 'LineString' || intersect.geometry.type === 'MultiLineString')) {
          var coordinates = intersect.geometry.coordinates;
          var type;
          if (majorRoads[fromHighway.properties.highway] && majorRoads[toHighway.properties.highway]) {
            type = 'major-major';
          } else if ((majorRoads[fromHighway.properties.highway] && minorRoads[toHighway.properties.highway]) || (minorRoads[fromHighway.properties.highway] && majorRoads[toHighway.properties.highway])) {
            type = 'major-minor';
          } else if ((majorRoads[fromHighway.properties.highway] && pathRoads[toHighway.properties.highway]) || (pathRoads[fromHighway.properties.highway] && majorRoads[toHighway.properties.highway])) {
            type = 'major-path';
          } else if (minorRoads[fromHighway.properties.highway] && minorRoads[toHighway.properties.highway]) {
            type = 'minor-minor';
          } else if ((minorRoads[fromHighway.properties.highway] && pathRoads[toHighway.properties.highway]) || (pathRoads[fromHighway.properties.highway] && minorRoads[toHighway.properties.highway])) {
            type = 'minor-path';
          } else if (pathRoads[fromHighway.properties.highway] && pathRoads[toHighway.properties.highway]) {
            type = 'path-path';
          }

          var props = {
            _osmlint: osmlint,
            _fromWay: bbox[4],
            _toWay: overlap[4],
            _type: type
          };
          if (intersect.geometry.type === 'MultiLineString') {
            for (var l = 0; l < coordinates.length; l++) {
              var coor = coordinates[l];
              output[coor[0]] = turf.point(coor[0], props);
              output[coor[coor.length - 1]] = turf.point(coor[coor.length - 1], props);
            }
          } else {
            output[coordinates[0]] = turf.point(coordinates[0], props);
            output[coordinates[coordinates.length - 1]] = turf.point(coordinates[coordinates.length - 1], props);
          }
          fromHighway.properties._osmlint = osmlint;
          toHighway.properties._osmlint = osmlint;
          output[bbox[4]] = fromHighway;
          output[overlap[4]] = toHighway;
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
