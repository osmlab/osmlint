'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');

var zoom = 12;
var peruTiles = path.join(
  __dirname,
  '/fixtures/groupedSchools.mbtiles'
);
var peruOpts = {
  bbox: [-74.252815, -13.187972, -74.188271, -13.139164],
  zoom: zoom
};

test('groupedSchools', function(t) {
  t.plan(3);
  logInterceptor();
  processors.groupedSchools(peruOpts, peruTiles, function() {
    var logs = logInterceptor.end();

    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);

      t.equal(
        geoJSON.features[0].properties.source,
        'minedu.gob.pe',
        'Should be minedu.gob.pe'
      );
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'groupedpoi',
        'Should be groupedpoi'
      );
      t.equal(
        geoJSON.features[0].geometry.type,
        'MultiPoint',
        'Should be MultiPoint'
      );
    }
    t.end();
  });
});
