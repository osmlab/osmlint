'use strict';

var test = require('tap').test;
var path = require('path');
var fs = require('fs');
var processors = require('../index.js');

var bbox = [7.4068451, 43.723259, 7.4422073, 43.752901];
var zl = 15;
var mbtiles = path.join(__dirname, '/fixtures/monaco.mbtiles');
var opts = {
  bbox: bbox,
  zl: zl
}

test('bridgeOnNode', function(t) {
  processors.bridgeOnNode(opts, mbtiles, t.end);
});
test('filterDate', function(t) {
  processors.filterDate(opts, mbtiles, t.end);
});
test('filterUsers', function(t) {
  processors.filterUsers(opts, mbtiles, t.end);
});
test('missingLayerBridges', function(t) {
  processors.missingLayerBridges(opts, mbtiles, t.end);
});
test('untaggedWays', function(t) {
  processors.untaggedWays(opts, mbtiles, t.end);
});