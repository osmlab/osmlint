'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var junctionstosplitTiles = path.join(__dirname, '/fixtures/junctionstosplit.mbtiles');
var opts = {
  bbox: [-122.11527, 37.668332, -122.043, 37.711257],
  zoom: zoom
};

test('junctionsToSplit', function(t) {
  t.plan(3);
  logInterceptor();
  processors.junctionsToSplit(opts, junctionstosplitTiles, function() {
    var logs = logInterceptor.end();
    var geojson = JSON.parse(logs[0]);
    t.equal(geojson.features[0].properties._osmlint, 'junctionstosplit', 'Should be junctionsToSplit');
    t.equal(geojson.features[0].geometry.type, 'LineString', 'Should be LineString');
    t.equal(geojson.features[2].geometry.type, 'Point', 'Should be Point');
    t.end();
  });
});
