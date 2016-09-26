'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var osmLevyCountyTiles = path.join(__dirname, '/fixtures/osm.levycounty.mbtiles');
var tiger2015LevyCountyTiles = path.join(__dirname, '/fixtures/tiger2015.levycounty.mbtiles');
var optsMissingHighwaysUS = {
  bbox: [-83.0759, 29.0201, -82.4290, 29.6141],
  zoom: zoom
};

test('missingHighwaysUS', function(t) {
  t.plan(54);
  logInterceptor();
  processors.missingHighwaysUS(optsMissingHighwaysUS, osmLevyCountyTiles, tiger2015LevyCountyTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'missinghighwayus', 'Should be missinghighwayus');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
      }
    }
    t.end();
  });
});
