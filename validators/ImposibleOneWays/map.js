'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');
var knn = require('rbush-knn');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
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
  // preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'impossibleoneways';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    // Linestring evaluation
    if (val.geometry.type === 'LineString' && val.properties.highway) {
      var firstCoor = val.geometry.coordinates[0];
      var firstBbox = firstCoor.reverse().concat(firstCoor.reverse());
      var idLineString = val.properties._osm_way_id + 'L';
      firstBbox.push({
        id: idLineString,
        position: 'first'
      });
      bboxes.push(firstBbox);
      var endCoor = val.geometry.coordinates[val.geometry.coordinates.length - 1];
      var endBbox = endCoor.reverse().concat(endCoor.reverse());
      endBbox.push({
        id: idLineString,
        position: 'end'
      });
      bboxes.push(endBbox);
      highways[idLineString] = val;
    }
    // else if (val.geometry.type === 'MultiLineString' && val.properties.highway) { //MultiLineString evaluation
    //   var flat = flatten(val);
    //   var id = val.properties._osm_way_id + 'L';
    //   for (var f = 0; f < flat.length; f++) {
    //     if (flat[f].geometry.type === 'LineString') {
    //       var bboxM = turf.extent(flat[f]);
    //       var idFlat = id + 'M' + f;
    //       bboxM.push(idFlat);
    //       bboxes.push(bboxM);
    //       flat[f].properties = val.properties;
    //       highways[idFlat] = val;
    //     }
    //   }
    // }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);

  for (var m = 0; m < bboxes.length; m++) {
    var valueBbox = bboxes[m];
    var valueHighway = highways[valueBbox[4].id];
    if (valueHighway.properties.oneway && valueHighway.properties.oneway !== 'no') {

      var features = {};

      var neighborsFirstCoor = knn(highwaysTree, valueHighway.geometry.coordinates[0].reverse(), 5, function(item) {
        if (item[4].id !== valueBbox[4].id) {
          writeData(item[4].id + '!==' + valueBbox[4].id + '\n')
        }
      });

    }
  }

  var result = _.values({});

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    //writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);

};