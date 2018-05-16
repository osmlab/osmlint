'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var mbtile = path.join(__dirname, '/fixtures/invalidmotorwayjunctions.mbtiles');

test('invalidMotorwayJunctions', function(t) {
  t.plan(2);
  var opts = {
    bbox: [-96.944218, 32.636195, -96.55695, 32.917926],
    zoom: zoom
  };
  logInterceptor();
  processors.invalidMotorwayJunctions(opts, mbtile, function() {
    var logs = logInterceptor.end();

    var geoJSON = JSON.parse(logs[0]);
    t.equal(geoJSON.features[0].geometry.type, 'Point', 'Should be Point');
    t.equal(
      geoJSON.features[0].properties._osmlint,
      'invalidmotorwayjunctions',
      'Should be invalidmotorwayjunctions'
    );
    t.end();
  });
});

test('invalidMotorwayJunctions -- postProcess', function(t) {
  t.plan(2);
  var opts = {
    bbox: [-96.944218, 32.636195, -96.55695, 32.917926],
    zoom: zoom,
    postProcess: true
  };
  logInterceptor();
  processors.invalidMotorwayJunctions(opts, mbtile, function() {
    var logs = logInterceptor.end();

    var geoJSON = JSON.parse(logs[0]);
    t.equal(geoJSON.features[0].geometry.type, 'Point', 'Should be Point');
    t.equal(
      geoJSON.features[0].properties._osmlint,
      'invalidmotorwayjunctions',
      'Should be invalidmotorwayjunctions'
    );
    t.end();
  });
});
