'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxes = [];
  var highways = {};
  var output = {};
  var motorwayJunction = {};
  var majorRoads = {
    'motorway': true,
    'motorway_link': true
  };

  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  var osmlint = 'getylane';
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
    if (val.geometry.type === 'Point' && val.properties.highway && val.properties.highway === 'motorway_junction') {
      var bboxP = turf.bbox(turf.buffer(val, 20, 'meters'));
      bboxP.push({
        id: val.properties['@id'] + 'P',
        junction: true
      });
      bboxes.push(bboxP);
      motorwayJunction[val.properties['@id'] + 'P'] = val;
    }
  }
  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  for (var i = 0; i < bboxes.length; i++) {
    var valueBbox = bboxes[i];
    if (!valueBbox[4].junction) {
      var valueHighway = highways[valueBbox[4].id];
      valueHighway.properties._osmlint = osmlint;
      var overlaps = highwaysTree.search(valueBbox);
      for (var k = 0; k < overlaps.length; k++) {
        var overlap = overlaps[k];
        var overlapObj = motorwayJunction[overlap[4].id];
        if (overlapObj && valueHighway.properties['@id'] !== overlapObj.properties['@id'] && overlapObj.properties.highway === 'motorway_junction') {
          var coords = _.flatten(valueHighway.geometry.coordinates);
          var overlapCoords = overlapObj.geometry.coordinates;
          if (_.intersection(coords, overlapCoords).length === 2) {
            output[valueHighway.properties['@id']] = valueHighway;
            output[overlap[4].id] = overlapObj;
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
