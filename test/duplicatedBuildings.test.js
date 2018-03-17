'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var duplicatedBuildingsTiles = path.join(
  __dirname,
  '/fixtures/duplicatedBuildings.mbtiles'
);
var duplicatedbuildingsOpts = {
  bbox: [-71.373711, -12.840841, -71.355085, -12.828916],
  zoom: zoom
};
test('duplicatedBuildings', function(t) {
  t.plan(4);
  logInterceptor();
  processors.duplicatedBuildings(duplicatedbuildingsOpts, duplicatedBuildingsTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(
        geoJSON.features[0].properties._osmlint,
        'duplicatedbuildings',
        'Should be duplicatedbuildings'
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
