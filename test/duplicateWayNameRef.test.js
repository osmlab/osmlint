'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var duplicatewaynamerefTiles = path.join(
  __dirname,
  '/fixtures/duplicatewaynameref.mbtiles'
);

test('duplicatewaynameref', function(t) {
  t.plan(6);
  var duplicatewaynamerefOpts = {
    bbox: [-118.58282, 35.739546, -118.26834, 35.969393],
    zoom: zoom
  };
  logInterceptor();
  processors.duplicateWayNameRef(
    duplicatewaynamerefOpts,
    duplicatewaynamerefTiles,
    function() {
      var logs = logInterceptor.end();
      for (var i = 0; i < logs.length; i++) {
        var geoJSON = JSON.parse(logs[i]);
        if (logs[i].length > 0) {
          t.equal(
            geoJSON.features[0].properties._osmlint,
            'duplicatewaynameref',
            'Should be duplicatewaynameref'
          );
        }
      }
      t.end();
    }
  );
});

test('duplicatewaynameref -- postProcess', function(t) {
  t.plan(1);
  var duplicatewaynamerefOpts = {
    bbox: [-118.58282, 35.739546, -118.26834, 35.969393],
    zoom: zoom,
    postProcess: true
  };
  logInterceptor();
  processors.duplicateWayNameRef(
    duplicatewaynamerefOpts,
    duplicatewaynamerefTiles,
    function() {
      var logs = logInterceptor.end();
      for (var i = 0; i < logs.length; i++) {
        var geoJSON = JSON.parse(logs[i]);
        if (logs[i].length > 0) {
          t.equal(
            geoJSON.features[0].properties._osmlint,
            'duplicatewaynameref',
            'Should be duplicatewaynameref'
          );
        }
      }
      t.end();
    }
  );
});
