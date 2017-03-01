'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var largenamesTiles = path.join(__dirname, '/fixtures/largeNames.mbtiles');
var largenamesOpts = {
  bbox: [-74.213719, -13.187492, -74.200802, -13.174559],
  zoom: zoom
};

test('largeNames', function(t) {
  t.plan(3);
  logInterceptor();
  processors.largeNames(largenamesOpts, largenamesTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);

      t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a isFeatureCollection');
      t.equal(geoJSON.features[0].properties._osmlint, 'largenames', 'largenames ok');
      t.equal(geoJSON.features[0].properties['@user'], 'Luis36995', 'Luis36995 ok');
    }
    t.end();
  });
});
