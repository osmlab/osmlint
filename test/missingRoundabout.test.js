'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var missingRoundaboutTiles = path.join(__dirname, '/fixtures/missingroundabout.mbtiles');
var missingRoundaboutOpts = {
  bbox: [-77.624245, -9.6283377, -77.375679, -9.4299267],
  zoom: zoom
};
test('missingRoundabout', function(t) {
  t.plan(2);
  logInterceptor();
  processors.missingRoundabout(missingRoundaboutOpts, missingRoundaboutTiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(geoJSON.features[0].properties._osmlint, 'missingroundabout', 'Should be missingroundabout');
    t.equal(geoJSON.features[0].properties.highway, 'primary', 'Should be primary');
    t.end();
  });
});
