'use strict';

var test = require('tap').test;
var path = require('path');
var fs = require('fs');
var processors = require('../index.js');
var bbox = [7.4003220,43.721274,7.4562836,43.754017];
var zl = 15;

var bbox = [7.4068451, 43.723259, 7.4422073, 43.752901];
var mbtiles = path.join(__dirname, '/data/monaco.mbtiles');

test('bridgeOnNode', function(t) {
    processors.bridgeOnNode(bbox, zl, __dirname + '/fixtures/monaco.mbtiles', t.end);
});
test('filterDate', function(t) {
    processors.filterDate(bbox, zl, __dirname + '/fixtures/monaco.mbtiles', t.end);
});
test('filterUsers', function(t) {
    processors.filterUsers(bbox, zl, __dirname + '/fixtures/monaco.mbtiles', t.end);
});
test('missingLayerBridges', function(t) {
    processors.missingLayerBridges(bbox, zl, __dirname + '/fixtures/monaco.mbtiles', t.end);
});
test('untaggedWays', function(t) {
    processors.untaggedWays(bbox, zl, __dirname + '/fixtures/monaco.mbtiles', t.end);
});
