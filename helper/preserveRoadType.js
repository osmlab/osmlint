'use strict';
var _ = require('underscore');
var majorRoads = {
  motorway: true,
  trunk: true,
  primary: true,
  secondary: true,
  tertiary: true,
  motorway_link: true,
  trunk_link: true,
  primary_link: true,
  secondary_link: true,
  tertiary_link: true
};
var minorRoads = {
  unclassified: true,
  residential: true,
  living_street: true,
  service: true,
  road: true
};
var pathRoads = {
  pedestrian: true,
  track: true,
  footway: true,
  path: true,
  cycleway: true,
  steps: true
};

module.exports = {
  types,
  fromToTypes
};

/**
 * This works classifies the streets into three groups, which will be used for the evaluation in the validators
 * @param type {Integer} 1 = returns major Roads, 2 = returns major + minor roads, 3 = returns major, minor, and path.
 * @return {Object} classification of roads
 */
function types(classification) {
  var preserveType = {};
  switch (classification) {
    case 1:
      preserveType = _.extend(preserveType, majorRoads);
      break;
    case 2:
      preserveType = _.extend(preserveType, majorRoads);
      preserveType = _.extend(preserveType, minorRoads);
      break;
    default:
      preserveType = _.extend(preserveType, majorRoads);
      preserveType = _.extend(preserveType, minorRoads);
      preserveType = _.extend(preserveType, pathRoads);
  }
  return preserveType;
}

/**
 * Define what is the connection between type of roads
 * @param  {String} Starting road to evaluate
 * @param  {String} Ending road to evaluate
 * @return {String} evaluation fo road from: major -> minor -> path
 */
function fromToTypes(fromRoad, toRoad) {
  var fromToRoad;
  if (majorRoads[fromRoad] && majorRoads[toRoad]) {
    fromToRoad = 'major-major';
  } else if (
    (majorRoads[fromRoad] && minorRoads[toRoad]) ||
    (minorRoads[fromRoad] && majorRoads[toRoad])
  ) {
    fromToRoad = 'major-minor';
  } else if (
    (majorRoads[fromRoad] && pathRoads[toRoad]) ||
    (pathRoads[fromRoad] && majorRoads[toRoad])
  ) {
    fromToRoad = 'major-path';
  } else if (minorRoads[fromRoad] && minorRoads[toRoad]) {
    fromToRoad = 'minor-minor';
  } else if (
    (minorRoads[fromRoad] && pathRoads[toRoad]) ||
    (pathRoads[fromRoad] && minorRoads[toRoad])
  ) {
    fromToRoad = 'minor-path';
  } else if (pathRoads[fromRoad] && pathRoads[toRoad]) {
    fromToRoad = 'path-path';
  }
  return fromToRoad;
}