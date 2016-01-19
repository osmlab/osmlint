'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

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
  var osmlint = 'nodeendingnearhighway';
  bboxes.forEach(function(valueBbox) {
    var valueHighway = highways[valueBbox[4]];
    var firstCoord = valueHighway.geometry.coordinates[0];
    var endCoord = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];
    if (!_.isEqual(firstCoord, endCoord) && !turf.inside(turf.point(firstCoord), bufferTile) && !turf.inside(turf.point(endCoord), bufferTile)) {
      var overlapBboxes = highwaysTree.search(valueBbox);
      var arrayCorrd = [];
      var flag = true;
      for (var i = 0; i < overlapBboxes.length; i++) {
        var overlapBbox = overlapBboxes[i];
        if (valueBbox[4] !== overlapBbox[4]) {
          arrayCorrd = arrayCorrd.concat(_.flatten(highways[overlapBbox[4]].geometry.coordinates));
          var intersect = turf.intersect(valueHighway, highways[overlapBbox[4]]);
          if (!intersect) {
            flag = false;
            break;
          }
        }
      }
      var valueCoord = _.flatten(valueHighway.geometry.coordinates);
      if (_.difference(arrayCorrd, valueCoord).length === arrayCorrd.length && flag) {
        output[valueBbox[4]] = valueHighway;
      }
    }
  });
  var result = _.values(output);

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};