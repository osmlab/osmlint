'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var crossingHighwaysTiles = path.join(
  __dirname,
  '/fixtures/crossingHighways.mbtiles'
);

test('crossingHighways', function(t) {
  t.plan(2);
  var commonOpts = {
    bbox: [-0.0878906, -0.0878906, 0, 0],
    zoom: zoom
  };
  logInterceptor();
  processors.crossingHighways(commonOpts, crossingHighwaysTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(
          geoJSON.features[0].properties._osmlint,
          'crossinghighways',
          'Should be crossinghighways'
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


test('crossingHighways -- postProcess', function(t) {
  t.plan(2);
  var commonOpts = {
    bbox: [-0.0878906, -0.0878906, 0, 0],
    zoom: zoom,
    postProccess: true
  };
  logInterceptor();
  processors.crossingHighways(commonOpts, crossingHighwaysTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(
          geoJSON.features[0].properties._osmlint,
          'crossinghighways',
          'Should be crossinghighways'
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
