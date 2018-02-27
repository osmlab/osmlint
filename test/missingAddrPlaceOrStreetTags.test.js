'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var GJV = require('geojson-validation');
var processors = require('../index.js');

var zoom = 12;
var monacoTiles = path.join(__dirname, '/fixtures/missingaddrplaceorstreettags.mbtiles');
var monacoOpts = {
  bbox: [7.4068451, 43.723259, 7.4422073, 43.752901],
  zoom: zoom
};

test('missingaddrplaceorstreetTags', function(t) {
  t.plan(4);
  logInterceptor();
  processors.missingAddrPlaceOrStreetTags(monacoOpts, monacoTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a isFeatureCollection');
      t.equal(geoJSON.features[0].geometry.type, 'Point', ' Point ok');
      t.equal(geoJSON.features[1].geometry.type, 'LineString', ' LineString ok');
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'missingaddrplaceorstreettags',
        ' missingaddrplaceorstreettags ok'
      );
    }
    t.end();
  });
});
