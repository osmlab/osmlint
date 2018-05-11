'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var impossibleOneWaysTiles = path.join(
  __dirname,
  '/fixtures/impossibleOneways.mbtiles'
);

test('impossibleOneWays', function(t) {
  t.plan(2);
  var impossibleOneWaysOpts = {
    bbox: [
      -81.75279225222766,
      26.52308811583282,
      -81.75209236331284,
      26.52601005448122
    ],
    zoom: zoom
  };
  logInterceptor();
  processors.impossibleOneWays(
    impossibleOneWaysOpts,
    impossibleOneWaysTiles,
    function() {
      var logs = logInterceptor.end();
      var geoJSON = JSON.parse(logs[0]);
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'impossibleoneways',
        'Should be impossibleoneways'
      );
      t.equal(
        geoJSON.features[0].geometry.type,
        'LineString',
        'Should be  LineString'
      );
      t.end();
    }
  );
});

test('impossibleOneWays -- postProcess', function(t) {
  t.plan(2);
  var impossibleOneWaysOpts = {
    bbox: [
      -81.75279225222766,
      26.52308811583282,
      -81.75209236331284,
      26.52601005448122
    ],
    zoom: zoom,
    postProcess: true
  };
  logInterceptor();
  processors.impossibleOneWays(
    impossibleOneWaysOpts,
    impossibleOneWaysTiles,
    function() {
      var logs = logInterceptor.end();
      var geoJSON = JSON.parse(logs[0]);
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'impossibleoneways',
        'Should be impossibleoneways'
      );
      t.equal(
        geoJSON.features[0].geometry.type,
        'Point',
        'Should be  Point'
      );
      t.end();
    }
  );
});
