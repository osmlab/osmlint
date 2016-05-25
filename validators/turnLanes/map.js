'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

// Filter all objects which has fixme tag.
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
  //preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'turnlanes';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (preserveType[val.properties.highway] && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString')) {
      if (val.properties['turn:lanes'] && !isInvalid(val.properties['turn:lanes'])) {
        writeData(val.properties['turn:lanes'] + '\n');
      } else if (val.properties['turn:lanes:forward'] && !isInvalid(val.properties['turn:lanes:forward'])) {
        writeData(val.properties['turn:lanes:forward'] + '\n');
      } else if (val.properties['turn:lanes:backward'] || !isInvalid(val.properties['turn:lanes:backward'])) {
        writeData(val.properties['turn:lanes:backward'] + '\n');
      }
    }
  }

};

function isInvalid(turnLanes) {
  var listLines = turnLanes.split("|");
  for (var i = 0; i < listLines.length; i++) {
    if (listLines[i].indexOf(';')>0) {
      if (!validate(listLines[i])) {
        return false;
      }
    }
  }
  return true;
}

function validate(turns) {
  switch (turns) {
    case "left;through":
      return true;
    case "left;through;right":
      return true;
    case "through;right":
      return true;
    case "left;right":
      return true;
    default:
      return false;
  }
}