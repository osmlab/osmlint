'use strict'
var tileReduce = require('tile-reduce');
var path = require('path');
var fs = require('fs');

module.exports = function(opts, mbtilesPath, callback) {
  tileReduce({
    bbox: opts.bbox,
    zoom: opts.zoom,
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
