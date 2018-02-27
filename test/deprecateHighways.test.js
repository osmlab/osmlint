'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var deprecateHighwaysTiles = path.join(__dirname, '/fixtures/deprecateHighways.mbtiles');
var deprecateHighwaysOpts = {
  bbox: [-76.96077346801758, -6.103516703951734, -76.86927795410156, -6.033017816106606],
  zoom: zoom
};

test('deprecateHighways', function(t) {
  t.plan(2);
  logInterceptor();
  processors.deprecateHighways(deprecateHighwaysOpts, deprecateHighwaysTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(geoJSON.features[0].properties._osmlint, 'deprecateroads', 'Should be deprecateroads');
      t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
    }
    t.end();
  });
});
