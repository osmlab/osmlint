'use strict'
var tileReduce = require('tile-reduce');
var path = require('path');

module.exports = function (mbtilesPath, bbox, callback) {
    tileReduce({
        bbox: bbox,
        zoom: 12,
        map: path.join(__dirname, '/map.js'),
        sources: [{
            name: 'osm',
            mbtiles: mbtilesPath,
            raw: false
        }]
    })
    .on('reduce', function(result) {
    })
    .on('end', function() {
        callback && callback();
    });
};
