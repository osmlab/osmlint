'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'invaliddestination';
  var output = {};
  var abbrev = [
    'ave',
    'blvd',
    'cir',
    'ct',
    'expy',
    'fwy',
    'ln',
    'pky',
    'rd',
    'sq',
    'st',
    'tpke'
  ];
  var ordinalAbbrev = ['st', 'nd', 'rd', 'th'];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    //here comes all your code to validate the data
    if (
      val.geometry.type === 'LineString' &&
      val.properties.highway &&
      val.properties.highway === 'motorway_link'
    ) {
      val.properties._osmlint = osmlint;
      //Number of lanes should be equal to lanes in destination:lanes and destination:ref:lanes tags
      if (
        val.properties['destination:lanes'] &&
        val.properties['destination:ref:lanes']
      ) {
        var destLanes = val.properties['destination:lanes'].split('|');
        var destReflanes = val.properties['destination:ref:lanes'].split('|');
        if (destReflanes.length !== destLanes.length) {
          output[val.properties['@id']] = val;
          output[val.properties['@id']] = val;
        }
      }
      if (
        val.properties.lanes &&
        val.properties['destination:lanes'] &&
        val.properties['destination:lanes'].split('|') - 1 ===
          parseInt(val.properties.lanes)
      ) {
        output[val.properties['@id']] = val;
      }
      if (
        val.properties.lanes &&
        val.properties['destination:ref:lanes'] &&
        val.properties['destination:ref:lanes'].split('|') - 1 ===
          parseInt(val.properties.lanes)
      ) {
        output[val.properties['@id']] = val;
      }
      // Change destination:street=* to destination=* (Only for California) //improve here later
      if (val.properties['destination:street']) {
        output[val.properties['@id']] = val;
      }
      // If there is SR in destination:ref change it to CA
      if (
        val.properties['destination:ref'] &&
        val.properties['destination:ref'].indexOf('RS') > -1
      ) {
        output[val.properties['@id']] = val;
      }
      // A destination tag should have name of the destination but not the reference of the destination.
      // Example: destination= CA 101 (Wrong), destination=Oakland (Correct), destination:ref=CA 101 (Correct) and destination:ref=Oakland (Wrong)
      if (
        val.properties['destination:ref'] &&
        !val.properties['destination:ref'].match(/\d+/g)
      ) {
        output[val.properties['@id']] = val;
      }
      if (
        val.properties['destination'] &&
        val.properties['destination'].match(/\d+/g)
      ) {
        var num = val.properties['destination']
          .match(/\d+/g)
          .toString()
          .toLowerCase();
        var index = val.properties['destination'].indexOf(num) + num.length;
        var ord = val.properties['destination'].substring(index, index + 2);
        if (ordinalAbbrev.indexOf(ord) === -1) {
          output[val.properties['@id']] = val;
        }
      }
      // All the abbreviations in destination=* should be elaborated
      if (val.properties['destination']) {
        var arrayDest = val.properties['destination']
          .toLowerCase()
          .split(/(\s+)/)
          .filter(function(e) {
            return e.trim().length > 0;
          });
        if (_.intersection(abbrev, arrayDest).length > 0) {
          output[val.properties['@id']] = val;
        }
      }
      // Look for | in destination=* and destination:ref=* and replace them with ; but not in destination:lanes
      if (
        val.properties['destination'] &&
        val.properties['destination'].indexOf('|') > -1
      ) {
        output[val.properties['@id']] = val;
      }
      if (
        val.properties['destination:ref'] &&
        val.properties['destination:ref'].indexOf('|') > -1
      ) {
        output[val.properties['@id']] = val;
      }
    }
  }
  var result = _.values(output);
  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
