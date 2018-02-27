'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var crossingHighwaysTiles = path.join(__dirname, '/fixtures/crossingBuildings.mbtiles');
var commonOpts = {
  bbox: [-74.261398, -13.217553, -74.154968, -13.112583],
  zoom: zoom
};
test('crossingBuildings', function(t) {
  t.plan(2);
  logInterceptor();
  processors.crossingBuildings(commonOpts, crossingHighwaysTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[1].properties._osmlint, 'crossingbuildings', 'Should be crossingbuildings');
        t.equal(geoJSON.features[0].geometry.type, 'Polygon', 'Should be Polygon');
      }
    }
    t.end();
  });
});
