'use strict';
var tileReduce = require('@mapbox/tile-reduce');
var path = require('path');
var postProcess = require('./postProcess');

module.exports = function(opts, mbtilesPath, callback) {
  var outputStream =  opts.postProcess ? postProcess() : process.stdout;

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
    ],
    output: outputStream
  })
  .on('reduce', function() {})
  .on('end', function() {
    if (opts.postProcess) {
      callback && outputStream.on('end', function() {
        setTimeout(callback, 0);
      });
    } else {
      callback && callback();
    }
  });
};
