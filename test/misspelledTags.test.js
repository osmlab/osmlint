'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var misspelledTagsTiles = path.join(__dirname, '/fixtures/misspelledTags.mbtiles');
var misspelledTagsOpts = {
  bbox: [12.154741, 45.859352, 12.190619, 45.902612],
  zoom: zoom
};
test('misspelledTags', function(t) {
  t.plan(2);
  logInterceptor();
  processors.misspelledTags(misspelledTagsOpts, misspelledTagsTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'misspelledtags', 'Should be misspelledTags');
        t.equal(geoJSON.features[0].geometry.type, 'Polygon', 'Should be polygon');
      }
    }
    t.end();
  });
});
