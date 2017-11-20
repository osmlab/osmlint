'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
var geojsonCoords = require('@mapbox/geojson-coords');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxLayer = turf.bboxPolygon(turf.bbox(layer));
  bboxLayer.geometry.type = 'LineString';
  bboxLayer.geometry.coordinates = bboxLayer.geometry.coordinates[0];
  var bufferLayer = turf.buffer(bboxLayer, 0.01, {
    units: 'miles'
  });
  var highways = {};
  var bboxes = [];
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
    // 'service': true,
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
  //preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'islandshighways';
  for (var z = 0; z < layer.features.length; z++) {
    var val = layer.features[z];
    if (val.geometry.type === 'LineString' && val.properties.highway) {
      var bboxA = objBbox(val, {
        id: val.properties['@id']
      });
      bboxes.push(bboxA);
      highways[val.properties['@id']] = val;
    } else if (val.geometry.type === 'MultiLineString' && val.properties.highway) {
      var flat = flatten(val);
      var id = val.properties['@id'] + 'L';
      for (var f = 0; f < flat.length; f++) {
        if (flat[f].geometry.type === 'LineString') {
          // var bboxB = turf.bbox(flat[f]);
          var idFlat = id + 'M' + f;
          // bboxB.push({
          //   id: idFlat
          // });
          var bboxB = objBbox(flat[f], {
            id: idFlat
          });
          bboxes.push(bboxB);
          highways[idFlat] = flat[f];
        }
      }
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  var output = {};

  for (var i = 0; i < bboxes.length; i++) {
    var valueBbox = bboxes[i];
    var valueHighway = highways[valueBbox.id.id];
    valueHighway.properties._osmlint = osmlint;
    var firstCoord = valueHighway.geometry.coordinates[0];
    var endCoord = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];
    if (!turf.booleanPointInPolygon(turf.point(firstCoord), bufferLayer) && !turf.booleanPointInPolygon(turf.point(endCoord), bufferLayer)) {
      var overlapBboxes = highwaysTree.search(valueBbox);

      if (overlapBboxes.length === 1) {
        output[valueBbox.id.id] = valueHighway;
      } else {
        var nearHighways = turf.featureCollection([]);
        for (var j = 0; j < overlapBboxes.length; j++) {
          var overlapBbox = overlapBboxes[j];
          if (valueBbox.id.id !== overlapBbox.id.id) {
            nearHighways.features.push(highways[overlapBbox.id.id]);
          }
        }
        var valueCoordinates = geojsonCoords(valueHighway);
        var nearCoordinates = geojsonCoords(nearHighways);
        //filter all highways without any connection
        if (_.intersection(_.flatten(valueCoordinates), _.flatten(nearCoordinates)).length < 2) {
          var obj = {};
          var arrf = [];
          var arre = [];
          for (var l = 0; l < nearHighways.features.length; l++) {
            var coords = nearHighways.features[l].geometry.coordinates;
            for (var m = 0; m < coords.length - 1; m++) {
              var firstDistance = distancePoint2Line(firstCoord[0], firstCoord[1], coords[m][0], coords[m][1], coords[m + 1][0], coords[m + 1][1]);
              var endDistance = distancePoint2Line(endCoord[0], endCoord[1], coords[m][0], coords[m][1], coords[m + 1][0], coords[m + 1][1]);
              obj[firstDistance] = turf.lineString([
                [coords[m][0], coords[m][1]],
                [coords[m + 1][0], coords[m + 1][1]]
              ]);
              obj[endDistance] = turf.lineString([
                [coords[m][0], coords[m][1]],
                [coords[m + 1][0], coords[m + 1][1]]
              ]);
              arrf.push(firstDistance);
              arre.push(endDistance);
            }
          }
          var minf = _.min(arrf);
          var mine = _.min(arre);
          //min distance from first and end point to shortest segment should be > 2 meters
          if (minf !== Infinity && minf > 2 && mine !== Infinity && mine > 2) {
            //roads classification
            if (majorRoads[valueHighway.properties.highway]) {
              valueHighway.properties._type = 'major';
            } else if (minorRoads[valueHighway.properties.highway]) {
              valueHighway.properties._type = 'minor';
            } else if (pathRoads[valueHighway.properties.highway]) {
              valueHighway.properties._type = 'path';
            }
            output[valueBbox.id.id] = valueHighway;
          }
        }
      }
    }
  }

  var result = [];

  _.each(output, function(road) {
    if (preserveType[road.properties.highway]) {
      result.push(road);
    }
  });
  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);

};

function distancePoint2Line(x, y, x1, y1, x2, y2) {
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;
  var dot = A * C + B * D;
  var lenSq = C * C + D * D;
  var param = -1;
  if (lenSq !== 0)
    param = dot / lenSq;
  var xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy) * 100 * 1000;
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
