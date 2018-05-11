'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var crossingHighwaysBuildingsTiles = path.join(
  __dirname,
  '/fixtures/crossingHighwaysBuildings.mbtiles'
);

test('crossingHighwaysBuildings', function(t) {
  t.plan(2);
  var crossingHighwaysBuildingsOpts = {
    bbox: [119.97517, 23.447656, 121.52149, 24.726407],
    zoom: zoom
  };
  logInterceptor();
  processors.crossinghighwaysbuildings(
    crossingHighwaysBuildingsOpts,
    crossingHighwaysBuildingsTiles,
    function() {
      var logs = logInterceptor.end();
      for (var i = 0; i < logs.length; i++) {
        var geoJSON = JSON.parse(logs[i]);
        t.comment('Pass: ' + (i + 1));
        if (geoJSON.features.length > 0) {
          t.equal(
            geoJSON.features[0].properties._osmlint,
            'crossinghighwaysbuildings',
            'Should be crossinghighwaysbuildings'
          );
          t.equal(
            geoJSON.features[0].geometry.type,
            'LineString',
            'Should be LineString'
          );
        }
      }
      t.end();
    }
  );
});


test('crossingHighwaysBuildings -- postProcess', function(t) {
  t.plan(2);
  var crossingHighwaysBuildingsOpts = {
    bbox: [119.97517, 23.447656, 121.52149, 24.726407],
    zoom: zoom,
    postProcess: true
  };
  logInterceptor();
  processors.crossinghighwaysbuildings(
    crossingHighwaysBuildingsOpts,
    crossingHighwaysBuildingsTiles,
    function() {
      var logs = logInterceptor.end();
      console.log(logs.length);
      for (var i = 0; i < logs.length; i++) {
        var geoJSON = JSON.parse(logs[i]);
        t.comment('Pass: ' + (i + 1));
        if (geoJSON.features.length > 0) {
          t.equal(
            geoJSON.features[0].properties._osmlint,
            'crossinghighwaysbuildings',
            'Should be crossinghighwaysbuildings'
          );
          t.equal(
            geoJSON.features[0].geometry.type,
            'MultiPoint',
            'Should be MultiPoint'
          );
        }
      }
      t.end();
    }
  );
});
