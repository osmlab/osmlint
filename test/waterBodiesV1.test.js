'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var waterbodiesv1Tiles = path.join(__dirname, '/fixtures/waterbodiesv1.mbtiles');
var waterbodiesv1Opts = {
  bbox: [-70.950394, -15.532753, -70.837784, -15.315314],
  zoom: zoom
};

test('waterBodiesV1', function(t) {
  t.plan(4);
  logInterceptor();
  processors.waterBodiesV1(waterbodiesv1Opts, waterbodiesv1Tiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);

      t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a isFeatureCollection');
      t.equal(geoJSON.features[0].properties._osmlint, 'waterbodiesv1', 'waterbodiesv1 ok');
      t.equal(geoJSON.features[0].properties['@timestamp'], 1468860418, '1468860418 ok');
      t.equal(geoJSON.features[0].geometry.type, 'Polygon', 'Polygon ok');
    }
    t.end();
  });
});
