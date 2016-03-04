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
  preserveType = _.extend(preserveType, pathRoads);
  var unit = 'meters';
  var distance = 5;
  var highways = {};
  var bboxes = [];
  var output = {};
  var osmlint = 'nodeendingnearhighway';
  var avoidPoints = {};

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    // Linestring evaluation
    if (val.geometry.type === 'LineString' && val.properties.highway) {
      var bboxL = turf.extent(val);
      bboxL.push(val.properties._osm_way_id + 'L');
      bboxes.push(bboxL);
      highways[val.properties._osm_way_id + 'L'] = {
        highway: val,
        buffer: turf.buffer(val, distance, unit).features[0]
      };
    } else if (val.geometry.type === 'MultiLineString' && val.properties.highway) { //MultiLineString evaluation
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
    //check entrance, noexit and barrier
    if (val.geometry.type === 'Point' && (val.properties.entrance || val.properties.noexit === 'yes' || val.properties.barrier || val.properties.highway === 'turning_circle')) {
      avoidPoints[val.geometry.coordinates.join('-')] = true;
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);

  for (var m = 0; m < bboxes.length; m++) {
    var valueBbox = bboxes[m];
    var fromHighway = highways[valueBbox[4]].highway;
    //obtaining first and last coordinates
    var firstCoord = fromHighway.geometry.coordinates[0];
    var firstPoint = turf.point(firstCoord);
    var endCoord = fromHighway.geometry.coordinates[fromHighway.geometry.coordinates.length - 1];
    var endPoint = turf.point(endCoord);
    if (preserveType[fromHighway.properties.highway] && !_.isEqual(firstCoord, endCoord)) {
      var overlapsFirstPoint = [];
      if (!turf.inside(firstPoint, bufferLayer)) {
        overlapsFirstPoint = highwaysTree.search(turf.extent(turf.buffer(firstPoint, distance, unit)));
      }
      var overlapsEndPoint = [];
      if (!turf.inside(endPoint, bufferLayer)) {
        overlapsEndPoint = highwaysTree.search(turf.extent(turf.buffer(endPoint, distance, unit)));
      }
      var overlapBboxes = overlapsFirstPoint.concat(overlapsEndPoint);
      //if (!_.isEqual(firstCoord, endCoord)) {
      var arrayCorrd = [];
      for (var j = 0; j < overlapBboxes.length; j++) {
        var overlapBbox = overlapBboxes[j];
        if (valueBbox[4] !== overlapBbox[4]) {
          arrayCorrd = arrayCorrd.concat(_.flatten(highways[overlapBbox[4]].highway.geometry.coordinates));
        }
      }
      var type;
      if (majorRoads[fromHighway.properties.highway]) {
        type = 'major';
      } else if (minorRoads[fromHighway.properties.highway]) {
        type = 'minor';
      } else if (pathRoads[fromHighway.properties.highway]) {
        type = 'path';
      }
      var props = {
        _fromWay: fromHighway.properties._osm_way_id,
        _osmlint: osmlint,
        _type: type
      };

      if (!avoidPoints[firstCoord.join('-')]) {
        for (var k = 0; k < overlapsFirstPoint.length; k++) {
          var overlapPointFirst = overlapsFirstPoint[k];
          var toHighwayFirst = highways[overlapPointFirst[4]].highway;

          if (valueBbox[4] !== overlapPointFirst[4] && (arrayCorrd.indexOf(firstCoord[0]) === -1 || arrayCorrd.indexOf(firstCoord[1]) === -1)) {
            if (turf.inside(firstPoint, highways[overlapPointFirst[4]].buffer)) {
              props.toWay = toHighwayFirst.properties._osm_way_id;
              firstPoint.properties = props;
              //Check out whether the streets are connected at some point
              var coordinatesF = fromHighway.geometry.coordinates;
              var valueCoorF = _.flatten([coordinatesF[1], coordinatesF[2]]);
              var overlapCoorF = _.flatten(toHighwayFirst.geometry.coordinates);
              if (_.intersection(valueCoorF, overlapCoorF).length < 2) {
                fromHighway.properties._osmlint = osmlint;
                toHighwayFirst.properties._osmlint = osmlint;
                output[valueBbox[4]] = fromHighway;
                output[overlapPointFirst[4]] = toHighwayFirst;
                if (fromHighway.properties._osm_way_id > toHighwayFirst.properties._osm_way_id) {
                  output[valueBbox[4].toString().concat(overlapPointFirst[4])] = firstPoint;
                } else {
                  output[overlapPointFirst[4].toString().concat(valueBbox[4])] = firstPoint;
                }
              }
            }
          }
        }
      }
      if (!avoidPoints[endCoord.join('-')]) {
        for (var l = 0; l < overlapsEndPoint.length; l++) {
          var overlapPointEnd = overlapsEndPoint[l];
          var toHighwayEnd = highways[overlapPointEnd[4]].highway;
          if (valueBbox[4] !== overlapPointEnd[4] && (arrayCorrd.indexOf(endCoord[0]) === -1 || arrayCorrd.indexOf(endCoord[1]) === -1)) {
            if (turf.inside(endPoint, highways[overlapPointEnd[4]].buffer)) {
              props.toWay = toHighwayEnd.properties._osm_way_id;
              endPoint.properties = props;
              //Check out whether the streets are connected at some point
              var coordinatesE = fromHighway.geometry.coordinates;
              var valueCoorE = _.flatten([coordinatesE[coordinatesE.length - 1], coordinatesE[coordinatesE.length - 2]]);
              var overlapCoorE = _.flatten(toHighwayEnd.geometry.coordinates);
              if (_.intersection(valueCoorE, overlapCoorE).length < 2) {
                fromHighway.properties._osmlint = osmlint;
                toHighwayEnd.properties._osmlint = osmlint;
                output[valueBbox[4]] = fromHighway;
                output[overlapPointEnd[4]] = toHighwayEnd;
                if (fromHighway.properties._osm_way_id > toHighwayEnd.properties._osm_way_id) {
                  output[valueBbox[4].toString().concat(overlapPointEnd[4])] = endPoint;
                } else {
                  output[overlapPointEnd[4].toString().concat(valueBbox[4])] = endPoint;
                }
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
