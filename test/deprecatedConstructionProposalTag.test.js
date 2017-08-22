'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');

var zoom = 12;
var tiles = path.join(__dirname, '/fixtures/deprecatedConstructionProposalTag.mbtiles');
var opts = {
  bbox: [-117.15065, 33.530663, -117.07684, 33.575440],
  zoom: zoom
};

test('Deprecated construction proposal tag', function(t) {
  t.plan(2);
  logInterceptor();
  processors.deprecatedConstructionProposalTag(opts, tiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(geoJSON.features[0].properties._osmlint, 'deprecatedconstructionproposaltag', 'Should be deprecatedconstructionproposaltag');
      t.equal(geoJSON.features[0].properties['@id'], 113104928, 'Should be 113104928');
    }
    t.end();
  });
});
