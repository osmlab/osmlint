'use strict';

var test = require('tap').test;
var GJV = require('geojson-validation');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');

var zoom = 12;
var monacoTiles = path.join(__dirname, '/fixtures/monaco.mbtiles');
var bridgeOnNodeTiles = path.join(__dirname, '/fixtures/bridgeOnNode.mbtiles');
var unconnectedHighwaysTiles = path.join(__dirname, '/fixtures/unconnectedHighways.mbtiles');
var crossingWaterwaysHighwaysTiles = path.join(__dirname, '/fixtures/crossingWaterwaysHighways.mbtiles');
var islandsHighwaysTiles = path.join(__dirname, '/fixtures/islandsHighways.mbtiles');
var missingLayerBridgesTiles = path.join(__dirname, '/fixtures/missingLayerBridges.mbtiles');
var selfIntersectingHighwaysTiles = path.join(__dirname, '/fixtures/selfIntersectingHighways.mbtiles');
var unclosedWaysTiles = path.join(__dirname, '/fixtures/unclosedWays.mbtiles');
var crossingHighwaysTiles = path.join(__dirname, '/fixtures/crossingHighways.mbtiles');
var impossibleOneWaysTiles = path.join(__dirname, '/fixtures/impossibleOneways.mbtiles');
var impossibleAngleTiles = path.join(__dirname, '/fixtures/impossibleAngle.mbtiles');
var overlapHighwaysTiles = path.join(__dirname, '/fixtures/overlapHighways.mbtiles');
var fixMeTagTiles = path.join(__dirname, '/fixtures/fixMeTag.mbtiles');

var monacoOpts = {
  bbox: [7.4068451, 43.723259, 7.4422073, 43.752901],
  zoom: zoom
};

var commonOpts = {
  bbox: [-0.0878906, -0.0878906, 0, 0],
  zoom: zoom
};

// Parameters for testing missingHighwaysUS
var osmLevyCountyTiles = path.join(__dirname, '/fixtures/osm.levycounty.mbtiles');
var tiger2015LevyCountyTiles = path.join(__dirname, '/fixtures/tiger2015.levycounty.mbtiles');
var optsMissingHighwaysUS = {
  bbox: [-83.0759, 29.0201, -82.4290, 29.6141],
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

test('filterUsers', function(t) {
  t.plan(2);
  logInterceptor();
  processors.filterUsers(monacoOpts, monacoTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
      t.equal(geoJSON.features[0].properties['@user'], 'karitotp', 'Should be karitotp');
    }
    t.end();
  });
});

test('bridgeOnNode', function(t) {
  t.plan(2);
  logInterceptor();
  processors.bridgeOnNode(commonOpts, bridgeOnNodeTiles, function() {
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
  processors.missingLayerBridges(commonOpts, missingLayerBridgesTiles, function() {
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
  processors.selfIntersectingHighways(commonOpts, selfIntersectingHighwaysTiles, function() {
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
  processors.unclosedWays(commonOpts, unclosedWaysTiles, function() {
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
  processors.untaggedWays(optsMissingHighwaysUS, osmLevyCountyTiles, function() {
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
  t.plan(2);
  logInterceptor();
  processors.crossingHighways(commonOpts, crossingHighwaysTiles, function() {
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
  processors.unconnectedHighways(commonOpts, unconnectedHighwaysTiles, function() {
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
  t.plan(2);
  logInterceptor();
  processors.crossingWaterwaysHighways(commonOpts, crossingWaterwaysHighwaysTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'crossingwaterwayshighways', 'Should be crossingwaterwayshighways');
        t.equal(geoJSON.features[1].geometry.type, 'LineString', 'Should be LineString');
        // t.equal(geoJSON.features[4].geometry.type, 'Point', 'Should be Point'); -> What does this do?
      }
    }
    t.end();
  });
});

test('islandsHighways', function(t) {
  t.plan(2);
  logInterceptor();
  processors.islandsHighways(commonOpts, islandsHighwaysTiles, function() {
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
  processors.overlapHighways(commonOpts, overlapHighwaysTiles, function() {
    var logs = logInterceptor.end();
    console.log(logs);
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'overlaphighways', 'Should be overlaphighways');
        t.equal(geoJSON.features[0].geometry.type, 'Point', 'Should be Point');
      }
    }
    t.end();
  });
});

test('impossibleAngle', function(t) {
  t.plan(2);
  logInterceptor();
  processors.impossibleAngle(commonOpts, impossibleAngleTiles, function() {
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
  t.plan(102);
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

test('fixmeTag', function(t) {
  t.plan(2);
  logInterceptor();
  processors.fixmeTag(commonOpts, fixMeTagTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      for (var j = 0; j < geoJSON.features.length; j++) {
        t.comment('Pass: ' + (i + 1));
        t.equal(geoJSON.features[j].properties._osmlint, 'fixmetag', 'Should be fixmetag');
      }
    }
    t.end();
  });
});

test('impossibleOneWays', function(t) {
  t.plan(3);
  logInterceptor();
  processors.impossibleOneWays(commonOpts, impossibleOneWaysTiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(geoJSON.features[0].properties._osmlint, 'impossibleoneways', 'Should be impossibleoneways');
    t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
    t.end();
  });
});
