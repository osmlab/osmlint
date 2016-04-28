'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');
var knn = require('rbush-knn');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var bboxes = [];
  var bboxLayer = turf.bboxPolygon(turf.extent(layer));
  bboxLayer.geometry.type = 'LineString';
  bboxLayer.geometry.coordinates = bboxLayer.geometry.coordinates[0];
  var bufferLayer = turf.buffer(bboxLayer, 0.01, 'miles').features[0];
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
  var osmlint = 'impossibleoneways';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var id = val.properties._osm_way_id;
    //Value LineString highways
    if (val.geometry.type === 'LineString' && preserveType[val.properties.highway]) {
      var coordsWayL = val.geometry.coordinates;
      var isClippedL = false;
      if (turf.inside(turf.point(coordsWayL[0]), bufferLayer) || turf.inside(turf.point(coordsWayL[coordsWayL.length - 1]), bufferLayer)) {
        isClippedL = true;
      }
      var idWayL = id + 'L';
      for (var j = 0; j < coordsWayL.length; j++) {
        var positionL;
        if (j === 0) {
          positionL = 'first';
        } else if (j === (coordsWayL.length - 1)) {
          positionL = 'end';
        } else {
          positionL = 'midle';
        }
        var propsL = {
          id: idWayL,
          position: positionL,
          isClipped: isClippedL
        };
        var itemL = coordsWayL[j].reverse().concat(coordsWayL[j].reverse());
        itemL.push(propsL);
        bboxes.push(itemL);
      }
      highways[idWayL] = val;
    } else if (val.geometry.type === 'MultiLineString' && preserveType[val.properties.highway]) { //MultiLineString evaluation
      var arrayWays = flatten(val);
      for (var f = 0; f < arrayWays.length; f++) {
        if (arrayWays[f].geometry.type === 'LineString') {
          var coordsWayM = arrayWays[f].geometry.coordinates;
          var isClippedM = false;
          if (turf.inside(turf.point(coordsWayM[0]), bufferLayer) || turf.inside(turf.point(coordsWayM[coordsWayM.length - 1]), bufferLayer)) {
            isClippedM = true;
          }
          var idWayM = id + 'M' + f;
          for (var t = 0; t < coordsWayM.length; t++) {
            var positionM;
            if (t === 0) {
              positionM = 'first';
            } else if (t === (coordsWayM.length - 1)) {
              positionM = 'end';
            } else {
              positionM = 'midle';
            }
            var propsM = {
              id: idWayM,
              position: positionM,
              isClipped: isClippedM
            };
            var itemM = coordsWayM[t].reverse().concat(coordsWayM[t].reverse());
            itemM.push(propsM);
            bboxes.push(itemM);
            highways[idWayM] = arrayWays[f];
          }
        }
      }
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);

  var features = {};
  for (var m = 0; m < bboxes.length; m++) {
    var valueBbox = bboxes[m];
    var valueHighway = highways[valueBbox[4].id];
    var fCoor = valueHighway.geometry.coordinates[0];
    var eCoor = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];
    if (!valueBbox[4].isClipped && valueHighway.properties.oneway && valueHighway.properties.oneway !== 'no' && _.intersection(fCoor, eCoor).length !== 2 && valueHighway.properties.highway !== 'construction') {
      // var bufferedFCoor = turf.extent(turf.buffer(turf.point(fCoor), 2, 'meters'));
      var bufferedFCoor = fCoor.reverse().concat(fCoor.reverse());
      var overlapsFcoor = highwaysTree.search(bufferedFCoor);
      if (overlapsFcoor.length === 1) {
        features[valueBbox[4].id] = valueHighway;
        features[valueBbox[4].id + 'P'] = turf.point(fCoor);
      } else {
        // var flag = [];
        // for (var u = 0; u < overlapsFcoor.length; u++) {
        //   var connectRoadFirst = highways[overlapsFcoor[u][4].id];
        //   if (valueHighway.properties._osm_way_id !== connectRoadFirst.properties._osm_way_id) { //different roads
        //     if (overlapsFcoor[u][4].position === 'midle') {
        //       flag.push('connection');
        //       // break;
        //     } else {
        //       if (typeof connectRoadFirst.properties.oneway === 'undefined' || connectRoadFirst.properties.oneway === 'no') {
        //         flag.push('connection');
        //         // break;
        //       } else {
        //         //when the road's oneway is = yes or 1
        //         if ((valueHighway.properties.oneway === 'yes' || valueHighway.properties.oneway === 1) && overlapsFcoor[u][4].position === 'end' && (connectRoadFirst.properties.oneway === 'yes' || connectRoadFirst.properties.oneway === 1)) {
        //           flag.push('connection');
        //           // break;
        //         } else if ((valueHighway.properties.oneway === 'yes' || valueHighway.properties.oneway === 1) && overlapsFcoor[u][4].position === 'first' && connectRoadFirst.properties.oneway === -1) {
        //           flag.push('connection');
        //           // break;
        //         } else if (valueHighway.properties.oneway === -1 && overlapsFcoor[u][4].position === 'first' && (connectRoadFirst.properties.oneway === 'yes' || connectRoadFirst.properties.oneway === 1)) {
        //           //When the road's oneway is = -1
        //           flag.push('connection');
        //           // break;
        //         } else if (valueHighway.properties.oneway === -1 && overlapsFcoor[u][4].position === 'end' && connectRoadFirst.properties.oneway === -1) {
        //           flag.push('connection');
        //           // break;
        //         } else {
        //           flag.push('noconnection');
        //           // continue;
        //         }
        //       }
        //     }
        //   }
        // }
        // if (overlapsFcoor.length === (flag.length + 1) && flag.indexOf('connection') === -1) {
        //   features[valueBbox[4].id] = valueHighway;
        //   features[valueBbox[4].id + 'P'] = turf.point(valueHighway.geometry.coordinates[0]);
        // }
      }

      // var bufferedECoor = turf.extent(turf.buffer(turf.point(eCoor), 5, 'meters'));
      var bufferedECoor = eCoor.reverse().concat(eCoor.reverse());

      var overlapsEcoor = highwaysTree.search(bufferedECoor);
      if (overlapsEcoor.length === 1) {
        features[valueBbox[4].id] = valueHighway;
        features[valueBbox[4].id + 'P'] = turf.point(eCoor);
      } else {
        // var flag = [];
        // for (var u = 0; u < overlapsEcoor.length; u++) {
        //   var connectRoadEnd = highways[overlapsEcoor[u][4].id];
        //   if (valueHighway.properties._osm_way_id !== connectRoadEnd.properties._osm_way_id) { //different roads
        //     if (overlapsEcoor[u][4].position === 'midle') {
        //       flag.push('connection');
        //       // break;
        //     } else {
        //       if (typeof connectRoadEnd.properties.oneway === 'undefined' || connectRoadEnd.properties.oneway === 'no') {
        //         flag.push('connection');
        //         // break;
        //       } else {
        //         //when the road's oneway is = yes or 1
        //         if ((valueHighway.properties.oneway === 'yes' || valueHighway.properties.oneway === 1) && overlapsEcoor[u][4].position === 'end' && connectRoadEnd.properties.oneway === -1) {
        //           flag.push('connection');
        //           // break;
        //         } else if ((valueHighway.properties.oneway === 'yes' || valueHighway.properties.oneway === 1) && overlapsEcoor[u][4].position === 'first' && (connectRoadEnd.properties.oneway === 'yes' || connectRoadEnd.properties.oneway === 1)) {
        //           flag.push('connection');
        //           // break;
        //         } else if (valueHighway.properties.oneway === -1 && overlapsEcoor[u][4].position === 'first' && connectRoadEnd.properties.oneway === -1) {
        //           //When the road's oneway is = -1
        //           flag.push('connection');
        //           // break;
        //         } else if (valueHighway.properties.oneway === -1 && overlapsEcoor[u][4].position === 'end' && (connectRoadEnd.properties.oneway === 'yes' || connectRoadEnd.properties.oneway === 1)) {
        //           flag.push('connection');
        //           // break;
        //         } else {
        //           flag.push('noconnection');
        //           // continue;
        //         }
        //       }
        //     }
        //   }
        // }
        // if (overlapsFcoor.length === (flag.length + 1) && flag.indexOf('connection') === -1) {
        //   features[valueBbox[4].id] = valueHighway;
        //   features[valueBbox[4].id + 'P'] = turf.point(valueHighway.geometry.coordinates[0]);
        // }
      }

    }
  }

  var result = _.values(features);
  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);

};