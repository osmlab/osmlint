'use strict';

var test = require('tap').test;
var GJV = require('geojson-validation');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');

var bbox = [7.4068451, 43.723259, 7.4422073, 43.752901];
var zoom = 12;
var mbtiles = path.join(__dirname, '/fixtures/monaco.mbtiles');
var bridgeOnNodeTiles = path.join(__dirname, '/fixtures/bridgeonnode.mbtiles');
var unconnectedhighwaysTiles = path.join(__dirname, '/fixtures/unconnectedhighways.mbtiles');
var crossingwaterwayshighwaysTiles = path.join(__dirname, '/fixtures/crossingwaterwayshighways.mbtiles');
var islandsHighwaysTiles = path.join(__dirname, '/fixtures/islandshighways.mbtiles');

var optsbridgeOnNode = {
  bbox: [114.445, 3.656, 126.376, 11.738],
  zoom: zoom
};

var opts = {
  bbox: bbox,
  zoom: zoom
};

// Parameters for testing missingHighwaysUS
var osmLevyCountyTiles = path.join(__dirname, '/fixtures/osm.levycounty.mbtiles');
var tiger2015LevyCountyTiles = path.join(__dirname, '/fixtures/tiger2015.levycounty.mbtiles');
var optsMissingHighwaysUS = {
  bbox: [-83.0759, 29.0201, -82.4290, 29.6141],
  zoom: zoom
};

// Parameters for testing overlaphighways
var overlaphighwaysTiles = path.join(__dirname, '/fixtures/overlaphighways.mbtiles');
var optsOverlapHighways = {
  bbox: [-76.943521, -12.037976, -76.905327, -12.013968],
  zoom: zoom
};

test('filterDate', function(t) {
  t.plan(1);
  logInterceptor();
  processors.filterDate(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    t.equal(logs.length, 0, 'No features returned');
    t.end();
  });
});

test('filterUsers', function(t) {
  t.plan(2);
  logInterceptor();
  processors.filterUsers(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
      t.equal(geoJSON.features[0].properties._user, 'karitotp', 'Should be karitotp');
    }
    t.end();
  });
});

test('bridgeOnNode', function(t) {
  t.plan(6);
  logInterceptor();
  processors.bridgeOnNode(optsbridgeOnNode, bridgeOnNodeTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'bridgeonnode', 'Should be bridgeonnode');
        t.equal(geoJSON.features[0].geometry.type, 'Point', 'Should be  Point');
      }
    }
    t.end();
  });
});

test('missingLayerBridges', function(t) {
  t.plan(2);
  logInterceptor();
  processors.missingLayerBridges(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'missinglayerbridges', 'Should be missinglayerbridges');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  Point');
      }
    }
    t.end();
  });
});

test('selfIntersectingHighways', function(t) {
  t.plan(2);
  logInterceptor();
  processors.selfIntersectingHighways(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'selfintersectinghighways', 'Should be selfintersecting');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
      }
    }
    t.end();
  });
});

test('unclosedWays', function(t) {
  t.plan(2);
  logInterceptor();
  processors.unclosedWays(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'unclosedways', 'Should be unclosedways');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
      }
    }
    t.end();
  });
});

test('untaggedWays', function(t) {
  t.plan(2);
  logInterceptor();
  processors.untaggedWays(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'untaggedway', 'Should be untaggedway');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
      }
    }
    t.end();
  });
});

test('missingHighwaysUS', function(t) {
  t.plan(54);
  logInterceptor();
  processors.missingHighwaysUS(optsMissingHighwaysUS, osmLevyCountyTiles, tiger2015LevyCountyTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'missinghighwayus', 'Should be missinghighwayus');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
      }
    }
    t.end();
  });
});

test('crossingHighways', function(t) {
  t.plan(6);
  logInterceptor();
  processors.crossingHighways(optsMissingHighwaysUS, osmLevyCountyTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'crossinghighways', 'Should be crossinghighways');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be LineString');
      }
    }
    t.end();
  });
});

test('unconnectedHighways', function(t) {
  t.plan(2);
  logInterceptor();
  processors.unconnectedHighways(opts, unconnectedhighwaysTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'unconnectedhighways', 'Should be unconnectedhighways');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be LineString');
      }
    }
    t.end();
  });
});

test('crossingWaterwaysHighways', function(t) {
  t.plan(3);
  logInterceptor();
  processors.crossingWaterwaysHighways(opts, crossingwaterwayshighwaysTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'crossingwaterwayshighways', 'Should be crossingwaterwayshighways');
        t.equal(geoJSON.features[1].geometry.type, 'LineString', 'Should be LineString');
        t.equal(geoJSON.features[4].geometry.type, 'Point', 'Should be Point');
      }
    }
    t.end();
  });
});

test('islandsHighways', function(t) {
  t.plan(2);
  logInterceptor();
  processors.islandsHighways(opts, islandsHighwaysTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'islandshighways', 'Should be islandsHighways');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be LineString');
      }
    }
    t.end();
  });
});

test('overlapHighways', function(t) {
  t.plan(2);
  logInterceptor();
  processors.overlapHighways(optsOverlapHighways, overlaphighwaysTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'overlaphighways', 'Should be overlaphighways');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be LineString');
      }
    }
    t.end();
  });
});

test('impossibleAngle', function(t) {
  t.plan(2);
  logInterceptor();
  processors.impossibleAngle(osmLevyCountyTiles, osmLevyCountyTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'impossibleangle', 'Should be impossibleangle');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be LineString');
      }
    }
    t.end();
  });
});

test('tigerDelta', function(t) {
  t.plan(104);
  logInterceptor();
  processors.tigerDelta(optsMissingHighwaysUS, osmLevyCountyTiles, tiger2015LevyCountyTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'tigerdelta', 'Should be tigerdelta');
        t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
      }
    }
    t.end();
  });
});
