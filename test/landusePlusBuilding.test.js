'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var landusePlusBuildingTiles = path.join(__dirname, '/fixtures/landusePlusBuilding.mbtiles');
var commonOpts = {
  bbox: [10.864019, 43.883047, 10.977316, 43.959214],
  zoom: zoom
};

test('landusePlusBuilding', function(t) {
  t.plan(2);
  logInterceptor();
  processors.landusePlusBuilding(commonOpts, landusePlusBuildingTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'landuseplusbuilding', 'Should be landuseplusbuilding');
        t.equal(geoJSON.features[0].geometry.type, 'Polygon', 'Should be  Polygon');
      }
    }
    t.end();
  });
});
