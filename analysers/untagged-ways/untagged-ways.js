'use strict'
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var result = layer.features.filter(function(val) {
        if (_.size(val.properties) === 6 && (val.geometry.type === 'LineString')) {
            return true;
        }
    });

    if (result.length > 0) {
        writeData(JSON.stringify(result) + '\n');
    }

    done(null, null);
};