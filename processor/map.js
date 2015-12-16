'use strict';
var time = require('time')(Date);
var today = (time.time() - 7 * 24 * 60 * 60);

module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var changeset = layer.features.filter(function(obj) {
        return (obj.properties._timestamp >= today);
    });
    if (changeset.length > 0) {
        writeData(JSON.stringify(changeset) + '\n');
    }

    done(null, null);
};
