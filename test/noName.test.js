'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var noName = path.join(__dirname, '/fixtures/noName.mbtiles');
var commonOpts = {
  bbox: [-82.195759, 25.611964, -78.526325, 29.238627],
  zoom: 12
};
test('noName', function(t) {
  t.plan(3);
  logInterceptor();
  processors.noName(commonOpts, noName, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(geoJSON.features[0].properties['@id'], 11301314, 'Should be 11301314');
    t.equal(geoJSON.features[0].properties._osmlint, 'noname', 'Should be noName');
    t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be LineString');
    t.end();
  });
});
