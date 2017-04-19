'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var doubleCitiesTiles = path.join(__dirname, '/fixtures/doubleCities.mbtiles');
var doubleCitiesOpts = {
  bbox: [23.607216, 61.444430, 23.931999, 61.569560],
  zoom: zoom
};

test('doubleCities', function(t) {
  t.plan(3);
  logInterceptor();
  processors.doubleCities(doubleCitiesOpts, doubleCitiesTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
      t.equal(geoJSON.features[0].geometry.type, 'MultiPoint', 'Should be MultiPoint');
      t.equal(geoJSON.features[0].properties._osmlint, 'doublecities', 'Should be doublecities');
    }
    t.end();
  });
});
