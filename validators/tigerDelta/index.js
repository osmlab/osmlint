'use strict';
var tileReduce = require('tile-reduce');
var path = require('path');

module.exports = function(opts, qaTilesPath, tigerTilesPath, callback) {
  tileReduce({
      bbox: opts.bbox,
      zoom: opts.zoom,
      map: path.join(__dirname, '/map.js'),
      sources: [{
        name: 'osm',
        mbtiles: path.join(__dirname, qaTilesPath),
        raw: true
      }, {
        name: 'tiger',
        mbtiles: path.join(__dirname, tigerTilesPath),
        raw: true
      }]
    })
    .on('reduce', function() {})
    .on('end', function() {
      callback && callback();
    });
};