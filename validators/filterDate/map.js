'use strict';
var time = require('time')(Date);
var today = (time.time() - 7 * 24 * 60 * 60);
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var changeset = layer.features.filter(function(obj) {
        return (obj.properties._timestamp >= today);
    });
    if (changeset.length > 0) {
        var fc = turf.featurecollection(changeset);
        writeData(JSON.stringify(fc) + '\n');
    }

    done(null, null);
};
