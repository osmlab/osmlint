'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var monacoTiles = path.join(__dirname, '/fixtures/unconnectedTrafficLights.mbtiles');
var monacoOpts = {
  bbox: [-81.332817, -18.624286, -68.940239, -0.15260678],
  zoom: zoom
};

test('UnconnectedtrafficLights', function(t) {
  t.plan(4);
  logInterceptor();
  processors.unconnectedTrafficLights(monacoOpts, monacoTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
      t.equal(geoJSON.features[0].properties['highway'], 'traffic_signals', 'Should be traffic_signals');
      t.equal(geoJSON.features[0].properties['@type'], 'node', 'Should be node');
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'unconnectedtrafficlights',
        'Should be unconnectedtrafficlights'
      );
    }
    t.end();
  });
});
