'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
var dedupe = require('dedupe');

module.exports = function (tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var bboxes = [];
  var output = [];
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
    service: true
    // road: true
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
  var intersectItems = [];
  var itemCoordinates = [];
  var type;
  var fromWay;
  var toWay;

  for (var j = 0; j < bboxes.length; j++) {
    var bbox = bboxes[j];
    var overlaps = traceTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      if (bbox.id !== overlap.id) {
        fromWay = bbox.id;
        toWay = overlap.id;
        var fromHighway = highways[bbox.id];
        var toHighway = highways[overlap.id];
        var intersect = turf.lineOverlap(fromHighway, toHighway);
        intersectItems.push(intersect);
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
      }
    }
  }

  var props = {
    _osmlint: osmlint,
    _type: type,
    fromWay: fromWay,
    toWay: toWay
  };

  for (var z = 0; z < intersectItems.length; z++) {
    if (intersectItems[z].features.length > 0) {
      itemCoordinates.push(intersectItems[z].features[0].geometry.coordinates);
    }
  }

  if (itemCoordinates.length > 0) {
    var uniqItems = dedupe(itemCoordinates);
    for (var u = 0; u < uniqItems.length; u++) {
      output.push(turf.lineString(uniqItems[u], props));
    }
  }
  done(null, output);
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
