'use strict'

module.exports = {
  'bridgeOnNode': require('./validators/bridgeOnNode'),
  'filterDate': require('./validators/filterDate'),
  'filterUsers': require('./validators/filterUsers'),
  'missingLayerBridges': require('./validators/missingLayerBridges'),
  'untaggedWays': require('./validators/untaggedWays'),
  'missingHighwaysUS': require('./validators/missingHighwaysUS')
};
