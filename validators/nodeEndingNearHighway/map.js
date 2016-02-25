'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxLayer = turf.bboxPolygon(turf.extent(layer));
  bboxLayer.geometry.type = 'LineString';
  bboxLayer.geometry.coordinates = bboxLayer.geometry.coordinates[0];
  var bufferLayer = turf.buffer(bboxLayer, 0.01, 'miles').features[0];
  var preserveType = {
    //major
    'motorway': true,
    'trunk': true,
    'primary': true,
    'secondary': true,
    'tertiary': true,
    'unclassified': true,
    'residential': true,
    'service': true,
    'motorway_link': true,
    'trunk_link': true,
    'primary_link': true,
    'secondary_link': true,
    'tertiary_link': true,
    'living_street': true,
    'pedestrian': true,
    'road': true,
    //minor
    'track': true,
    'footway': true,
    'path': true
  };
  var unit = 'meters';
  var distance = 5;
  var highways = {};
  var bboxes = [];
  var output = {};
  var osmlint = 'nodeendingnearhighway';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    // Linestring evaluation
    if (val.geometry.type === 'LineString' && preserveType[val.properties.highway] && val.properties.layer === undefined) {
      var bboxL = turf.extent(val);
      bboxL.push(val.properties._osm_way_id + 'L');
      bboxes.push(bboxL);
      highways[val.properties._osm_way_id + 'L'] = {
        highway: val,
        buffer: turf.buffer(val, distance, unit).features[0]
      };
    } else if (val.geometry.type === 'MultiLineString' && preserveType[val.properties.highway] && val.properties.layer === undefined) { //MultiLineString evaluation
      var flat = flatten(val);
      var id = val.properties._osm_way_id + 'L';
      for (var f = 0; f < flat.length; f++) {
        if (flat[f].geometry.type === 'LineString') {
          var bboxM = turf.extent(flat[f]);
          var idFlat = id + 'M' + f;
          bboxM.push(idFlat);
          bboxes.push(bboxM);
          highways[idFlat] = {
            highway: flat[f],
            buffer: turf.buffer(flat[f], distance, unit).features[0]
          };
        }
      }
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);

  for (var m = 0; m < bboxes.length; m++) {
    var valueBbox = bboxes[m];
    //obtaining first and last coordinates
    var valueHighway = highways[valueBbox[4]].highway;
    var firstCoord = valueHighway.geometry.coordinates[0];
    var firstPoint = turf.point(firstCoord);
    var endCoord = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];
    var endPoint = turf.point(endCoord);
    var overlapsFirstPoint = [];
    if (!turf.inside(firstPoint, bufferLayer)) {
      overlapsFirstPoint = highwaysTree.search(turf.extent(turf.buffer(firstPoint, distance, unit)));
    }
    var overlapsEndPoint = [];
    if (!turf.inside(endPoint, bufferLayer)) {
      overlapsEndPoint = highwaysTree.search(turf.extent(turf.buffer(endPoint, distance, unit)));
    }
    var overlapBboxes = overlapsFirstPoint.concat(overlapsEndPoint);
    if (!_.isEqual(firstCoord, endCoord)) {
      var arrayCorrd = [];
      for (var j = 0; j < overlapBboxes.length; j++) {
        var overlapBbox = overlapBboxes[j];
        if (valueBbox[4] !== overlapBbox[4]) {
          arrayCorrd = arrayCorrd.concat(_.flatten(highways[overlapBbox[4]].highway.geometry.coordinates));
        }
      }

      var type;
      if (valueHighway.properties.highway === 'track' || valueHighway.properties.highway === 'footway' || valueHighway.properties.highway === 'path') {
        type = 'minor';
      } else {
        type = 'major';
      }
      var props = {
        wayA: valueHighway.properties._osm_way_id,
        _osmlint: osmlint,
        type: type
      };
      valueHighway.properties.type = type;
      for (var k = 0; k < overlapsFirstPoint.length; k++) {
        var overlapPointFirst = overlapsFirstPoint[k];
        var overlapHighwayF = highways[overlapPointFirst[4]].highway;

        if (valueBbox[4] !== overlapPointFirst[4] && (arrayCorrd.indexOf(firstCoord[0]) === -1 || arrayCorrd.indexOf(firstCoord[1]) === -1)) {
          if (turf.inside(firstPoint, highways[overlapPointFirst[4]].buffer)) {
            props.wayB = overlapHighwayF.properties._osm_way_id;
            firstPoint.properties = props;
            //Check out whether the streets are connected at some point
            var coordinatesF = valueHighway.geometry.coordinates;
            var valueCoorF = _.flatten([coordinatesF[1], coordinatesF[2]]);
            var overlapCoorF = _.flatten(overlapHighwayF.geometry.coordinates);
            if (_.intersection(valueCoorF, overlapCoorF).length < 2) {
              output[valueBbox[4]] = valueHighway;
              output[valueBbox[4]].properties._osmlint = osmlint;
              output[overlapPointFirst[4]] = overlapHighwayF;
              output[overlapPointFirst[4]].properties._osmlint = osmlint;
              if (valueHighway.properties._osm_way_id > overlapHighwayF.properties._osm_way_id) {
                output[valueBbox[4].toString().concat(overlapPointFirst[4]).concat('first')] = firstPoint;
              } else {
                output[overlapPointFirst[4].toString().concat(valueBbox[4]).concat('first')] = firstPoint;
              }
            }
          }
        }
      }
      for (var l = 0; l < overlapsEndPoint.length; l++) {
        var overlapPointEnd = overlapsEndPoint[l];
        var overlapHighwayE = highways[overlapPointEnd[4]].highway;
        if (valueBbox[4] !== overlapPointEnd[4] && (arrayCorrd.indexOf(endCoord[0]) === -1 || arrayCorrd.indexOf(endCoord[1]) === -1)) {
          if (turf.inside(endPoint, highways[overlapPointEnd[4]].buffer)) {
            props.wayB = overlapHighwayE.properties._osm_way_id;
            endPoint.properties = props;
            //Check out whether the streets are connected at some point
            var coordinatesE = valueHighway.geometry.coordinates;
            var valueCoorE = _.flatten([coordinatesE[coordinatesE.length - 1], coordinatesE[coordinatesE.length - 2]]);
            var overlapCoorE = _.flatten(overlapHighwayE.geometry.coordinates);
            if (_.intersection(valueCoorE, overlapCoorE).length < 2) {
              output[valueBbox[4]] = valueHighway;
              output[valueBbox[4]].properties._osmlint = osmlint;
              output[overlapPointEnd[4]] = overlapHighwayE;
              output[overlapPointEnd[4]].properties._osmlint = osmlint;
              if (valueHighway.properties._osm_way_id > overlapHighwayE.properties._osm_way_id) {
                output[valueBbox[4].toString().concat(overlapPointEnd[4]).concat('end')] = endPoint;
              } else {
                output[overlapPointEnd[4].toString().concat(valueBbox[4]).concat('end')] = endPoint;
              }
            }
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
