'use strict';
var tileReduce = require('@mapbox/tile-reduce');
var path = require('path');
var meta = ;

module.exports = function(opts, mbtilesPath, callback) {
  tileReduce({
    bbox: opts.bbox,
    zoom: opts.zoom,
    map: path.join(__dirname, '/map.js'),
    sources: [
      {
        name: 'osm',
        mbtiles: mbtilesPath,
        raw: false
      }
    ]
  })
    .on('reduce', function(info) {
      Object.keys(meta).forEach(function(k) {
        meta[k] = meta[k] + info[k];
      });
    })
    .on('end', function() {
      console.error(JSON.stringify(meta));
      callback && callback(null, meta);
    });
};
