'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxes = [];
  var bboxLayer = turf.bboxPolygon(turf.bbox(layer));
  bboxLayer.geometry.type = 'LineString';
  bboxLayer.geometry.coordinates = bboxLayer.geometry.coordinates[0];
  var bufferLayer = turf.buffer(bboxLayer, 0.01, 'miles');
  var highways = {};
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
    'living_street': true
      // 'service': true,
      // 'road': true
  };
  var pathRoads = {
    'pedestrian': true,
    'track': true,
    'footway': true,
    'path': true,
    'cycleway': true,
    'steps': true
  };
  var noaccess = {
    'motorway_link': true,
    'trunk_link': true,
    'primary_link': true,
    'secondary_link': true,
    'tertiary_link': true
  };
  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);
  // preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'impossibleoneways';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var id = val.properties['@id'];
    //Value LineString highways
    if (val.geometry.type === 'Polygon' && val.properties.highway) {
      val.geometry.coordinates = val.geometry.coordinates[0];
      val.geometry.type = 'LineString';
    }
    if (val.geometry.type === 'LineString' && val.properties.highway) {
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
          positionL = 'middle';
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
    } else if (val.geometry.type === 'MultiLineString' && val.properties.highway) { //MultiLineString evaluation
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
              positionM = 'middle';
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
  for (var key in highways) {
    var valueHighway = highways[key];
    var firstCoor = valueHighway.geometry.coordinates[0];
    var endCoor = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];
    if (valueHighway.properties.oneway && valueHighway.properties.oneway !== 'no' && preserveType[valueHighway.properties.highway] && _.intersection(firstCoor, endCoor).length !== 2 && !(valueHighway.properties.access && valueHighway.properties.access === 'no' && noaccess[valueHighway.properties.highway])) {
      // evaluate the first node of road
      var overlapsFirstcoor = highwaysTree.search(firstCoor.reverse().concat(firstCoor.reverse()));
      if (overlapsFirstcoor.length > 1) {
        var isExitFirst = false;
        var flagFirst = [];
        for (var u = 0; u < overlapsFirstcoor.length; u++) {
          var connectRoad = highways[overlapsFirstcoor[u][4].id];
          flagFirst.push(connection(overlapsFirstcoor[u][4].position, connectRoad.properties.oneway));
          if ((valueHighway.properties['@id'] === connectRoad.properties['@id'] && overlapsFirstcoor[u][4].isClipped) || (overlapsFirstcoor[u][4].position === 'middle' || connectRoad.properties.oneway === 'no' || typeof connectRoad.properties.oneway === 'undefined')) {
            isExitFirst = true;
          }
        }
        var connectionFirst = _.uniq(flagFirst);
        if (!isExitFirst && (connectionFirst[0] === 'output' || connectionFirst[0] === 'input') && connectionFirst.length === 1) {
          valueHighway.properties._osmlint = osmlint;
          features[valueHighway.properties['@id']] = valueHighway;
          var firstPointNoConnection = turf.point(firstCoor);
          firstPointNoConnection.properties = {
            _fromWay: valueHighway.properties['@id'],
            _osmlint: osmlint,
            _type: classification(majorRoads, minorRoads, pathRoads, valueHighway.properties.highway)
          };
          features[firstCoor.join('-')] = firstPointNoConnection;
        }
      }
      // evaluate the end node of road
      var overlapsEndcoor = highwaysTree.search(endCoor.reverse().concat(endCoor.reverse()));
      if (overlapsEndcoor.length === 1 && !overlapsEndcoor[0][4].isClipped) {
        valueHighway.properties._osmlint = osmlint;
        features[valueHighway.properties['@id']] = valueHighway;
        var endPointNoExit = turf.point(endCoor);
        endPointNoExit.properties = {
          _fromWay: valueHighway.properties['@id'],
          _osmlint: osmlint,
          _type: classification(majorRoads, minorRoads, pathRoads, valueHighway.properties.highway)
        };
        features[endCoor.join('-')] = endPointNoExit;
      } else {
        var isExitEnd = false;
        var flagEnd = [];
        for (var m = 0; m < overlapsEndcoor.length; m++) {
          var connectRoadEnd = highways[overlapsEndcoor[m][4].id];
          flagEnd.push(connection(overlapsEndcoor[m][4].position, connectRoadEnd.properties.oneway));
          if ((valueHighway.properties['@id'] === connectRoadEnd.properties['@id'] && overlapsEndcoor[m][4].isClipped) || (overlapsEndcoor[m][4].position === 'middle' || connectRoadEnd.properties.oneway === 'no' || typeof connectRoadEnd.properties.oneway === 'undefined')) {
            isExitEnd = true;
          }
        }
        var connectionEnd = _.uniq(flagEnd);
        if (!isExitEnd && (connectionEnd[0] === 'output' || connectionEnd[0] === 'input') && connectionEnd.length === 1) {
          valueHighway.properties._osmlint = osmlint;
          features[valueHighway.properties['@id']] = valueHighway;
          var endPointNoConnection = turf.point(endCoor);
          endPointNoConnection.properties = {
            _fromWay: valueHighway.properties['@id'],
            _osmlint: osmlint,
            _type: classification(majorRoads, minorRoads, pathRoads, valueHighway.properties.highway)
          };
          features[endCoor.join('-')] = endPointNoConnection;
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

function connection(position, oneway) {
  if (position === 'first' && oneway === -1) {
    return 'input';
  } else if (position === 'first' && (oneway === 'yes' || oneway === 1)) {
    return 'output';
  } else if (position === 'end' && (oneway === 'yes' || oneway === 1)) {
    return 'input';
  } else if (position === 'end' && oneway === -1) {
    return 'output';
  } else {
    return 'connection';
  }
}

function classification(major, minor, path, highway) {
  if (major[highway]) {
    return 'major';
  } else if (minor[highway]) {
    return 'minor';
  } else if (path[highway]) {
    return 'path';
  }
}
