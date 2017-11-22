'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var bboxes = [];
  var majorRoads = {
    motorway: true,
    trunk: true,
    primary: true,
    secondary: true,
    tertiary: true,
    motorway_link: true,
    trunk_link: true,
    primary_link: true,
    secondary_link: true,
    tertiary_link: true
  };
  var minorRoads = {
    unclassified: true,
    residential: true,
    living_street: true,
    // 'service': true,
    road: true
  };
  var pathRoads = {
    pedestrian: true,
    track: true,
    footway: true,
    path: true,
    cycleway: true,
    steps: true
  };
  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);
  //preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'overlaphighways';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (
      preserveType[val.properties.highway] &&
      (val.geometry.type === 'LineString' ||
        val.geometry.type === 'MultiLineString') &&
      val.properties.layer === undefined
    ) {
      var bboxHighway = objBbox(val);
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
      if (bbox.id !== overlap.id) {
        var fromHighway = highways[bbox.id];
        var toHighway = highways[overlap.id];
        var intersect = turf.lineIntersect(toHighway, fromHighway);
        if (intersect && intersect.features.length > 0) {
          if (intersect.features.length > 1) {
            intersect = turf.combine(intersect);
          }
          intersect = intersect.features[0];
          // if (intersect.geometry.type === 'LineString' || intersect.geometry.type === 'MultiLineString') {
          var coordinates = intersect.geometry.coordinates;
          var type;
          if (
            majorRoads[fromHighway.properties.highway] &&
            majorRoads[toHighway.properties.highway]
          ) {
            type = 'major-major';
          } else if (
            (majorRoads[fromHighway.properties.highway] &&
              minorRoads[toHighway.properties.highway]) ||
            (minorRoads[fromHighway.properties.highway] &&
              majorRoads[toHighway.properties.highway])
          ) {
            type = 'major-minor';
          } else if (
            (majorRoads[fromHighway.properties.highway] &&
              pathRoads[toHighway.properties.highway]) ||
            (pathRoads[fromHighway.properties.highway] &&
              majorRoads[toHighway.properties.highway])
          ) {
            type = 'major-path';
          } else if (
            minorRoads[fromHighway.properties.highway] &&
            minorRoads[toHighway.properties.highway]
          ) {
            type = 'minor-minor';
          } else if (
            (minorRoads[fromHighway.properties.highway] &&
              pathRoads[toHighway.properties.highway]) ||
            (pathRoads[fromHighway.properties.highway] &&
              minorRoads[toHighway.properties.highway])
          ) {
            type = 'minor-path';
          } else if (
            pathRoads[fromHighway.properties.highway] &&
            pathRoads[toHighway.properties.highway]
          ) {
            type = 'path-path';
          }

          var props = {
            _osmlint: osmlint,
            _fromWay: bbox.id,
            _toWay: overlap.id,
            _type: type
          };
          if (intersect.geometry.type === 'MultiLineString') {
            for (var l = 0; l < coordinates.length; l++) {
              var coor = coordinates[l];
              output[coor[0]] = turf.point(coor[0], props);
              output[coor[coor.length - 1]] = turf.point(
                coor[coor.length - 1],
                props
              );
            }
          } else {
            output[coordinates] = turf.point(coordinates, props);
          }
          fromHighway.properties._osmlint = osmlint;
          toHighway.properties._osmlint = osmlint;
          output[bbox.id] = fromHighway;
          output[overlap.id] = toHighway;
          // }
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
