'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');
var geojsonCoords = require('geojson-coords');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxLineString = turf.bboxPolygon(turf.extent(layer));
  bboxLineString.geometry.type = 'LineString';
  bboxLineString.geometry.coordinates = bboxLineString.geometry.coordinates[0];
  var bufferTile = turf.buffer(bboxLineString, 0.01, 'miles').features[0];
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
      var bbox = turf.extent(val);
      bbox.push(val.properties._osm_way_id);
      bboxes.push(bbox);
      highways[val.properties._osm_way_id] = val;
    }
  });

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  var output = {};
  var osmlint = 'disconnectedhighways';


  for (var i = 0; i < bboxes.length; i++) {
    var valueBbox = bboxes[i];
    var valueHighway = highways[valueBbox[4]];
    var firstCoord = valueHighway.geometry.coordinates[0];
    var endCoord = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];
    var featurecollection = turf.featurecollection([]);
    if (!_.isEqual(firstCoord, endCoord) && !turf.inside(turf.point(firstCoord), bufferTile) && !turf.inside(turf.point(endCoord), bufferTile)) {
      var overlapBboxes = highwaysTree.search(valueBbox);
      for (var j = 0; j < overlapBboxes.length; j++) {
        var overlapBbox = overlapBboxes[j];
        if (valueBbox[4] !== overlapBbox[4]) {
          featurecollection.features.push(highways[overlapBbox[4]]);
        }
      }
      var valueCoordinates = geojsonCoords(valueHighway);
      var nearCoordinates = geojsonCoords(featurecollection);
      //filter all highways with out any connection
      if (_.intersection(_.flatten(valueCoordinates), _.flatten(nearCoordinates)).length === 0) {

        var flag = true;
        for (var k = 0; k < nearCoordinates.length; k++) {
          var firstdistance = turf.distance(turf.point(firstCoord), turf.point(nearCoordinates[k]), 'kilometers');
          var enddistance = turf.distance(turf.point(endCoord), turf.point(nearCoordinates[k]), 'kilometers');
          if (firstdistance < 0.05 || enddistance < 0.05) { //50 meters
            flag = false;
            //writeData('\n' + firstdistance + ' == ' + enddistance + ' ** ' + valueBbox[4] + (firstdistance < 0.01 || enddistance < 0.01) + '\n');
          }
        }
        if (flag) {
          output[valueBbox[4]] = valueHighway;

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


function pDistance(x, y, x1, y1, x2, y2) {

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