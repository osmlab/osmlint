'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxes = [];
  var highways = {};
  var output = {};
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
  var osmlint = 'missinguturn';
  for (var z = 0; z < layer.features.length; z++) {
    var val = layer.features[z];
    if (val.geometry.type === 'LineString' && preserveType[val.properties.highway]) {
      var bboxA = turf.bbox(val);
      bboxA.push({
        id: val.properties['@id']
      });
      bboxes.push(bboxA);
      highways[val.properties['@id']] = val;
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  for (var i = 0; i < bboxes.length; i++) {
    var valueBbox = bboxes[i];
    var eHighway = highways[valueBbox[4].id];
    if (eHighway.properties.oneway && eHighway.properties.oneway !== 'no') {
      var overlaps = highwaysTree.search(valueBbox);
      var nearRoads = {
        evalRoad: {},
        paralled: {},
        output: {},
        intersecCoord: {}
      };
      nearRoads.evalRoad[eHighway.properties['@id']] = eHighway;
      for (var k = 0; k < overlaps.length; k++) {
        var nearValueBbox = overlaps[k];
        var nearHighway = highways[nearValueBbox[4].id];
        if (eHighway.properties['@id'] !== nearHighway.properties['@id']) {
          //evaluate if the roads are consecutive
          var intersectionCoord = areConsecutive(eHighway, nearHighway);

          if (intersectionCoord && direction(eHighway, intersectionCoord) === 'input') { //check the intersection and also the road highway in evaluation is ='input'
            var directionOutputRoad = direction(nearHighway, intersectionCoord); //Get the direction of the road
            if (directionOutputRoad === 'output' && findAngle(eHighway, nearHighway, 2) < 30) { // the paralled road should end in angle < 30 and also the evaluation point should be in the second position.
              nearRoads.paralled[nearHighway.properties['@id']] = nearHighway;
              //Create the a point in the intersection
              var intersectionPoint = turf.point(intersectionCoord);
              intersectionPoint.properties['_fromWay'] = eHighway.properties['@id'];
              intersectionPoint.properties['_toWay'] = nearHighway.properties['@id'];
              intersectionPoint.properties._osmlint = osmlint;
              nearRoads.intersecCoord[mergeIds(eHighway, nearHighway)] = intersectionPoint;
            } else if (directionOutputRoad === 'bidirectional' && findAngle(eHighway, nearHighway, 2) > 50) { //check the output road, it should be a bidirectional
              nearRoads.output[nearHighway.properties['@id']] = nearHighway;
            }
          }
        }
      }
      // Check the outputs
      if (_.size(nearRoads.evalRoad) > 0 && _.size(nearRoads.paralled) > 0 && _.size(nearRoads.output) > 0 && _.size(nearRoads.intersecCoord) > 0) {
        for (var type in nearRoads) {
          for (var feature in nearRoads[type]) {
            output[feature] = nearRoads[type][feature];
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

function angle(A, B, C) {
  //A first point; C second point; B center point
  var pi = 3.14159265;
  var AB = Math.sqrt(Math.pow(B[0] - A[0], 2) + Math.pow(B[1] - A[1], 2));
  var BC = Math.sqrt(Math.pow(B[0] - C[0], 2) + Math.pow(B[1] - C[1], 2));
  var AC = Math.sqrt(Math.pow(C[0] - A[0], 2) + Math.pow(C[1] - A[1], 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * (180 / pi);
}


function findAngle(roadA, roadB, position) {
  var coordA = roadA.geometry.coordinates;
  var coordB = roadB.geometry.coordinates;
  if (coordA.length < position) {
    position = coordA.length;
  } else if (coordB.length < position) {
    position = coordB.length;
  }
  position = position - 1;
  var coordA1 = roadA.geometry.coordinates[0];
  var coordA2 = roadA.geometry.coordinates[roadA.geometry.coordinates.length - 1];
  var coordB1 = roadB.geometry.coordinates[0];
  var coordB2 = roadB.geometry.coordinates[roadB.geometry.coordinates.length - 1];
  if (_.intersection(coordA1, coordB1).length === 2) {
    return angle(coordA[position], coordA1, coordB[position]);
  } else if (_.intersection(coordA1, coordB2).length === 2) {
    return angle(coordA[position], coordA1, coordB[coordB.length - (position + 1)]);
  } else if (_.intersection(coordA2, coordB1).length === 2) {
    return angle(coordA[coordA.length - (position + 1)], coordA2, coordB[position]);
  } else if (_.intersection(coordA2, coordB2).length === 2) {
    return angle(coordA[coordA.length - (position + 1)], coordA2, coordB[coordB.length - (position + 1)]);
  }
}

function areConsecutive(roadA, roadB) {
  var coordA1 = roadA.geometry.coordinates[0];
  var coordA2 = roadA.geometry.coordinates[roadA.geometry.coordinates.length - 1];
  var coordB1 = roadB.geometry.coordinates[0];
  var coordB2 = roadB.geometry.coordinates[roadB.geometry.coordinates.length - 1];
  if (_.intersection(coordA1, coordB1).length === 2 || _.intersection(coordA1, coordB2).length === 2) {
    return coordA1;
  } else if (_.intersection(coordA2, coordB1).length === 2 || _.intersection(coordA2, coordB2).length === 2) {
    return coordA2;
  }
  return null;
}


function mergeIds(road1, road2) {
  if (road1.properties['@id'] > road2.properties['@id']) {
    return road1.properties['@id'].toString().concat(road2.properties['@id']);
  } else {
    return road2.properties['@id'].toString().concat(road1.properties['@id']);
  }
}

function direction(road, coord) {
  if (road.properties.oneway && road.properties.oneway !== 'no') {
    if (_.intersection(coord, road.geometry.coordinates[0]).length === 2 && road.properties.oneway === -1) {
      return 'input';
    } else if (_.intersection(coord, road.geometry.coordinates[0]).length === 2 && road.properties.oneway === 'yes') {
      return 'output';
    } else if (_.intersection(coord, road.geometry.coordinates[road.geometry.coordinates.length - 1]).length === 2 && road.properties.oneway === 'yes') {
      return 'input';
    } else if (_.intersection(coord, road.geometry.coordinates[road.geometry.coordinates.length - 1]).length === 2 && road.properties.oneway === -1) {
      return 'output';
    }
  } else {
    return 'bidirectional';
  }
}
