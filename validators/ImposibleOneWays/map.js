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

  var bboxLayer = turf.bboxPolygon(turf.extent(layer));
  bboxLayer.geometry.type = 'LineString';
  bboxLayer.geometry.coordinates = bboxLayer.geometry.coordinates[0];
  var bufferLayer = turf.buffer(bboxLayer, 0.01, 'miles').features[0];


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

    if (val.geometry.type === 'LineString' && val.properties.highway) {
      var firstCoor = val.geometry.coordinates[0];
      var endCoor = val.geometry.coordinates[val.geometry.coordinates.length - 1];
      if (!turf.inside(turf.point(firstCoor), bufferLayer) && !turf.inside(turf.point(endCoor), bufferLayer) && _.intersection(firstCoor, endCoor).length !== 2) {

        var firstBbox = firstCoor.reverse().concat(firstCoor.reverse());
        var idLineString = val.properties._osm_way_id + 'L';
        firstBbox.push({
          id: idLineString,
          position: 'first'
        });
        bboxes.push(firstBbox);

        var endBbox = endCoor.reverse().concat(endCoor.reverse());
        endBbox.push({
          id: idLineString,
          position: 'end'
        });
        bboxes.push(endBbox);
        for (var z = 1; z < val.geometry.coordinates.length - 1; z++) {
          var midleCoor = val.geometry.coordinates[z];
          var midlebox = midleCoor.reverse().concat(midleCoor.reverse());
          midlebox.push({
            id: idLineString,
            position: 'midle'
          });
          bboxes.push(midlebox);
        }
        highways[idLineString] = val;
      }
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

  var features = {};
  for (var m = 0; m < bboxes.length; m++) {
    var valueBbox = bboxes[m];
    var valueHighway = highways[valueBbox[4].id];
    if (valueHighway.properties.oneway && valueHighway.properties.oneway !== 'no') {
      var coor = valueHighway.geometry.coordinates[0];
      var overlaps = highwaysTree.search(coor.reverse().concat(coor.reverse()));
      //true , highways which has  a connection
      var flag = [];
      for (var u = 0; u < overlaps.length; u++) {
        var connectRoad = highways[overlaps[u][4].id];
        if (valueHighway.properties._osm_way_id !== connectRoad.properties._osm_way_id) { //different roads
          if (!connectRoad.properties.oneway) {
            flag.push(true);
          } else if (connectRoad.properties.oneway === 'no') {
            flag.push(true);
          } else if (overlaps[u][4].position === 'end' && (connectRoad.properties.oneway === 'yes' || connectRoad.properties.oneway === 1)) {
            flag.push(true);
          } else if (overlaps[u][4].position === 'first' && connectRoad.properties.oneway === -1) {
            flag.push(true);
          } else if (overlaps[u][4].position === 'first') {
            flag.push(true);
          } else {
            flag.push(false);
          }
        }
      }
      if (flag.length === 0) {
        // var fc = turf.featurecollection([valueHighway, turf.point(valueHighway.geometry.coordinates[0])]);
        features[valueBbox[4].id] = valueHighway;
        features[valueBbox[4].id + 'P'] = turf.point(valueHighway.geometry.coordinates[0]);
        // writeData(JSON.stringify(fc) + '\n');
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