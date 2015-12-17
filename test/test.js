'use strict';

var test = require('tap').test;
var path = require('path');
var fs = require('fs');
var processors = require('../index.js');

var bbox = [7.4068451, 43.723259, 7.4422073, 43.752901];
var mbtiles = path.join(__dirname, '/data/monaco.mbtiles');

test('bridgeOnNode', function(t) {
    processors.bridgeOnNode(__dirname + '/fixtures/monaco.mbtiles', bbox, t.end);
});
test('filterDate', function(t) {
    processors.filterDate(__dirname + '/fixtures/monaco.mbtiles', bbox, t.end);
});
test('filterUsers', function(t) {
    processors.filterUsers(__dirname + '/fixtures/monaco.mbtiles', bbox, t.end);
});
test('missingLayerBridges', function(t) {
    processors.missingLayerBridges(__dirname + '/fixtures/monaco.mbtiles', bbox, t.end);
});
test('untaggedWays', function(t) {
    processors.untaggedWays(__dirname + '/fixtures/monaco.mbtiles', bbox, t.end);
});
