'use strict';
var turf = require('turf');
var cover = require('tile-cover');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'digiroad';
  var result = 0;
  var limits = {
    min_zoom: 12,
    max_zoom: 12
  };
  var bbox = turf.bbox(layer);
  var bboxPolygon = turf.bboxPolygon(bbox);
  var centroidPt = turf.centroid(bboxPolygon);
  var tilePoly = cover.geojson(centroidPt.geometry, limits);
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.geometry.type == 'LineString') {
      var dist = turf.lineDistance(val, 'kilometers');
      result = result + dist;
    }
  }
  tilePoly.features[0].properties.missroads = result
  writeData(JSON.stringify(tilePoly) + '\n');
  done(null, null);
};
