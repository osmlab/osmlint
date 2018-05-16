'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var strangelayerTiles = path.join(__dirname, '/fixtures/strangelayer.mbtiles');

test('strangeLayer', function(t) {
  t.plan(2);
  var optsStrangeLayer = {
    bbox: [127.03491, 37.303279, 127.16228, 37.418163],
    zoom: zoom
  };
  logInterceptor();
  processors.strangeLayer(optsStrangeLayer, strangelayerTiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs);
    t.equal(
      geoJSON.features[0].properties._osmlint,
      'strangelayer',
      'Should be strangelayer'
    );
    t.equal(
      geoJSON.features[0].geometry.type,
      'LineString',
      'Should be  LineString'
    );
  });
});

test('strangeLayer -- postProcess', function(t) {
  t.plan(2);
  var optsStrangeLayer = {
    bbox: [127.03491, 37.303279, 127.16228, 37.418163],
    zoom: zoom,
    postProcess: true
  };
  logInterceptor();
  processors.strangeLayer(optsStrangeLayer, strangelayerTiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs);
    t.equal(
      geoJSON.features[0].properties._osmlint,
      'strangelayer',
      'Should be strangelayer'
    );
    t.equal(
      geoJSON.features[0].geometry.type,
      'LineString',
      'Should be  LineString'
    );
  });
});
