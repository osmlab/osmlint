'use strict';
var turf = require('turf');
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'trafficlightsunconnected';
  var majorRoads = {
    'motorway': true,
    'trunk': true,
    'primary': true,
    'secondary': true,
    'tertiary': true,
    'motorway_link': true,
    'trunk_link': true,
    'primary_link': true,
    'secondary_link': true,
    'tertiary_link': true
  };
  var minorRoads = {
    'unclassified': true,
    'residential': true,
    'living_street': true,
    'service': true,
    'road': true
  };
  var pathRoads = {
    'pedestrian': true,
    'track': true,
    'footway': true,
    'path': true,
    'cycleway': true,
    'steps': true
  };
  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);


  var fc = {
    "type": "FeatureCollection",
    "features": []
  };

  var preResult = [];
  var highwayCoords = {};
  var trafficLights = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (preserveType[val.properties.highway] && val.geometry.type === 'LineString') {
      var coords = val.geometry.coordinates;
      for (var k = 0; k < coords.length; k++) {
        var punto = turf.point(coords[k])
        fc.features.push(punto);
        highwayCoords[coords[k].join(',')] = true;
      }
    }
    if (val.properties.highway === 'traffic_signals' && val.geometry.type === 'Point') {
      var c = val.geometry.coordinates;
      val.properties._osmlint = osmlint;
      trafficLights.push(val);
    }
  }
  for (var j = 0; j < trafficLights.length; j++) {
    var coordString = trafficLights[j].geometry.coordinates.join(',');
    if (!highwayCoords[coordString]) {
      preResult.push(trafficLights[j]);
    }
  }

  var result = preResult;
  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};