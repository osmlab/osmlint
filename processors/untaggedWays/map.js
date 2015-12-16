'use strict'
var _ = require('underscore');
module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var result = layer.features.filter(function(val) {
        return _.allKeys(val.properties).filter(function(k) {
            return k.charAt(0) != '_';
        }).length == 0;
    });
    if (result.length > 0) {
        writeData(JSON.stringify(result) + '\n');
    }
    done(null, null);
};