'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var nameMatchTiles = path.join(__dirname, '/fixtures/nameMatch.mbtiles');
var nameMatchOpts = {
  bbox: [13.382292, 47.820935, 13.457651, 47.867365],
  zoom: zoom
};
test('userNameMatch', function(t) {
  t.plan(2);
  logInterceptor();
  processors.userNameMatch(nameMatchOpts, nameMatchTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'usernamematch', 'Should be usernamematch');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'LineString be polygon');
      }
    }
    t.end();
  });
});
