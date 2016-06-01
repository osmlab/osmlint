'use strict';
var turf = require('turf');
var _ = require('underscore');

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
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];

    if (preserveType[val.properties.highway] && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString')) {
      if (val.properties['turn:lanes'] && !isInvalid(val.properties['turn:lanes'])) {
        val.properties._osmlint = osmlint;
        result.push(val);
      } else if (val.properties['turn:lanes:forward'] && !isInvalid(val.properties['turn:lanes:forward'])) {
        val.properties._osmlint = osmlint;
        result.push(val);
      } else if (val.properties['turn:lanes:backward'] && !isInvalid(val.properties['turn:lanes:backward'])) {
        val.properties._osmlint = osmlint;
        result.push(val);
      }
    }
  }

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};

function isInvalid(turnLanes) {
  var listLines = turnLanes.split("|");
  for (var i = 0; i < listLines.length; i++) {
    if (listLines[i].indexOf(';') > 0) {
      if (!validate(listLines[i])) {
        return false;
      }
    }
  }
  return true;
}

function validate(turns) {
  var listTurns = ['reverse', 'sharp_left', 'left', 'slight_left', 'merge_to_right', 'through', 'merge_to_left', 'slight_right', 'right', 'sharp_right'];
  var sortTurns = [];
  var arrayTurns = turns.split(';');
  for (var t in listTurns) {
    if (arrayTurns.indexOf(listTurns[t]) > -1) {
      sortTurns.push(listTurns[t]);
    }
  }
  if (turns == sortTurns.join(';')) {
    return true;
  } else {
    return false;
  }
}