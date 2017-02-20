'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var buildinghigher1kmTiles = path.join(__dirname, '/fixtures/buildinghigher1km.mbtiles');
var commonOpts = {
  bbox: [103.98062, 1.3059307, 104.04345, 1.3774939],
  zoom: zoom
};

test('buildinghigher1km', function(t) {
  t.plan(4);
  logInterceptor();
  processors.buildinghigher1km(commonOpts, buildinghigher1kmTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < 1; i++) {
      var geoJSON = JSON.parse(logs[i]);
      //console.log(geoJSON.features[0].properties);
      //console.log(JSON.stringify(geoJSON));// IMPRIME EL FEATURE
      /*t.equal(geoJSON.features[0].properties['@user'], 'yourealwaysbe', 'Should be yourealwaysbe');
      t.equal(geoJSON.features[0].properties['@version'], 19, 'Should be 19');
      t.equal(geoJSON.features[0].properties.building, 'yes', 'Should be yes');
      t.equal(geoJSON.features[0].properties._osmlint, 'buildinghigher1km', 'Should be buildinghigher1km');*/
      t.equal(geoJSON[0].properties['@user'], 'yourealwaysbe', 'Should be yourealwaysbe');
      t.equal(geoJSON[0].properties['@version'], 19, 'Should be 19');
      t.equal(geoJSON[0].properties.building, 'yes', 'Should be yes');
      t.equal(geoJSON[0].properties._osmlint, 'buildinghigher1km', 'Should be buildinghigher1km');
      //console.log(geoJSON[0]);
      //console.log(geoJSON);
    }
    t.end();
  });
});
