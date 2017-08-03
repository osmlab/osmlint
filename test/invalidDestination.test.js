'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var mbtile = path.join(__dirname, '/fixtures/invaliddestination.mbtiles');
var turnLaneOpts = {
  bbox: [-122.66630, 37.098181, -121.39189, 37.969373],
  zoom: zoom
};

test('invalidDestination', function(t) {
  t.plan(2);
  logInterceptor();
  processors.invalidDestination(turnLaneOpts, mbtile, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    console.log(JSON.stringify(geoJSON));
    t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be LineString');
    t.equal(geoJSON.features[0].properties._osmlint, 'invaliddestination', 'Should be invaliddestination');
    t.end();
  });
});
