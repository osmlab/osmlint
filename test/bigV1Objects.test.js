'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');

var zoom = 12;
var bigv1objectsv1Tiles = path.join(
  __dirname,
  '/fixtures/bigv1objects.mbtiles'
);
var bigv1objectsOpts = {
  bbox: [-70.950394, -15.532753, -70.837784, -15.315314],
  zoom: zoom
};

test('bigV1Objects', function(t) {
  t.plan(1);
  logInterceptor();
  processors.bigV1Objects(bigv1objectsOpts, bigv1objectsv1Tiles, function() {
    var logs = logInterceptor.end();
    t.equal(logs.length, 0, 'No features returned');
    t.end();
  });
});
