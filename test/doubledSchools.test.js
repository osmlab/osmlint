'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var peruTiles = path.join(
  __dirname,
  '/fixtures/doubledSchools.mbtiles'
);
var peruOpts = {
  bbox: [-74.240584, -13.160101, -74.219556, -13.132185],
  zoom: zoom
};

test('doubledSchools', function(t) {
  t.plan(3);
  logInterceptor();
  processors.doubledSchools(peruOpts, peruTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(
        GJV.isFeatureCollection(geoJSON),
        true,
        'Should be a FeatureCollection'
      );
      t.equal(
        geoJSON.features[0].properties.source,
        'minedu.gob.pe',
        'Should be minedu.gob.pe'
      );
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'doubledpoi',
        'Should be doubled Schools'
      );
    }
    t.end();
  });
});
