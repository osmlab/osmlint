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
  'nodeEndingNearHighway': require('./validators/nodeEndingNearHighway'),
  'crossingWaterwaysHighways': require('./validators/crossingWaterwaysHighways'),
  'unconnectedHighways': require('./validators/unconnectedHighways'),
  'overlapHighways': require('./validators/overlapHighways')
};