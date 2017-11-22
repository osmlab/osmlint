'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxes = [];
  var highways = {};
  var majorRoads = {
    motorway: true,
    motorway_link: true
  };

  var preserveType = majorRoads;

  var osmlint = 'missingoneways';
  //get al highways which are linestring and multilinestring  to add add in the tree to use rbush
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var id = val.properties['@id'];
    //Value LineString highways
    if (
      val.geometry.type === 'Polygon' &&
      preserveType[val.properties.highway]
    ) {
      val.geometry.coordinates = val.geometry.coordinates[0];
      val.geometry.type = 'LineString';
    }
    if (
      val.geometry.type === 'LineString' &&
      preserveType[val.properties.highway]
    ) {
      var coordsWayL = val.geometry.coordinates;
      var idWayL = id + 'L';
      for (var j = 0; j < coordsWayL.length; j++) {
        var itemL = objBbox(turf.point(coordsWayL[j]), idWayL);
        bboxes.push(itemL);
      }
      highways[idWayL] = val;
    } else if (
      val.geometry.type === 'MultiLineString' &&
      preserveType[val.properties.highway]
    ) {
      var arrayWays = flatten(val);
      for (var f = 0; f < arrayWays.length; f++) {
        if (arrayWays[f].geometry.type === 'LineString') {
          var coordsWayM = arrayWays[f].geometry.coordinates;
          var idWayM = id + 'M' + f;
          for (var t = 0; t < coordsWayM.length; t++) {
            var itemM = objBbox(turf.point(coordsWayM[t]), idWayM);
            bboxes.push(itemM);
            highways[idWayM] = arrayWays[f];
          }
        }
      }
    }
  }
  //add the array bboxes to rbush
  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  var features = {};
  for (var key in highways) {
    var valueHighway = highways[key];
    var firstCoor = valueHighway.geometry.coordinates[0];
    var endCoor =
      valueHighway.geometry.coordinates[
        valueHighway.geometry.coordinates.length - 1
      ];
    //check if they evaluate road is motorway_link and has oneway, the goal is obtaining this roads
    if (
      !valueHighway.properties.oneway &&
      valueHighway.properties.highway === 'motorway_link'
    ) {
      valueHighway.properties._osmlint = osmlint;
      valueHighway.properties._type = classification(
        majorRoads,
        {},
        {},
        valueHighway.properties.highway
      );
      // evaluate the first node of road
      var overlapsFirstcoor = highwaysTree.search(
        objBbox(turf.point(firstCoor), 'id')
      );

      if (overlapsFirstcoor.length > 1) {
        for (var u = 0; u < overlapsFirstcoor.length; u++) {
          var connectRoadFrist = highways[overlapsFirstcoor[u].id];
          if (
            valueHighway.properties['@id'] !==
              connectRoadFrist.properties['@id'] &&
            connectRoadFrist.properties.oneway &&
            connectRoadFrist.properties.highway === 'motorway'
          ) {
            features[valueHighway.properties['@id']] = valueHighway;
          }
        }
      }
      // evaluate the end node of road
      var overlapsEndcoor = highwaysTree.search(
        objBbox(turf.point(endCoor), 'id')
      );
      if (overlapsEndcoor.length > 1) {
        for (var p = 0; p < overlapsEndcoor.length; p++) {
          var connectRoadEnd = highways[overlapsEndcoor[p].id];
          if (
            valueHighway.properties['@id'] !==
              connectRoadEnd.properties['@id'] &&
            connectRoadEnd.properties.oneway &&
            connectRoadEnd.properties.highway === 'motorway'
          ) {
            if (features[valueHighway.properties['@id']]) {
              delete features[valueHighway.properties['@id']];
            } else {
              features[valueHighway.properties['@id']] = valueHighway;
            }
          }
        }
      }
    }
  }

  var result = _.values(features);
  if (result.length > 0) {
    var fc = turf.featureCollection(result);
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
