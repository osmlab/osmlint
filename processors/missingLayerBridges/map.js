'use strict'

module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var result = layer.features.filter(function(val) {
        if (val.properties.bridge && (val.geometry.type === 'LineString')) {
            if (!val.properties.layer) {
                return true;
            }
        }
    });

    if (result.length > 0) {
        writeData(JSON.stringify(result) + '\n');
    }

    done(null, null);
};

