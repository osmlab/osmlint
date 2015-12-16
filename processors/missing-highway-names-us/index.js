'use strict'
var tileReduce = require('tile-reduce');
var path = require('path');

module.exports = function(qaTilesPath, tigerTilesPath, bbox, callback) {
  tileReduce({
      bbox: bbox,
      zoom: 12,
      map: path.join(__dirname, '/missing-highway-names-us.js'),
      sources: [{
        name: 'osm',
        mbtiles: qaTilesPath,
        raw: false
      }, {
        name: 'tiger',
        mbtiles: tigerTilesPath,
        raw: false
      }]
    })
    .on('reduce', function(result) {})
    .on('end', function() {
      callback && callback();
    });
};