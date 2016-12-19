'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var listOfObjects = {};
  var listOfAvoidPoints = {};
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
  var osmlint = 'crossinghighwaysbuildings';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if ((preserveType[val.properties.highway] || val.properties.building) && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString' || val.geometry.type === 'Polygon') && val.properties.layer === undefined) {
      if (val.geometry.type === 'Polygon') {
        val.geometry.type = 'LineString';
        val.geometry.coordinates = val.geometry.coordinates[0];
      }
      var bboxObj = turf.extent(val);
      bboxObj.push(val.properties['@id']);
      bboxes.push(bboxObj);
      listOfObjects[val.properties['@id']] = val;
    }
    if (val.properties.amenity && val.properties.amenity === 'parking_entrance' && val.geometry.type === 'Point') {
      listOfAvoidPoints[val.geometry.coordinates.join(',')] = false;
    }
  }
  var objsTree = rbush(bboxes.length);
  objsTree.load(bboxes);
  var output = {};
  for (var j = 0; j < bboxes.length; j++) {
    var bbox = bboxes[j];
    var objToEvaluate = listOfObjects[bbox[4]];
    if (objToEvaluate.properties.highway) {
      var overlaps = objsTree.search(bbox);
      for (var k = 0; k < overlaps.length; k++) {
        var overlapBbox = overlaps[k];
        var overlapObj = listOfObjects[overlapBbox[4]];
        if (overlapObj.properties.building) {
          var intersectPoint = turf.intersect(overlapObj, objToEvaluate);
          if (intersectPoint && ((intersectPoint.geometry.type === 'Point' && listOfAvoidPoints[intersectPoint.geometry.coordinates.join(',')]) || intersectPoint.geometry.type === 'MultiPoint')) {
            objToEvaluate.properties._osmlint = osmlint;
            overlapObj.properties._osmlint = osmlint;
            if (overlapObj.geometry.type === 'LineString') {
              overlapObj.geometry.type = 'Polygon';
              overlapObj.geometry.coordinates = [overlapObj.geometry.coordinates];
            }
            intersectPoint.properties = {
              _fromWay: objToEvaluate.properties['@id'],
              _toWay: overlapObj.properties['@id'],
              _osmlint: osmlint,
              _type: classification(majorRoads, minorRoads, pathRoads, objToEvaluate.properties.highway)
            };
            output[objToEvaluate.properties['@id']] = objToEvaluate;
            output[overlapObj.properties['@id']] = overlapObj;
            output[objToEvaluate.properties['@id'] + '-' + overlapObj.properties['@id']] = intersectPoint;
          }
        }
      }
    }
  }
  var result = _.values(output);
  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};

function classification(major, minor, path, highway) {
  if (major[highway]) {
    return 'major';
  } else if (minor[highway]) {
    return 'minor';
  } else if (path[highway]) {
    return 'path';
  }
}
