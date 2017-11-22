'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var osmLevyCountyTiles = path.join(
  __dirname,
  '/fixtures/osm.levycounty.mbtiles'
);
var tiger2015LevyCountyTiles = path.join(
  __dirname,
  '/fixtures/tiger2015.levycounty.mbtiles'
);
var optsMissingNameHighwaysUS = {
  bbox: [-83.0759, 29.0201, -82.429, 29.6141],
  zoom: zoom
};

test('missingNameHighwaysUS', function(t) {
  t.plan(40);
  logInterceptor();
  processors.missingNameHighwaysUS(
    optsMissingNameHighwaysUS,
    osmLevyCountyTiles,
    tiger2015LevyCountyTiles,
    function() {
      var logs = logInterceptor.end();
      for (var i = 0; i < 20; i++) {
        var geoJSON = JSON.parse(logs[i]);
        t.comment('Pass: ' + (i + 1));
        if (geoJSON.features.length > 0) {
          t.equal(
            geoJSON.features[0].properties._osmlint,
            'missingnamehighwayus',
            'Should be missingnamehighwayus'
          );
          t.equal(
            geoJSON.features[0].geometry.type,
            'LineString',
            'Should be  LineString'
          );
        }
      }
      t.end();
    }
  );
});
