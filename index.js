'use strict'

module.exports = {
    'bridgeOnNode': require('./processors/bridgeOnNode'),
    'filterDate': require('./processors/filterDate'),
    'filterUsers': require('./processors/filterUsers'),
    'missingLayerBridges': require('./processors/missingLayerBridges'),
    'untaggedWays': require('./processors/untaggedWays')
};
