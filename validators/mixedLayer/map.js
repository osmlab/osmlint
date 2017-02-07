'use strict';
var turf = require('@turf/turf');
var rbush = require('rbush');
var _ = require('underscore');
var flatten = require('geojson-flatten');

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
  // preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'mixedlayer';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var id = val.properties['@id'];
    var bbox;
    if (preserveType[val.properties.highway]) {
      if (val.geometry.type === 'LineString') {
        var idWayL = id + 'L';
        bbox = turf.bbox(val);
        bbox.push(idWayL);
        highwaysBboxes.push(bbox);
        listOfHighways[idWayL] = val;
      } else if (val.geometry.type === 'MultiLineString') {
        var arrayWays = flatten(val);
        for (var f = 0; f < arrayWays.length; f++) {
          if (arrayWays[f].geometry.type === 'LineString') {
            var idWayM = id + 'M' + f;
            bbox = turf.bbox(arrayWays[f]);
            bbox.push(idWayM);
            highwaysBboxes.push(bbox);
            arrayWays[f].properties = val.properties;
            listOfHighways[idWayM] = arrayWays[f];
          }
        }
      }
    }
  }

  var highwaysTree = rbush(highwaysBboxes.length);
  highwaysTree.load(highwaysBboxes);
  var output = {};
  for (var j = 0; j < highwaysBboxes.length; j++) {
    var highwayToEvaluate = listOfHighways[highwaysBboxes[j][4]];
    //Check only highways which has layer
    if (highwayToEvaluate.properties.layer && highwayToEvaluate.properties.layer !== '0' && highwayToEvaluate.geometry.coordinates.length > 2) {
      var overlapHighwaysBboxes = highwaysTree.search(highwaysBboxes[j]);
      var coordHighwayToEvaluate = highwayToEvaluate.geometry.coordinates;
      coordHighwayToEvaluate.splice(coordHighwayToEvaluate.length - 1, 1);
      coordHighwayToEvaluate.splice(0, 1);
      var objHighwayToEvaluate = {};
      for (var m = 0; m < coordHighwayToEvaluate.length; m++) {
        objHighwayToEvaluate[coordHighwayToEvaluate[m].join('-')] = true;
      }
      for (var k = 0; k < overlapHighwaysBboxes.length; k++) {
        var overlapHighway = listOfHighways[overlapHighwaysBboxes[k][4]];
        //Compare layers between value and overlap highway
        if (highwayToEvaluate.properties['@id'] !== overlapHighway.properties['@id'] && highwayToEvaluate.properties.layer !== overlapHighway.properties.layer && overlapHighway.geometry.coordinates.length > 2) {
          var coordOverlaphighway = overlapHighway.geometry.coordinates;
          coordOverlaphighway.splice(coordOverlaphighway.length - 1, 1);
          coordOverlaphighway.splice(0, 1);
          var coordIntersection = [];
          for (var z = 0; z < coordOverlaphighway.length; z++) {
            if (objHighwayToEvaluate[coordOverlaphighway[z].join('-')]) {
              coordIntersection = coordOverlaphighway[z];
            }
          }
          if (coordIntersection.length > 0) {
            var intersectionPoint = turf.point(coordIntersection);
            var props = {
              _fromWay: highwayToEvaluate.properties['@id'],
              _toWay: overlapHighway.properties['@id'],
              _osmlint: osmlint,
              _type: classification(majorRoads, minorRoads, pathRoads, highwayToEvaluate.properties.highway, overlapHighway.properties.highway)
            };
            //Add osmlint properties
            intersectionPoint.properties = props;
            highwayToEvaluate.properties._osmlint = osmlint;
            overlapHighway.properties._osmlint = osmlint;
            output[highwayToEvaluate.properties['@id']] = highwayToEvaluate;
            output[overlapHighway.properties['@id']] = overlapHighway;
            output[highwayToEvaluate.properties['@id'] + overlapHighway.properties['@id']] = intersectionPoint;
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
