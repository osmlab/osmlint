'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var mixedLayerTiles = path.join(__dirname, '/fixtures/mixedlayer.mbtiles');
var mixedLayerOpts = {
  bbox: [-75.584564, -10.275904, -74.373322, -9.2581718],
  zoom: zoom
};

test('mixedLayer', function(t) {
  t.plan(2);
  logInterceptor();
  processors.mixedLayer(mixedLayerOpts, mixedLayerTiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs);
    t.equal(geoJSON.features[0].properties._osmlint, 'mixedlayer', 'Should be mixedlayer');
    t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
    t.end();
  });
});
