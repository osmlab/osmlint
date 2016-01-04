'use strict';

var test = require('tap').test;
var path = require('path');
var fs = require('fs');
var processors = require('../index.js');

var bbox = [7.4068451, 43.723259, 7.4422073, 43.752901];
var zoom = 12;
var mbtiles = path.join(__dirname, '/fixtures/monaco.mbtiles');

var osm_levycounty_mbties = path.join(__dirname, '/fixtures/osm.levycounty.mbtiles');
var tiger2015_levycounty_mbtiles = path.join(__dirname, '/fixtures/tiger2015.levycounty.mbtiles');

var opts = {
  bbox: bbox,
  zoom: zoom
};
var opts_missingHighwaysUS = {
  bbox: [-83.0759, 29.0201, -82.4290, 29.6141],
  zoom: zoom
};

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
test('missingHighwaysUS', function(t) {
  processors.missingHighwaysUS(opts_missingHighwaysUS, osm_levycounty_mbties, tiger2015_levycounty_mbtiles, t.end);
});
test('unclosedWays', function(t) {
  processors.unclosedWays(opts, mbtiles, t.end);
});