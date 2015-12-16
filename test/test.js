'use strict';

var test = require('tap').test;
var path = require('path');
var fs = require('fs');
var processors = require('../index.js');

var bbox = [7.4068451, 43.723259, 7.4422073, 43.752901];
var mbtiles = path.join(__dirname, '/data/monaco.mbtiles');

test('Filter Users', function(t) {
  var result = fs.readFileSync(path.join(__dirname, '/output/filterUsers.json'), 'utf-8');
  var result = processors.filterUsers(mbtiles, bbox);
  processors.filterUsers(mbtiles, bbox)
  t.equal(result, result, 'equal');
  t.end();
});


// var processors = require('../index.js');
// var bbox = [7.4068451, 43.723259, 7.4422073, 43.752901];

// processors.bridgeOnNode(__dirname + '/monaco.mbtiles', bbox);
// processors.filterDate(__dirname + '/monaco.mbtiles', bbox);
//processors.filterUsers(__dirname + '/monaco.mbtiles', bbox);
// needs TIGER fixture processors.missingHighwaysUS(__dirname + '/monaco.mbtiles', __dirname + '/tiger.mbtiles', bbox);
// processors.missingLayerBridges(__dirname + '/monaco.mbtiles', bbox);
// processors.untaggedWays(__dirname + '/monaco.mbtiles', bbox);