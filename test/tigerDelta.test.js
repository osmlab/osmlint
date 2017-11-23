'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var osmLevyCountyTiles = path.join(__dirname, '/fixtures/osm.usa.mbtiles');
var tiger2015LevyCountyTiles = path.join(__dirname, '/fixtures/tiger2016.mbtiles');
var optsMissingHighwaysUS = {
  bbox: [-80.344734, 25.585492, -79.991798, 25.879921],
  zoom: zoom
};

test('tigerDelta', function(t) {
  t.plan(2);
  logInterceptor();
  processors.tigerDelta(optsMissingHighwaysUS, osmLevyCountyTiles, tiger2015LevyCountyTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'tigerdelta', 'Should be tigerdelta');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
      }
    }
    t.end();
  });
});
