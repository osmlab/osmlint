'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var nameMatchTiles = path.join(
  __dirname,
  '/fixtures/wikiDataNoEnglishName.mbtiles'
);
var nameMatchOpts = {
  bbox: [-170.64995, 63.606683, -170.2462, 63.768605],
  zoom: zoom
};
test('wikiDataNoEnglishName', function(t) {
  t.plan(2);
  logInterceptor();
  processors.wikiDataNoEnglishName(nameMatchOpts, nameMatchTiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs);
    t.equal(
      geoJSON.features[0].properties._osmlint,
      'wikidatanoenglishname',
      'Should be wikidatanoenglishname'
    );
    t.equal(geoJSON.features[0].geometry.type, 'Point', 'Should be Point');
    t.end();
  });
});
