'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var listOfHighways = {};
  var highwaysBboxes = [];
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
    'service': true,
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
  var osmlint = 'crossinghighways';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (preserveType[val.properties.highway] && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString') && val.properties.layer === undefined) {
      var bboxHighway = turf.bbox(val);
      bboxHighway.push(val.properties['@id']);
      highwaysBboxes.push(bboxHighway);
      listOfHighways[val.properties['@id']] = val;
    }
  }

  var highwaysTree = rbush(highwaysBboxes.length);
  highwaysTree.load(highwaysBboxes);
  var output = {};

  for (var j = 0; j < highwaysBboxes.length; j++) {
    var bbox = highwaysBboxes[j];
    var highwayToEvaluate = listOfHighways[bbox[4]];
    var overlaps = highwaysTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlapBbox = overlaps[k];
      var overlapHighway = listOfHighways[overlapBbox[4]];
      if (bbox[4] !== overlapBbox[4] && isIntersecting(highwayToEvaluate, overlapHighway) && !checkCoordinates(highwayToEvaluate, overlapHighway)) {
        var intersectPoint = turf.intersect(overlapHighway, highwayToEvaluate);
        if (intersectPoint && (intersectPoint.geometry.type === 'Point' || intersectPoint.geometry.type === 'MultiPoint')) {
          var mergeHighwaysCoords = _.flatten(overlapHighway.geometry.coordinates);
          mergeHighwaysCoords.concat(_.flatten(highwayToEvaluate.geometry.coordinates));
          var intersectPointCoord = _.flatten(intersectPoint.geometry.coordinates);
          if (_.difference(mergeHighwaysCoords, intersectPointCoord).length === mergeHighwaysCoords.length) {
            highwayToEvaluate.properties._osmlint = osmlint;
            overlapHighway.properties._osmlint = osmlint;
            output[bbox[4]] = highwayToEvaluate;
            output[overlapBbox[4]] = overlapHighway;
            intersectPoint.properties = {
              _fromWay: highwayToEvaluate.properties['@id'],
              _toWay: overlapHighway.properties['@id'],
              _osmlint: osmlint,
              _type: classification(majorRoads, minorRoads, pathRoads, highwayToEvaluate.properties.highway, overlapHighway.properties.highway)
            };
            if (highwayToEvaluate.properties['@id'] > overlapHighway.properties['@id']) {
              output[bbox[4].toString().concat(overlapBbox[4])] = intersectPoint;
            } else {
              output[overlapBbox[4].toString().concat(bbox[4])] = intersectPoint;
            }
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

function checkCoordinates(high1, high2) {
  var coord1 = high1.geometry.coordinates;
  var coord2 = high2.geometry.coordinates;
  if ((coord1[0][0] === coord2[0][0] && coord1[0][1] === coord2[0][1]) ||
    (coord1[0][0] === coord2[coord2.length - 1][0] && coord1[0][1] === coord2[coord2.length - 1][1]) ||
    (coord1[coord1.length - 1][0] === coord2[0][0] && coord1[coord1.length - 1][1] === coord2[0][1]) ||
    (coord1[coord1.length - 1][0] === coord2[coord2.length - 1][0] && coord1[coord1.length - 1][1] === coord2[coord2.length - 1][1])) {
    return true;
  }
  return false;
}

function isIntersecting(high1, high2) {
  var coord1 = high1.geometry.coordinates;
  var coord2 = high2.geometry.coordinates;
  var x1 = coord1[0][0];
  var y1 = coord1[0][1];
  var x2 = coord1[coord1.length - 1][0];
  var y2 = coord1[coord1.length - 1][1];
  var x3 = coord2[0][0];
  var y3 = coord2[0][1];
  var x4 = coord2[coord2.length - 1][0];
  var y4 = coord2[coord2.length - 1][1];
  var adx = x2 - x1;
  var ady = y2 - y1;
  var bdx = x4 - x3;
  var bdy = y4 - y3;
  var s = (-ady * (x1 - x3) + adx * (y1 - y3)) / (-bdx * ady + adx * bdy);
  var t = (+bdx * (y1 - y3) - bdy * (x1 - x3)) / (-bdx * ady + adx * bdy);
  return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
}

function classification(major, minor, path, fromHighway, toHighway) {
  if (major[fromHighway] && major[toHighway]) {
    return 'major-major';
  } else if ((major[fromHighway] && minor[toHighway]) || (minor[fromHighway] && major[toHighway])) {
    return 'major-minor';
  } else if ((major[fromHighway] && path[toHighway]) || (path[fromHighway] && major[toHighway])) {
    return 'major-path';
  } else if (minor[fromHighway] && minor[toHighway]) {
    return 'minor-minor';
  } else if ((minor[fromHighway] && path[toHighway]) || (path[fromHighway] && minor[toHighway])) {
    return 'minor-path';
  } else if (path[fromHighway] && path[toHighway]) {
    return 'path-path';
  }
}
