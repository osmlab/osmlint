'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var monacoTiles = path.join(__dirname, '/fixtures/monaco.mbtiles');
var monacoOpts = {
  bbox: [7.4068451, 43.723259, 7.4422073, 43.752901],
  zoom: zoom
};

test('filterMajorHighways', function(t) {
  t.plan(3);
  logInterceptor();
  processors.filterMajorHighways(monacoOpts, monacoTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
      t.equal(geoJSON.features[0].properties['@user'], 'Davio', 'Should be Davio');
      t.equal(geoJSON.features[0].properties._osmlint, 'filterMajorHighways', 'Should be filterMajorHighways');
    }
    t.end();
  });
});
