'use strict';
var test = require('tape').test;
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var doubledPlacesTiles = path.join(__dirname, '/fixtures/doubledPlaces.mbtiles');
var doubledPlacesOpts = {
  bbox: [11.700697, 42.208939, 11.811247, 42.276801],
  zoom: zoom
};

test('doubledPlaces', function(t) {
  t.plan(4);
  logInterceptor();
  processors.doubledPlaces(doubledPlacesOpts, doubledPlacesTiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs);
    t.equal(geoJSON.features[0].properties._osmlint, 'doubledplaces', 'Should be doubledPlaces');
    t.equal(geoJSON.features[0].geometry.type, 'Point', 'Should be  Point');
    t.equal(geoJSON.features[1].properties._osmlint, 'doubledplaces', 'Should be doubledPlaces');
    t.equal(geoJSON.features[1].geometry.type, 'Polygon', 'Should be  Polygon');
    t.end();
  });
});
