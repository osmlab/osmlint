'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var osmLevyCountyTiles = path.join(__dirname, '/fixtures/osm.levycounty.mbtiles');
var optsMissingHighwaysUS = {
  bbox: [-83.0759, 29.0201, -82.429, 29.6141],
  zoom: zoom
};

test('untaggedWays', function(t) {
  t.plan(2);
  logInterceptor();
  processors.untaggedWays(optsMissingHighwaysUS, osmLevyCountyTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'untaggedway', 'Should be untaggedway');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
        break;
      }
    }
    t.end();
  });
});
