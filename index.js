'use strict'

module.exports = {
    'bridgeOnNode': require('./processors/bridge-on-a-node'),
    'filterTime': require('./processors/filter-time'),
    'filterUsers': require('./processors/filter-users'),
    'missingLayerBridges': require('./processors/missing-layer-bridges'),
    'untaggedWays': require('./processors/untagged-ways')
};