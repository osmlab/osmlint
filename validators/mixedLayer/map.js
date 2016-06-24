'use strict';
var turf = require('turf');
var rbush = require('rbush');
var _ = require('underscore');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var highwaybboxes = [];
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
  var osmlint = 'mixedlayer';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var id = val.properties['@id'];
    var bbox;
    if (preserveType[val.properties.highway]) {
      if (val.geometry.type === 'LineString') {
        var idWayL = id + 'L';
        bbox = turf.extent(val);
        bbox.push(idWayL);
        highwaybboxes.push(bbox);
        highways[idWayL] = val;
      } else if (val.geometry.type === 'MultiLineString') {
        var arrayWays = flatten(val);
        for (var f = 0; f < arrayWays.length; f++) {
          if (arrayWays[f].geometry.type === 'LineString') {
            var idWayM = id + 'M' + f;
            bbox = turf.extent(arrayWays[f]);
            bbox.push(idWayM);
            highwaybboxes.push(bbox);
            arrayWays[f].properties = val.properties;
            highways[idWayM] = arrayWays[f];
          }
        }
      }
    }
  }

  var highwaysTree = rbush(highwaybboxes.length);
  highwaysTree.load(highwaybboxes);
  var output = {};

  for (var j = 0; j < highwaybboxes.length; j++) {
    var valueHighway = highways[highwaybboxes[j][4]];
    //check only highways which has layer
    if (valueHighway.properties.layer && valueHighway.properties.layer !== '0' && valueHighway.geometry.coordinates.length > 2) {
      var overlaphighwaysBbox = highwaysTree.search(highwaybboxes[j]);
      for (var k = 0; k < overlaphighwaysBbox.length; k++) {
        var overlaphighway = highways[overlaphighwaysBbox[k][4]];
        if (valueHighway.properties['@id'] !== overlaphighway.properties['@id'] && valueHighway.properties.layer !== overlaphighway.properties.layer && overlaphighway.geometry.coordinates.length > 2) {
          var coorVH = valueHighway.geometry.coordinates;
          var coorOH = overlaphighway.geometry.coordinates;
          var middleCoorVH = _.without(_.flatten(coorVH), coorVH[0][0], coorVH[0][1], coorVH[coorVH.length - 1][0], coorVH[coorVH.length - 1][0]); // valueHighway.geometry.coordinates.splice(0, 1).splice(-1, 1);
          var middleCoorOH = _.without(_.flatten(coorOH), coorOH[0][0], coorOH[0][1], coorOH[coorOH.length - 1][0], coorOH[coorOH.length - 1][0]); // overlaphighway.geometry.coordinates.splice(0, 1).splice(-1, 1);
          var inter = _.intersection(middleCoorVH, middleCoorOH);
          if (inter.length == 2) {
            var intersect = turf.point(inter);
            var props = {
              _fromWay: valueHighway.properties['@id'],
              _toWay: overlaphighway.properties['@id'],
              _osmlint: osmlint,
              _type: classification(majorRoads, minorRoads, pathRoads, valueHighway.properties.highway)
            };
            intersect.properties = props;
            valueHighway.properties._osmlint = osmlint;
            overlaphighway.properties._osmlint = osmlint;
            output[valueHighway.properties['@id']] = valueHighway;
            output[overlaphighway.properties['@id']] = overlaphighway;
            if (intersect.geometry.type === 'MultiPoint') {
              var coord = intersect.geometry.coordinates;
              for (var l = 0; l < coord.length; l++) {
                var point = turf.point(coord[l]);
                point.properties = props;
                output[valueHighway.properties['@id'] + overlaphighway.properties['@id'] + l] = point;
              }
            } else if (intersect.geometry.type === 'Point') {
              output[valueHighway.properties['@id'] + overlaphighway.properties['@id']] = intersect;
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

function classification(major, minor, path, highway) {
  if (major[highway]) {
    return 'major';
  } else if (minor[highway]) {
    return 'minor';
  } else if (path[highway]) {
    return 'path';
  }
}
