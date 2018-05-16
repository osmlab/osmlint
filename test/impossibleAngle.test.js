'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var impossibleAngleTiles = path.join(
  __dirname,
  '/fixtures/impossibleAngle.mbtiles'
);

test('impossibleAngle', function(t) {
  t.plan(2);
  var commonOpts = {
    bbox: [-0.0878906, -0.0878906, 0, 0],
    zoom: zoom
  };
  logInterceptor();
  processors.impossibleAngle(commonOpts, impossibleAngleTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(
          geoJSON.features[0].properties._osmlint,
          'impossibleangle',
          'Should be impossibleangle'
        );
        t.equal(
          geoJSON.features[0].geometry.type,
          'LineString',
          'Should be LineString'
        );
      }
    }
    t.end();
  });
});

test('impossibleAngle -- postProcess', function(t) {
  t.plan(2);
  var commonOpts = {
    bbox: [-0.0878906, -0.0878906, 0, 0],
    zoom: zoom,
    postProcess: true
  };
  logInterceptor();
  processors.impossibleAngle(commonOpts, impossibleAngleTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(
          geoJSON.features[0].properties._osmlint,
          'impossibleangle',
          'Should be impossibleangle'
        );
        t.equal(
          geoJSON.features[0].geometry.type,
          'Point',
          'Should be Point'
        );
      }
    }
    t.end();
  });
});
