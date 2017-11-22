'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var privatesourceTiles = path.join(
  __dirname,
  '/fixtures/privatesource.mbtiles'
);
var privatesourceOpts = {
  bbox: [-74.535992, -8.3894856, -74.525628, -8.3768972],
  zoom: zoom
};

test('privateSource', function(t) {
  t.plan(3);
  logInterceptor();
  processors.privatesource(privatesourceOpts, privatesourceTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);

      t.equal(
        GJV.isFeatureCollection(geoJSON),
        true,
        'Should be a isFeatureCollection'
      );
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'privatesource',
        'privatesource ok'
      );
      t.equal(
        geoJSON.features[0].properties['@user'],
        'Diego Sanguinetti',
        'Diego Sanguinetti ok'
      );
    }
    t.end();
  });
});
