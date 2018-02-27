'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
var preserveRoadType = require('../../helper/preserveRoadType');
var formatRbush = require('../../helper/formatRbush');
var areIntersectedRoads = require('../../helper/areIntersectedRoads');
var areConsecutiveRoads = require('../../helper/areConsecutiveRoads');
var mergeIds = require('../../helper/mergeIds');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var listFeatures = {};
  var featureBboxes = [];
  var preserveType = preserveRoadType.types(2);
  var osmlint = 'crossinghighways';
  var output = {};
  //Filter the roads to evaluate and set the box for rbush
  for (var i = 0; i < layer.features.length; i++) {
    var feature = layer.features[i];
    if (
      preserveType[feature.properties.highway] &&
      (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') &&
      feature.properties.layer === undefined
    ) {
      featureBboxes.push(formatRbush.objBbox(feature));
      listFeatures[feature.properties['@id']] = feature;
    }
  }
  //Load the bboxes into rbush
  var tree = rbush(featureBboxes.length);
  tree.load(featureBboxes);
  //Go through all bboxes
  for (var j = 0; j < featureBboxes.length; j++) {
    var bbox = featureBboxes[j];
    var road = listFeatures[bbox.id];
    var overlaps = tree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlapBbox = overlaps[k];
      var overlapRoad = listFeatures[overlapBbox.id];
      //Compare the ids, it should be different
      if (bbox.id !== overlapBbox.id) {
        if (areIntersectedRoads(road, overlapRoad) && !areConsecutiveRoads(road, overlapRoad)) {
          //Here we know the roads are intersecting  and those are not consecutive
          var intersectPoint = turf.lineIntersect(overlapRoad, road);
          if (intersectPoint && intersectPoint.features.length > 0) {
            if (intersectPoint.features.length > 1) {
              intersectPoint = turf.combine(intersectPoint);
            }
            intersectPoint = intersectPoint.features[0];
            if (intersectPoint.geometry.type === 'Point' || intersectPoint.geometry.type === 'MultiPoint') {
              //Compare coordinates
              var mergeCoords = _.flatten(overlapRoad.geometry.coordinates);
              mergeCoords.concat(_.flatten(road.geometry.coordinates));
              var intersectPointCoords = _.flatten(intersectPoint.geometry.coordinates);
              if (_.difference(mergeCoords, intersectPointCoords).length === mergeCoords.length) {
                //Here we know the roads are intersecting and those intersection is not in a node, which these could share
                road.properties._osmlint = osmlint;
                overlapRoad.properties._osmlint = osmlint;
                output[road.properties['@id']] = road;
                output[overlapRoad.properties['@id']] = overlapRoad;
                intersectPoint.properties = {
                  _fromWay: road.properties['@id'],
                  _toWay: overlapRoad.properties['@id'],
                  _osmlint: osmlint,
                  _type: preserveRoadType.fromToTypes(road.properties.highway, overlapRoad.properties.highway)
                };
                //Add the intersection point
                output[mergeIds(road, overlapRoad)] = intersectPoint;
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
