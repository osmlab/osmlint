"use strict";
var tileReduce = require("@mapbox/tile-reduce");
var path = require("path");
var postProcess = require("./postProcess");

var result = {
  type: "FeatureCollection",
  features: []
};

module.exports = function(opts, mbtilesPath, callback) {
  var outputStream = opts.postProcess ? postProcess() : process.stdout;
  tileReduce({
    bbox: opts.bbox,
    zoom: opts.zoom,
    map: path.join(__dirname, "/map.js"),
    sources: [
      {
        name: "osm",
        mbtiles: mbtilesPath,
        raw: false
      }
    ],
    output: outputStream
  })
    .on("reduce", function(res) {
      if (res.length > 0) {
        for (var r = 0; r < res.length; r++) {
          result.features.push(res[r]);
        }
      }
    })
    .on("end", function() {
      console.log(JSON.stringify(result));
      if (opts.postProcess) {
        callback &&
          outputStream.on("end", function() {
            setTimeout(callback, 0);
          });
      } else {
        callback && callback();
      }
    });
};
