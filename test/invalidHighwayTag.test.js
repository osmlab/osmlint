'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var invalidhighwaytagTiles = path.join(__dirname, '/fixtures/invalidHighwayTag.mbtiles');
var invalidhighwaytagOpts = {
  bbox: [-77.171917, -11.897084, -77.090206, -11.816781],
  zoom: zoom
};

test('invalidHighwayTag', function(t) {
  t.plan(4);
  logInterceptor();
  processors.invalidHighwayTag(invalidhighwaytagOpts, invalidhighwaytagTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);

      t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a isFeatureCollection');
      t.equal(geoJSON.features[0].properties._osmlint, 'invalidhighwaytag', 'invalidhighwaytag ok');
      t.equal(geoJSON.features[0].properties['@type'], 'way', 'way ok');
      t.equal(geoJSON.features[0].properties['@user'], 'Ranger444', 'Ranger444 ok');
    }
    t.end();
  });
});
