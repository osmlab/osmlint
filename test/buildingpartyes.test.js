'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');

var zoom = 12;
var buildingpartyesTiles = path.join(
  __dirname,
  '/fixtures/buildingpartyes.mbtiles'
);
var buildingpartyesOpts = {
  bbox: [-74.245648, -13.207401, -74.182992, -13.132018],
  zoom: zoom
};

test('buildingPartYes', function(t) {
  t.plan(2);
  logInterceptor();
  processors.buildingpartyes(
    buildingpartyesOpts,
    buildingpartyesTiles,
    function() {
      var logs = logInterceptor.end();
      for (var i = 0; i < 1; i++) {
        var geoJSON = JSON.parse(logs[i]);
        t.equal(
          geoJSON.features[0].properties._osmlint,
          'buildingpartyes',
          'buildingpartyes ok'
        );
        t.equal(geoJSON.features[0].geometry.type, 'Polygon', 'Polygon ok');
      }
      t.end();
    }
  );
});
