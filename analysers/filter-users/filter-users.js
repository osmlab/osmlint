'use strict'
var users = require('./users.json');

module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var result = layer.features.filter(function(val) {
        return (users[val.properties._user]);

    });

    if (result.length > 0) {
        writeData(JSON.stringify(result) + '\n');
    }

    done(null, null);
};