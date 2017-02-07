'use strict';
var turf = require('turf');
var rbush = require('rbush');
var _ = require('underscore');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var waterways = {};
  var highwaybboxes = [];
  var waterwaybboxes = [];
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
  var dontPreserveWaterways = {
    'dam': true,
    'weir': true,
    'waterfall': true,
    'stream': true,
    'ditch': true,
    'derelict_canal': true
  };
  var fords = {};
  var osmlint = 'crossingwaterwayshighways';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var id = val.properties['@id'];
    var bbox;
    if (preserveType[val.properties.highway] && val.properties.bridge === undefined && val.properties.tunnel === undefined && val.properties.ford === undefined) {
      if (val.geometry.type === 'LineString') {
        var idWayL = id + 'L';
        bbox = turf.bbox(val);
        bbox.push(idWayL);
        highwaybboxes.push(bbox);
        highways[idWayL] = val;
      } else if (val.geometry.type === 'MultiLineString') {
        var arrayWays = flatten(val);
        for (var f = 0; f < arrayWays.length; f++) {
          if (arrayWays[f].geometry.type === 'LineString') {
            var idWayM = id + 'M' + f;
            bbox = turf.bbox(arrayWays[f]);
            bbox.push(idWayM);
            highwaybboxes.push(bbox);
            arrayWays[f].properties = val.properties;
            highways[idWayM] = arrayWays[f];
          }
        }
      }
    } else if (((val.properties.waterway && !dontPreserveWaterways[val.properties.waterway]) || val.properties.natural === 'water') && (val.geometry.type === 'LineString' || val.geometry.type === 'Polygon') && val.properties.tunnel === undefined) {
      if (val.geometry.type === 'Polygon') {
        val.geometry.type = 'LineString';
        val.geometry.coordinates = val.geometry.coordinates[0];
      }
      var idWaterway = id + 'W';
      bbox = turf.bbox(val);
      bbox.push(idWaterway);
      waterwaybboxes.push(bbox);
      waterways[idWaterway] = val;
    } else if (val.properties.ford === 'yes' && val.geometry.type === 'Point') {
      fords[val.geometry.coordinates.join(',')] = true;
    }
  }

  var highwaysTree = rbush(highwaybboxes.length);
  highwaysTree.load(highwaybboxes);
  var output = {};

  for (var j = 0; j < waterwaybboxes.length; j++) {
    var waterBbox = waterwaybboxes[j];
    var overlaphighwaysBbox = highwaysTree.search(waterBbox);
    for (var k = 0; k < overlaphighwaysBbox.length; k++) {
      var overlapHigBbox = overlaphighwaysBbox[k];
      var intersect = turf.intersect(highways[overlapHigBbox[4]], waterways[waterBbox[4]]);
      if (intersect) {
        var props = {
          _fromWay: highways[overlapHigBbox[4]].properties['@id'],
          _toWay: waterways[waterBbox[4]].properties['@id'],
          _osmlint: osmlint,
          _type: classification(majorRoads, minorRoads, pathRoads, highways[overlapHigBbox[4]].properties.highway)
        };
        intersect.properties = props;
        highways[overlapHigBbox[4]].properties._osmlint = osmlint;
        waterways[waterBbox[4]].properties._osmlint = osmlint;
        output[overlapHigBbox[4]] = highways[overlapHigBbox[4]];
        output[waterBbox[4]] = waterways[waterBbox[4]];
        if (intersect.geometry.type === 'MultiPoint') {
          var coord = intersect.geometry.coordinates;
          for (var l = 0; l < coord.length; l++) {
            if (!fords[coord[l].join(',')]) {
              var point = turf.point(coord[l]);
              point.properties = props;
              output[waterBbox[4] + overlapHigBbox[4] + l] = point;
            }
          }
        } else if (intersect.geometry.type === 'Point' && !fords[intersect.geometry.coordinates.join(',')]) {
          output[waterBbox[4] + overlapHigBbox[4]] = intersect;
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

function classification(major, minor, path, highway) {
  if (major[highway]) {
    return 'major';
  } else if (minor[highway]) {
    return 'minor';
  } else if (path[highway]) {
    return 'path';
  }
}
