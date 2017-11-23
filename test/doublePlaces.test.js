'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var doublePlacesTiles = path.join(__dirname, '/fixtures/doublePlaces.mbtiles');
var doublePlacesOpts = {
  bbox: [23.607216, 61.44443, 23.931999, 61.56956],
  zoom: zoom
};

test('doublePlaces', function(t) {
  t.plan(3);
  logInterceptor();
  processors.doublePlaces(doublePlacesOpts, doublePlacesTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
      t.equal(geoJSON.features[0].geometry.type, 'MultiPoint', 'Should be MultiPoint');
      t.equal(geoJSON.features[0].properties._osmlint, 'doubleplaces', 'Should be doubleplaces');
    }
    t.end();
  });
});
