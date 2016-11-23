'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');

var zoom = 12;
var monacoTiles = path.join(__dirname, '/fixtures/naturalvsleisure.mbtiles');
var monacoOpts = {
  bbox: [103.80501, 1.2322620, 104.01855, 1.3431272],
  zoom: zoom
};

test('naturalVsLeisure', function(t) {
  t.plan(2);
  logInterceptor();

  processors.naturalvsleisure(monacoOpts, monacoTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(geoJSON.features[0].properties._osmlint, 'naturalvsleisure', ' naturalvsleisure ok');
      t.equal(geoJSON.features[0].geometry.type, 'Polygon', ' Polygon ok');
    }
    t.end();
  });
});
