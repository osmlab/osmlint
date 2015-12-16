'use strict'

module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var result = layer.features.filter(function(val) {
        return (val.properties.bridge && (val.geometry.type === 'Point'));
    });

    if (result.length > 0) {
        writeData(JSON.stringify(result) + '\n');
    }

    done(null, null);
};