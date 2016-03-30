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
      mbtiles: qaTilesPath,
      raw: true
    }, {
      name: 'tiger',
      mbtiles: tigerTilesPath,
      raw: true
    }]
  })
  .on('reduce', function() {})
  .on('end', function() {
    callback && callback();
  });
};
