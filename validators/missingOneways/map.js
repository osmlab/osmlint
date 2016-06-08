'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxes = [];
  var highways = {};
  var majorRoads = {
    'motorway': true,
    'motorway_link': true
  };

  var preserveType = majorRoads;

  var osmlint = 'missingoneways';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var id = val.properties['@id'];
    //Value LineString highways
    if (val.geometry.type === 'Polygon' && preserveType[val.properties.highway]) {
      val.geometry.coordinates = val.geometry.coordinates[0];
      val.geometry.type = 'LineString';
    }
    if (val.geometry.type === 'LineString' && preserveType[val.properties.highway]) {
      var coordsWayL = val.geometry.coordinates;
      var idWayL = id + 'L';
      for (var j = 0; j < coordsWayL.length; j++) {
        var propsL = {
          id: idWayL
        };
        var itemL = coordsWayL[j].reverse().concat(coordsWayL[j].reverse());
        itemL.push(propsL);
        bboxes.push(itemL);
      }
      highways[idWayL] = val;
    } else if (val.geometry.type === 'MultiLineString' && preserveType[val.properties.highway]) {
      var arrayWays = flatten(val);
      for (var f = 0; f < arrayWays.length; f++) {
        if (arrayWays[f].geometry.type === 'LineString') {
          var coordsWayM = arrayWays[f].geometry.coordinates;
          var idWayM = id + 'M' + f;
          for (var t = 0; t < coordsWayM.length; t++) {
            var propsM = {
              id: idWayM
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
    if (!valueHighway.properties.oneway && valueHighway.properties.highway === 'motorway_link') {
      valueHighway.properties._osmlint = osmlint;
      valueHighway.properties._type = classification(majorRoads, {}, {}, valueHighway.properties.highway);
      // evaluate the first node of road
      var overlapsFirstcoor = highwaysTree.search(firstCoor.reverse().concat(firstCoor.reverse()));
      if (overlapsFirstcoor.length > 1) {
        for (var u = 0; u < overlapsFirstcoor.length; u++) {
          var connectRoadFrist = highways[overlapsFirstcoor[u][4].id];
          if (valueHighway.properties['@id'] !== connectRoadFrist.properties['@id'] && connectRoadFrist.properties.oneway && connectRoadFrist.properties.highway === 'motorway') {
            features[valueHighway.properties['@id']] = valueHighway;
          }
        }
      }
      // evaluate the end node of road
      var overlapsEndcoor = highwaysTree.search(endCoor.reverse().concat(endCoor.reverse()));
      if (overlapsEndcoor.length > 1) {
        for (var p = 0; p < overlapsEndcoor.length; p++) {
          var connectRoadEnd = highways[overlapsEndcoor[p][4].id];
          if (valueHighway.properties['@id'] !== connectRoadEnd.properties['@id'] && connectRoadEnd.properties.oneway && connectRoadEnd.properties.highway === 'motorway') {
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
