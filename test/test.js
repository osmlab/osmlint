'use strict';

var test = require('tap').test;
var GJV = require("geojson-validation");
var logInterceptor = require('log-interceptor');

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


test('filterDate', function(t) {
  logInterceptor();
  processors.filterDate(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(GJV.isGeoJSONObject(geoJSON), true, 'Should be a GeoJSON');
    t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
    t.end();
  });
});


test('filterUsers', function(t) {
  logInterceptor();
  processors.filterUsers(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(GJV.isGeoJSONObject(geoJSON), true, 'Should be a GeoJSON');
    t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
    t.end();
  });
});


test('bridgeOnNode', function(t) {
  logInterceptor();
  processors.bridgeOnNode(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(GJV.isGeoJSONObject(geoJSON), true, 'Should be a GeoJSON');
    t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
    if (geoJSON.features.length > 0) {
      t.equal(geoJSON.features[0].properties._osmlint, 'bridgeonnode', 'Should be bridgeonnode');
      t.equal(geoJSON.features[0].geometry.type, 'Point', 'Should be  Point');
    }
    t.end();
  });
});


test('missingLayerBridges', function(t) {
  logInterceptor();
  processors.missingLayerBridges(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(GJV.isGeoJSONObject(geoJSON), true, 'Should be a GeoJSON');
    t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
    if (geoJSON.features.length > 0) {
      t.equal(geoJSON.features[0].properties._osmlint, 'missinglayerbridges', 'Should be missinglayerbridges');
      t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  Point');
    }
    t.end();
  });
});


test('selfIntersecting', function(t) {
  logInterceptor();
  processors.selfIntersecting(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(GJV.isGeoJSONObject(geoJSON), true, 'Should be a GeoJSON');
    t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
    if (geoJSON.features.length > 0) {
      t.equal(geoJSON.features[0].properties._osmlint, 'selfintersecting', 'Should be selfintersecting');
      t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
    }
    t.end();
  });
});


test('unclosedWays', function(t) {
  logInterceptor();
  processors.unclosedWays(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(GJV.isGeoJSONObject(geoJSON), true, 'Should be a GeoJSON');
    t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
    if (geoJSON.features.length > 0) {
      t.equal(geoJSON.features[0].properties._osmlint, 'unclosedways', 'Should be unclosedways');
      t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
    }
    t.end();
  });
});


test('untaggedWays', function(t) {
  logInterceptor();
  processors.untaggedWays(opts, mbtiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(GJV.isGeoJSONObject(geoJSON), true, 'Should be a GeoJSON');
    t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
    if (geoJSON.features.length > 0) {
      t.equal(geoJSON.features[0].properties._osmlint, 'untaggedway', 'Should be untaggedway');
      t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
    }
    t.end();
  });
});


test('missingHighwaysUS', function(t) {
  logInterceptor();
  processors.missingHighwaysUS(opts_missingHighwaysUS, osm_levycounty_mbties, tiger2015_levycounty_mbtiles, function() {
    var logs = logInterceptor.end();
    var geoJSON = JSON.parse(logs[0]);
    t.equal(GJV.isGeoJSONObject(geoJSON), true, 'Should be a GeoJSON');
    t.equal(GJV.isFeatureCollection(geoJSON), true, 'Should be a FeatureCollection');
    if (geoJSON.features.length > 0) {
      t.equal(geoJSON.features[0].properties._osmlint, 'missinghighwayus', 'Should be missinghighwayus');
      t.equal(geoJSON.features[0].geometry.type, 'LineString', 'Should be  LineString');
    }
    t.end();
  });
});