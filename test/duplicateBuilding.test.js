'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var duplicateBuildingsTiles = path.join(
  __dirname,
  '/fixtures/duplicateBuilding.mbtiles'
);
var duplicatebuildingsOpts = {
  bbox: [-71.373711, -12.840841, -71.355085, -12.828916],
  zoom: zoom
};
test('duplicateBuildings', function(t) {
  t.plan(4);
  logInterceptor();
  processors.duplicateBuildings(duplicatebuildingsOpts, duplicateBuildingsTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'duplicatebuildings',
        'Should be duplicatebuildings'
      );
      t.equal(
        geoJSON.features[0].geometry.type,
        'Polygon',
        'Should be Polygon'
      );
      t.equal(
        geoJSON.features[0].properties['building'],
        'yes',
        'Should be yes'
      );
      t.equal(
        geoJSON.features[0].properties['@user'],
        'pgiraud',
        'Should be pgiraud'
      );
    }
    t.end();
  });
});
