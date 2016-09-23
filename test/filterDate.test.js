'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');

var zoom = 12;
var monacoTiles = path.join(__dirname, '/fixtures/monaco.mbtiles');
var monacoOpts = {
  bbox: [7.4068451, 43.723259, 7.4422073, 43.752901],
  zoom: zoom
};

test('filterDate', function(t) {
  t.plan(1);
  logInterceptor();
  processors.filterDate(monacoOpts, monacoTiles, function() {
    var logs = logInterceptor.end();
    t.equal(logs.length, 0, 'No features returned');
    t.end();
  });
});
