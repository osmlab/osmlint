'use strict';
var turf = require('turf');
var cover = require('tile-cover');

module.exports = function(data, tile, writeData, done) {
  var digiroadLayer = data.fonecta.fonecta;
  var diffLayer = data.osm.osm;
  var osmlint = 'digiroad';
  var resultDiffLayer = 0;
  var resultdDigiLayer = 0;

  var limits = {
    min_zoom: 12,
    max_zoom: 12
  };
  var bbox = turf.bbox(digiroadLayer);
  var bboxPolygon = turf.bboxPolygon(bbox);
  var centroidPt = turf.centroid(bboxPolygon);
  var tilePoly = cover.geojson(centroidPt.geometry, limits);
  var newtile = cover.tiles(centroidPt.geometry, limits);
  // digiroad
  for (var i = 0; i < diffLayer.features.length; i++) {
    var val = diffLayer.features[i];
    if (val.geometry.type == 'LineString') {
      var dist = turf.lineDistance(val, 'kilometers');
      resultDiffLayer = resultDiffLayer + dist;
    }
  }
  //digiroad layer
  for (var i = 0; i < digiroadLayer.features.length; i++) {
    var val = digiroadLayer.features[i];
    if (val.geometry.type == 'LineString') {
      var dist = turf.lineDistance(val, 'kilometers');
      resultdDigiLayer = resultdDigiLayer + dist;
    }
  }
  tilePoly.features[0].properties.id = newtile.join().replace(/,/g, '');
  tilePoly.features[0].properties.diffNum = diffLayer.features.length;
  tilePoly.features[0].properties.digiNum = digiroadLayer.features.length;
  tilePoly.features[0].properties.diffKil = Number(resultDiffLayer.toFixed(2));
  tilePoly.features[0].properties.digiKil = Number(resultdDigiLayer.toFixed(2));
  tilePoly.features[0].properties.diffPercentage = Number((resultDiffLayer * 100 / resultdDigiLayer).toFixed(2));
  writeData(JSON.stringify(tilePoly) + '\n');
  done(null, null);
};