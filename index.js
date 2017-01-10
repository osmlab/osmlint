'use strict';

module.exports = {
  'bridgeOnNode': require('./validators/bridgeOnNode'),
  'filterDate': require('./validators/filterDate'),
  'filterUsers': require('./validators/filterUsers'),
  'missingLayerBridges': require('./validators/missingLayerBridges'),
  'untaggedWays': require('./validators/untaggedWays'),
  'missingHighwaysUS': require('./validators/missingHighwaysUS'),
  'selfIntersectingHighways': require('./validators/selfIntersectingHighways'),
  'unclosedWays': require('./validators/unclosedWays'),
  'crossingHighways': require('./validators/crossingHighways'),
  'unconnectedHighways': require('./validators/unconnectedHighways'),
  'crossingWaterwaysHighways': require('./validators/crossingWaterwaysHighways'),
  'islandsHighways': require('./validators/islandsHighways'),
  'overlapHighways': require('./validators/overlapHighways'),
  'impossibleAngle': require('./validators/impossibleAngle'),
  'tigerDelta': require('./validators/tigerDelta'),
  'fixmeTag': require('./validators/fixmeTag'),
  'strangeLayer': require('./validators/strangeLayer'),
  'impossibleOneWays': require('./validators/impossibleOneWays'),
  'turnLanes': require('./validators/turnLanes'),
  'missingOneways': require('./validators/missingOneways'),
  'mixedLayer': require('./validators/mixedLayer'),
  'deprecateHighways': require('./validators/deprecateHighways'),
  'crossinghighwaysbuildings': require('./validators/crossingHighwaysBuildings'),
  'buildingpartyes': require('./validators/buildingPartYes'),
  'misspelledTags': require('./validators/misspelledTags')
};