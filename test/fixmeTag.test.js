'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var fixMeTagTiles = path.join(__dirname, '/fixtures/fixMeTag.mbtiles');
var commonOpts = {
  bbox: [-0.0878906, -0.0878906, 0, 0],
  zoom: zoom
};

test('fixmeTag', function(t) {
  t.plan(2);
  logInterceptor();
  processors.fixmeTag(commonOpts, fixMeTagTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      for (var j = 0; j < geoJSON.features.length; j++) {
        t.comment('Pass: ' + (i + 1));
        t.equal(geoJSON.features[j].properties._osmlint, 'fixmetag', 'Should be fixmetag');
      }
    }
    t.end();
  });
});
