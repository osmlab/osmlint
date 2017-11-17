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
  var osmlint = 'crossinghighwaysbridges';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var id = val.properties['@id'];
    // var bbox;
    if (val.properties.highway && preserveType[val.properties.highway]) {
      if (val.geometry.type === 'LineString') {
        var idWayL = id + 'L';
        highwaysBboxes.push(objBbox(val, idWayL));
        listOfHighways[idWayL] = val;
      } else if (val.geometry.type === 'MultiLineString') {
        var arrayWays = flatten(val);
        for (var f = 0; f < arrayWays.length; f++) {
          if (arrayWays[f].geometry.type === 'LineString') {
            var idWayM = id + 'M' + f;
            highwaysBboxes.push(objBbox(arrayWays[f], idWayM));
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
    var highwayToEvaluate = listOfHighways[highwaysBboxes[j].id];
    //Check only highways which has layer
    var overlapHighwaysBboxes = highwaysTree.search(highwaysBboxes[j]);
    console.log(overlapHighwaysBboxes + '\n');
    for (var k = 0; k < overlapHighwaysBboxes.length; k++) {
      var overlapHighway = listOfHighways[overlapHighwaysBboxes[k].id];
      if (highwayToEvaluate.properties['@id'] !== overlapHighway.properties['@id']) {
        if (!isContinuousRoads(highwayToEvaluate, overlapHighway)) {
          var intersectPoint = isIntersectingInNode(highwayToEvaluate, overlapHighway);
          if (intersectPoint) {
            if (highwayToEvaluate.properties.bridge && highwayToEvaluate.properties.bridge !== 'no' && !overlapHighway.properties.bridge) {
              var intersectCoords = _.flatten(intersectPoint.geometry.coordinates);
              var highsCoords = _.flatten([highwayToEvaluate.geometry.coordinates, overlapHighway.geometry.coordinates]);
              if (_.intersection(intersectCoords, highsCoords).length > 1) {
                var props = {
                  _fromWay: highwayToEvaluate.properties['@id'],
                  _toWay: overlapHighway.properties['@id'],
                  _osmlint: osmlint,
                  _type: classification(majorRoads, minorRoads, pathRoads, highwayToEvaluate.properties.highway, overlapHighway.properties.highway)
                };
                intersectPoint.properties = props;
                output[highwayToEvaluate.properties['@id']] = highwayToEvaluate;
                output[overlapHighway.properties['@id']] = overlapHighway;
                output[highwayToEvaluate.properties['@id'] + overlapHighway.properties['@id']] = intersectPoint;
              }
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

function isContinuousRoads(bridge, road2) {
  var coord1 = bridge.geometry.coordinates;
  var coord2 = road2.geometry.coordinates;
  for (var i = 0; i < coord2.length; i++) {
    if (_.intersection(coord1[0], coord2[i]).length === 2 ||
      _.intersection(coord1[coord1.length - 1], coord2[i]).length === 2) {
      return true;
    }
  }
  for (var j = 0; j < coord1.length; j++) {
    if (_.intersection(coord2[0], coord1[j]).length === 2 ||
      _.intersection(coord2[coord2.length - 1], coord1[j]).length === 2) {
      return true;
    }
  }
  return false;
}


function isIntersectingInNode(road1, road2) {
  var intersectPoint = turf.intersect(road1, road2);
  if (intersectPoint && (intersectPoint.geometry.type === 'Point' || intersectPoint.geometry.type === 'MultiPoint')) {
    var intersectCoords = _.flatten(intersectPoint.geometry.coordinates);
    var roadsCoords = _.flatten([road1.geometry.coordinates, road2.geometry.coordinates]);
    if (_.intersection(intersectCoords, roadsCoords).length === 0) {
      return false;
    } else {
      return intersectPoint;
    }
  }
}

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
