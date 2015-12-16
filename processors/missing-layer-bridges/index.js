'use strict'
var tileReduce = require('tile-reduce');
var path = require('path');

module.exports = function(mbtilesPath, bbox, callback) {
    tileReduce({
        bbox: area,
        zoom: 12,
        map: path.join(__dirname, '/missing-layer-bridges.js'),
        sources: [{
            name: 'osm',
            mbtiles: argv.mbtiles,
            raw: false
        }]
    })
    .on('reduce', function(result) {
    })
    .on('end', function() {
        callback && callback();
    });
};
