'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var mbtile = path.join(__dirname, '/fixtures/missingdestination.mbtiles');
var opts = {
  bbox: [-122.6663, 37.098181, -121.39189, 37.969373],
  zoom: zoom
};

test('missingDestination', function(t) {
  t.plan(2);
  logInterceptor();
  processors.missingDestination(opts, mbtile, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be LineString');
    t.equal(geoJSON.features[0].properties._osmlint, 'missingdestination', 'Should be missingdestination');
    t.end();
  });
});
