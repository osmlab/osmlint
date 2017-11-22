'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var selfintersectingwaterwayTiles = path.join(
  __dirname,
  '/fixtures/selfintersectingwaterway.mbtiles'
);
var commonOpts = {
  bbox: [-74.261398, -13.217553, -74.154968, -13.112583],
  zoom: zoom
};

test('selfintersectingwaterway', function(t) {
  t.plan(4);
  logInterceptor();
  processors.selfIntersectingWaterway(
    commonOpts,
    selfintersectingwaterwayTiles,
    function() {
      var logs = logInterceptor.end();
      for (var i = 0; i < logs.length; i++) {
        var geoJSON = JSON.parse(logs[i]);
        t.comment('Pass: ' + (i + 1));
        if (geoJSON.features.length > 0) {
          t.equal(
            geoJSON.features[0].properties._osmlint,
            'selfintersectingwaterway',
            'Should be selfintersectingwaterway'
          );
          t.equal(
            geoJSON.features[0].geometry.type,
            'MultiPoint',
            'Should be  MultiPoint'
          );
        }
      }
      t.end();
    }
  );
});
