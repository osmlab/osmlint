'use strict'
var tileReduce = require('tile-reduce');
var path = require('path');

module.exports = function(bbox, zl, qaTilesPath, tigerTilesPath, callback) {
  tileReduce({
    bbox: bbox,
    zoom: zl,
    map: path.join(__dirname, '/map.js'),
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