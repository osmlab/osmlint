'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'missingroundabout';
  var result = [];
  var listOfHighways = {};
  var highwaysBboxes = [];
  var suspRoundaboutBboxes = [];
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
    'residential': true
  };

  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.geometry.type === 'MultiLineString' && preserveType[val.properties.highway]) {
      var flat = flatten(val);
      var id = val.properties['@id'] + 'L';
      for (var f = 0; f < flat.length; f++) {
        if (flat[f].geometry.type === 'LineString') {
          var idFlat = id + 'M' + f;
          var bboxM = objBbox(flat[f], idFlat);
          highwaysBboxes.push(bboxM);
          flat[f].properties = val.properties;
          listOfHighways[idFlat] = flat[f];
        }
      }
    }
    if (preserveType[val.properties.highway] && val.geometry.type === 'LineString') {
      var bboxHighway = objBbox(val);
      listOfHighways[val.properties['@id']] = val;
      var coords = val.geometry.coordinates;
      if (coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]) {
        suspRoundaboutBboxes.push(bboxHighway);
      } else {
        highwaysBboxes.push(bboxHighway);
      }
    }
  }

  var highwaysTree = rbush(highwaysBboxes.length);
  highwaysTree.load(highwaysBboxes);
  for (var k = 0; k < suspRoundaboutBboxes.length; k++) {
    var roundaboutToEvaluate = listOfHighways[suspRoundaboutBboxes[k].id];
    if (isOval(roundaboutToEvaluate)) {
      var coordgObjSerial = {};
      var coordsRoundabout = roundaboutToEvaluate.geometry.coordinates;
      for (var z = 0; z < coordsRoundabout.length; z++) {
        coordgObjSerial[coordsRoundabout[z].join(',')] = {
          type: null
        };
      }
      var overlaps = highwaysTree.search(suspRoundaboutBboxes[k]);
      for (var y = 0; y < overlaps.length; y++) {
        var overlapHighway = listOfHighways[overlaps[y].id];
        var coordsOverlapHighway = overlapHighway.geometry.coordinates;
        //if the highway is entering to roundabout
        if (coordgObjSerial[coordsOverlapHighway[coordsOverlapHighway.length - 1].join(',')]) {
          if (coordgObjSerial[coordsOverlapHighway[coordsOverlapHighway.length - 1].join(',')].type) {
            coordgObjSerial[coordsOverlapHighway[coordsOverlapHighway.length - 1].join(',') + y] = {
              type: 'entry'
            };
          }
          coordgObjSerial[coordsOverlapHighway[coordsOverlapHighway.length - 1].join(',')].type = 'entry';
        }
        //if the highway is getting out from roundabout
        if (coordgObjSerial[coordsOverlapHighway[0].join(',')]) {
          if (coordgObjSerial[coordsOverlapHighway[0].join(',')].type) {
            coordgObjSerial[coordsOverlapHighway[0].join(',') + y] = {
              type: 'exit'
            };
          }
          coordgObjSerial[coordsOverlapHighway[0].join(',')].type = 'exit';
        }
      }
      var positions = _.values(coordgObjSerial);
      var salidas = 0;
      var entradas = 0;
      for (var n = 0; n < positions.length; n++) {
        if (positions[n].type === 'exit') {
          ++salidas;
        }
        if (positions[n].type === 'entry') {
          ++entradas;
        }
      }
      if ((salidas > 1 && entradas > 1 && !roundaboutToEvaluate.properties.junction && !roundaboutToEvaluate.properties.oneway)) {
        roundaboutToEvaluate.properties._osmlint = osmlint;
        if (majorRoads[roundaboutToEvaluate.properties.highway]) {
          roundaboutToEvaluate.properties._type = 'major';
        } else if (minorRoads[roundaboutToEvaluate.properties.highway]) {
          roundaboutToEvaluate.properties._type = 'minor';
        }
        result.push(roundaboutToEvaluate);
      }
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};

function isOval(highway) {
  var centroidPt = turf.centroid(highway);
  var points = turf.explode(highway);
  var range = 1.2;
  var flag = true;
  var totalDistace = 0;
  var distances = [];
  for (var i = 0; i < points.features.length; i++) {
    var distance = turf.distance(centroidPt, points.features[i], {
      units: 'kilometers'
    });
    distances.push(distance);
    totalDistace += distance;
  }
  var averageDistance = totalDistace / points.features.length;
  for (var f = 0; f < distances.length; f++) {
    if (distances[f] > averageDistance * range) {
      flag = false;
    }
  }
  return flag;
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
