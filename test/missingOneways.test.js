'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var missingOnewaysTiles = path.join(
  __dirname,
  '/fixtures/missingOneways.mbtiles'
);

test('missingOneways', function(t) {
  t.plan(4);
  var missingOnewaysOpts = {
    bbox: [-83.136978, 39.954228, -82.86232, 40.074656],
    zoom: zoom
  };
  logInterceptor();
  processors.missingOneways(
    missingOnewaysOpts,
    missingOnewaysTiles,
    function() {
      var logs = logInterceptor.end();
      var geoJSON = JSON.parse(logs);
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'missingoneways',
        'Should be missingoneways'
      );
      t.equal(
        geoJSON.features[0].geometry.type,
        'LineString',
        'Should be  LineString'
      );
      t.equal(
        geoJSON.features[1].properties._osmlint,
        'missingoneways',
        'Should be missingoneways'
      );
      t.equal(
        geoJSON.features[1].geometry.type,
        'LineString',
        'Should be  LineString'
      );
      t.end();
    }
  );
});

test('missingOneways -- postProcess', function(t) {
  t.plan(4);
  var missingOnewaysOpts = {
    bbox: [-83.136978, 39.954228, -82.86232, 40.074656],
    zoom: zoom,
    postProcess: true
  };
  logInterceptor();
  processors.missingOneways(
    missingOnewaysOpts,
    missingOnewaysTiles,
    function() {
      var logs = logInterceptor.end();
      var geoJSON = JSON.parse(logs);
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'missingoneways',
        'Should be missingoneways'
      );
      t.equal(
        geoJSON.features[0].geometry.type,
        'LineString',
        'Should be  LineString'
      );
      t.equal(
        geoJSON.features[1].properties._osmlint,
        'missingoneways',
        'Should be missingoneways'
      );
      t.equal(
        geoJSON.features[1].geometry.type,
        'LineString',
        'Should be  LineString'
      );
      t.end();
    }
  );
});
