'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
var preserveRoadType = require('../../helper/preserveRoadType');
var formatRbush = require('../../helper/formatRbush');
var roadAreIntersecting = require('../../helper/roadAreIntersecting');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var listOfHighways = {};
  var highwaysBboxes = [];
  var preserveType = preserveRoadType.types(2);
  var osmlint = 'crossinghighways';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (
      preserveType[val.properties.highway] &&
      (val.geometry.type === 'LineString' ||
        val.geometry.type === 'MultiLineString') &&
      val.properties.layer === undefined
    ) {
      highwaysBboxes.push(formatRbush.objBbox(val));
      listOfHighways[val.properties['@id']] = val;
    }
  }

  var highwaysTree = rbush(highwaysBboxes.length);
  highwaysTree.load(highwaysBboxes);
  var output = {};
  for (var j = 0; j < highwaysBboxes.length; j++) {
    var bbox = highwaysBboxes[j];
    var highwayToEvaluate = listOfHighways[bbox.id];
    var overlaps = highwaysTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlapBbox = overlaps[k];
      var overlapHighway = listOfHighways[overlapBbox.id];
      if (
        bbox.id !== overlapBbox.id &&
        roadAreIntersecting(highwayToEvaluate, overlapHighway) &&
        !checkCoordinates(highwayToEvaluate, overlapHighway)
      ) {
        var intersectPoint = turf.lineIntersect(
          overlapHighway,
          highwayToEvaluate
        );
        if (intersectPoint && intersectPoint.features.length > 0) {
          intersectPoint = intersectPoint.features[0];
          if (
            intersectPoint.geometry.type === 'Point' ||
            intersectPoint.geometry.type === 'MultiPoint'
          ) {
            var mergeHighwaysCoords = _.flatten(
              overlapHighway.geometry.coordinates
            );
            mergeHighwaysCoords.concat(
              _.flatten(highwayToEvaluate.geometry.coordinates)
            );
            var intersectPointCoord = _.flatten(
              intersectPoint.geometry.coordinates
            );
            if (
              _.difference(mergeHighwaysCoords, intersectPointCoord).length ===
              mergeHighwaysCoords.length
            ) {
              highwayToEvaluate.properties._osmlint = osmlint;
              overlapHighway.properties._osmlint = osmlint;
              output[bbox.id] = highwayToEvaluate;
              output[overlapBbox.id] = overlapHighway;
              intersectPoint.properties = {
                _fromWay: highwayToEvaluate.properties['@id'],
                _toWay: overlapHighway.properties['@id'],
                _osmlint: osmlint,
                _type: preserveRoadType.fromToTypes(
                  highwayToEvaluate.properties.highway,
                  overlapHighway.properties.highway
                )
              };
              if (
                highwayToEvaluate.properties['@id'] >
                overlapHighway.properties['@id']
              ) {
                output[
                  bbox.id.toString().concat(overlapBbox.id)
                ] = intersectPoint;
              } else {
                output[
                  overlapBbox.id.toString().concat(bbox.id)
                ] = intersectPoint;
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

function checkCoordinates(high1, high2) {
  var coord1 = high1.geometry.coordinates;
  var coord2 = high2.geometry.coordinates;
  if (
    (coord1[0][0] === coord2[0][0] && coord1[0][1] === coord2[0][1]) ||
    (coord1[0][0] === coord2[coord2.length - 1][0] &&
      coord1[0][1] === coord2[coord2.length - 1][1]) ||
    (coord1[coord1.length - 1][0] === coord2[0][0] &&
      coord1[coord1.length - 1][1] === coord2[0][1]) ||
    (coord1[coord1.length - 1][0] === coord2[coord2.length - 1][0] &&
      coord1[coord1.length - 1][1] === coord2[coord2.length - 1][1])
  ) {
    return true;
  }
  return false;
}
