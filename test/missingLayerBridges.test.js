'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var missingLayerBridgesTiles = path.join(__dirname, '/fixtures/missingLayerBridges.mbtiles');
var commonOpts = {
  bbox: [-0.0878906, -0.0878906, 0, 0],
  zoom: zoom
};

test('missingLayerBridges', function(t) {
  t.plan(2);
  logInterceptor();
  processors.missingLayerBridges(commonOpts, missingLayerBridgesTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'missinglayerbridges', 'Should be missinglayerbridges');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  Point');
      }
    }
    t.end();
  });
});
