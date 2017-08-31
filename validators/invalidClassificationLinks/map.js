'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxes = [];
  var highways = {};
  var output = {};
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

  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  var osmlint = 'invalidclassificationlinks';

  for (var z = 0; z < layer.features.length; z++) {
    var val = layer.features[z];
    if (val.geometry.type === 'LineString' && preserveType[val.properties.highway]) {
      var bboxA = turf.bbox(val);
      bboxA.push({
        id: val.properties['@id']
      });
      bboxes.push(bboxA);
      highways[val.properties['@id']] = val;
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);

  for (var i = 0; i < bboxes.length; i++) {
    var valueBbox = bboxes[i];
    var valueHighway = highways[valueBbox[4].id];
    valueHighway.properties._osmlint = osmlint;
    if (valueHighway.properties.highway.indexOf('_link') > -1) {

      var isFirstCoord = false;
      var isLastCoord = false;

      var overlaps = highwaysTree.search(valueBbox);
      var firstCoord = valueHighway.geometry.coordinates[0];
      var lastCoord = valueHighway.geometry.coordinates[valueHighway.geometry.coordinates.length - 1];

      for (var k = 0; k < overlaps.length; k++) {
        var overlap = overlaps[k];
        var overlapHighway = highways[overlap[4].id]; // why is there a 4 here

        if (valueHighway.properties['@id'] !== overlapHighway.properties['@id']) {
          var overlapCoords = _.flatten(overlapHighway.geometry.coordinates);
          if (_.intersection(overlapCoords, firstCoord).length === 2 && valueHighway.properties.highway.split('_')[0] !== overlapHighway.properties.highway && valueHighway.properties.highway !== overlapHighway.properties.highway) {
            isFirstCoord = true;
          }
          if (_.intersection(overlapCoords, lastCoord).length === 2 && valueHighway.properties.highway.split('_')[0] !== overlapHighway.properties.highway && valueHighway.properties.highway !== overlapHighway.properties.highway) {
            isLastCoord = true;
          }
        }
      }

      if (isLastCoord && isLastCoord) {
        output[valueHighway.properties['@id']] = valueHighway;
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