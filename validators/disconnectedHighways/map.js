'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');
var geojsonCoords = require('geojson-coords');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxLayer = turf.bboxPolygon(turf.extent(layer));
  bboxLayer.geometry.type = 'LineString';
  bboxLayer.geometry.coordinates = bboxLayer.geometry.coordinates[0];
  var bufferLayer = turf.buffer(bboxLayer, 0.01, 'miles').features[0];
  var highways = {};
  var bboxes = [];
  var preserveHighways = {
    'motorway': true,
    'primary': true,
    'secondary': true,
    'tertiary': true,
    'trunk': true,
    'residential': true,
    'unclassified': true,
    'living_street': true,
    'road': true,
    'service': true
  };

  layer.features.forEach(function(val) {
    if (val.geometry.type === 'LineString' && preserveHighways[val.properties.highway]) {
      var bboxA = turf.extent(val);
      bboxA.push({
        id: val.properties._osm_way_id
      });
      bboxes.push(bboxA);
      highways[val.properties._osm_way_id] = val;
    } else if (val.geometry.type === 'MultiLineString' && preserveHighways[val.properties.highway]) {
      var flat = flatten(val);
      var id = val.properties._osm_way_id + 'L';
      for (var f = 0; f < flat.length; f++) {
        if (flat[f].geometry.type === 'LineString') {
          var bboxB = turf.extent(flat[f]);
          var id_flat = id + 'M' + f;
          bboxB.push({
            id: id_flat
          });
          bboxes.push(bboxB);
          highways[id_flat] = flat[f];
        }
      }
    }
  });

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  var output = {};
  
  for (var i = 0; i < bboxes.length; i++) {
    var valueBbox = bboxes[i];
    var valueHighway = highways[valueBbox[4].id];
    valueHighway.properties._osmlint = 'disconnectedhighways';
    var firstCoord = valueHighway.geometry.coordinates[0];
    var endCoord = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];
    if (!turf.inside(turf.point(firstCoord), bufferLayer) && !turf.inside(turf.point(endCoord), bufferLayer)) {
      var overlapBboxes = highwaysTree.search(valueBbox);
      if (overlapBboxes.length === 1) {
        output[valueBbox[4].id] = valueHighway;
      } else {
        var featurecollection = turf.featurecollection([]);
        for (var j = 0; j < overlapBboxes.length; j++) {
          var overlapBbox = overlapBboxes[j];
          if (valueBbox[4].id !== overlapBbox[4].id) {
            featurecollection.features.push(highways[overlapBbox[4].id]);
          }
        }
        var valueCoordinates = geojsonCoords(valueHighway);
        var nearCoordinates = geojsonCoords(featurecollection);
        //filter all highways without any connection
        if (_.intersection(_.flatten(valueCoordinates), _.flatten(nearCoordinates)).length === 0) {
          var obj = {};
          var arrf = [];
          var arre = [];
          for (var l = 0; l < featurecollection.features.length; l++) {
            var coords = featurecollection.features[l].geometry.coordinates;
            for (var m = 0; m < coords.length - 1; m++) {
              var firstDistance = DistancePoint2Line(firstCoord[0], firstCoord[1], coords[m][0], coords[m][1], coords[m + 1][0], coords[m + 1][1]);
              var endDistance = DistancePoint2Line(endCoord[0], endCoord[1], coords[m][0], coords[m][1], coords[m + 1][0], coords[m + 1][1]);
              obj[firstDistance] = turf.linestring([coords[m][0], coords[m][1], coords[m + 1][0], coords[m + 1][1]]);
              obj[endDistance] = turf.linestring([coords[m][0], coords[m][1], coords[m + 1][0], coords[m + 1][1]]);
              arrf.push(firstDistance);
              arre.push(endDistance);
            }
          }
          var minf = _.min(arrf);
          var mine = _.min(arre);
          if (minf != Infinity && minf > 0.00005 && mine != Infinity && mine > 0.00005) {
            output[valueBbox[4].id] = valueHighway;
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

function DistancePoint2Line(x, y, x1, y1, x2, y2) {
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;
  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq !== 0)
    param = dot / len_sq;
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
  return Math.sqrt(dx * dx + dy * dy);
}