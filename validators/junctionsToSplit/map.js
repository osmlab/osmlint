'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxes = [];
  var highways = {};
  var output = {};
  var majorRoads = {
    motorway: true,
    trunk: true,
    primary: true,
    secondary: true,
    tertiary: true,
    motorway_link: true,
    trunk_link: true,
    primary_link: true,
    secondary_link: true,
    tertiary_link: true
  };
  var minorRoads = {
    unclassified: true,
    residential: true,
    living_street: true,
    service: true,
    road: true
  };

  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);
  var osmlint = 'junctionstosplit';
  for (var z = 0; z < layer.features.length; z++) {
    var val = layer.features[z];
    if (val.geometry.type === 'LineString' && preserveType[val.properties.highway]) {
      var bboxA = objBbox(val);
      bboxes.push(bboxA);
      highways[val.properties['@id']] = val;
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  for (var i = 0; i < bboxes.length; i++) {
    var valueBbox = bboxes[i];
    var valueHighway = highways[valueBbox.id];
    valueHighway.properties._osmlint = osmlint;
    if (valueHighway.properties.highway === 'motorway_link') {
      var overlaps = highwaysTree.search(valueBbox);
      var isEntrance = false;
      var valueHighwayCoords = valueHighway.geometry.coordinates;
      var intersectHighway;
      for (var k = 0; k < overlaps.length; k++) {
        var overlap = overlaps[k];
        var isIntersect = false;
        var overlapHighway = highways[overlap.id];
        if (
          valueHighway.properties['@id'] !== overlapHighway.properties['@id'] &&
          overlapHighway.properties.highway !== 'motorway_link'
        ) {
          var overlapHighwayCoords = overlapHighway.geometry.coordinates;
          var intersection = turf.lineIntersect(valueHighway, overlapHighway);
          if (intersection && intersection.features.length > 0) {
            intersection = intersection.features[0];
            var interCoordsF = flatten(intersection.geometry.coordinates);
            if (_.intersection(valueHighwayCoords[0], interCoordsF).length === 2) {
              isEntrance = true;
            }
            if (
              _.intersection(valueHighwayCoords[0], interCoordsF).length !== 2 &&
              _.intersection(valueHighwayCoords[valueHighwayCoords.length - 1], interCoordsF).length !== 2
            ) {
              for (var t = 1; t < overlapHighwayCoords.length - 1; t++) {
                if (_.intersection(overlapHighwayCoords[t], interCoordsF).length === 2) {
                  isIntersect = true;
                  intersectHighway = overlapHighway;
                }
              }
            }
            if (isEntrance && isIntersect) {
              intersectHighway = overlapHighway;
              output[valueHighway.properties['@id']] = valueHighway;
              output[intersectHighway.properties['@id']] = intersectHighway;
              intersection.properties = {
                _toWay: valueHighway.properties['@id'],
                _fromWay: overlapHighway.properties['@id'],
                _osmlint: osmlint
              };
              output[valueHighway.properties['@id'] + 'P'] = intersection;
            }
          }
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

function flatten(coords) {
  var array = [];
  for (var i = 0; i < coords.length; i++) {
    if (_.isArray(coords[i])) {
      array = array.concat(flatten(coords[i]));
    } else {
      array.push(coords[i]);
    }
  }
  return array;
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
