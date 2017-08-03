'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var mbtile = path.join(__dirname, '/fixtures/invalidmotorwayjunctions.mbtiles');
var turnLaneOpts = {
  bbox: [-122.66630, 37.098181, -121.39189, 37.969373],
  zoom: zoom
};

test('invalidMotorwayJunctions', function(t) {
  t.plan(2);
  logInterceptor();
  processors.invalidMotorwayJunctions(turnLaneOpts, mbtile, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be LineString');
    t.equal(geoJSON.features[0].properties._osmlint, 'invalidmotorwayjunctions', 'Should be invalidmotorwayjunctions');
    t.end();
  });
});
