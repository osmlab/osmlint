  'use strict';
  var test = require('tape');
  var logInterceptor = require('log-interceptor');
  var path = require('path');
  var processors = require('../index.js');
  var zoom = 12;
  var missingRoundaboutTiles = path.join(__dirname, '/fixtures/missingroundabout.mbtiles');
  var missingRoundaboutOpts = {
    bbox: [-68.089142, -16.574503, -67.981339, -16.488271],
    zoom: zoom
  };
  test('missingRoundabout', function(t) {
    t.plan(1);
    logInterceptor();
    processors.missingRoundabout(missingRoundaboutOpts, missingRoundaboutTiles, function() {
      var logs = logInterceptor.end();
      var geoJSON = JSON.parse(logs);
      t.equal(geoJSON.features[0].properties._osmlint, 'missingroundabout', 'Should be missingroundabout');
      t.end();
    });
  });
