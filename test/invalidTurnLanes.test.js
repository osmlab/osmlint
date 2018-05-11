'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var turnLanesTiles = path.join(__dirname, '/fixtures/invalidTurnLanes.mbtiles');

test('invalidTurnLanes', function(t) {
  t.plan(2);
  var turnLaneOpts = {
    bbox: [-97.418518, 34.672182, -97.128754, 34.869595],
    zoom: zoom
  };
  logInterceptor();
  processors.invalidTurnLanes(turnLaneOpts, turnLanesTiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(
      geoJSON.features[0].properties._osmlint,
      'invalidturnlanes',
      'Should be turnlanes'
    );
    t.equal(
      geoJSON.features[0].geometry.type,
      'LineString',
      'Should be  LineString'
    );
    t.end();
  });
});

test('invalidTurnLanes -- postProcess', function(t) {
  t.plan(2);
  var turnLaneOpts = {
    bbox: [-97.418518, 34.672182, -97.128754, 34.869595],
    zoom: zoom,
    postProcess: true
  };
  logInterceptor();
  processors.invalidTurnLanes(turnLaneOpts, turnLanesTiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(
      geoJSON.features[0].properties._osmlint,
      'invalidturnlanes',
      'Should be turnlanes'
    );
    t.equal(
      geoJSON.features[0].geometry.type,
      'LineString',
      'Should be  LineString'
    );
    t.end();
  });
});
