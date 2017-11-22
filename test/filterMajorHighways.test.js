'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var monacoTiles = path.join(__dirname, '/fixtures/filtermajorhighways.mbtiles');
var monacoOpts = {
  bbox: [7.4068451, 43.723259, 7.4422073, 43.752901],
  zoom: zoom
};

test('filterMajorHighways', function(t) {
  t.plan(5);
  logInterceptor();
  processors.filterMajorHighways(monacoOpts, monacoTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(
        GJV.isFeatureCollection(geoJSON),
        true,
        'Should be a FeatureCollection'
      );
      t.equal(
        geoJSON.features[0].properties['@user'],
        'Dmitry2013',
        'Should be Dmitry2013'
      );
      t.equal(geoJSON.features[0].properties['@version'], 6, 'Should be 6');
      t.equal(geoJSON.features[0].properties.oneway, 'yes', 'Should be yes');
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'filtermajorhighways',
        'Should be filterMajorHighways'
      );
    }
    t.end();
  });
});
