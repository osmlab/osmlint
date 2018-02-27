'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'unconnectedtrafficlights';
  var majorRoads = {
    motorway: true,
    trunk: true,
    primary: true,
    secondary: true,
    tertiary: true,
    motorway_link: true,
    trunk_link: true,
    primary_link: true,
    secondary_link: true,
    tertiary_link: true
  };
  var minorRoads = {
    unclassified: true,
    residential: true,
    living_street: true,
    service: true,
    road: true
  };
  var pathRoads = {
    pedestrian: true,
    track: true,
    footway: true,
    path: true,
    cycleway: true,
    steps: true
  };
  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);
  preserveType = _.extend(preserveType, pathRoads);

  var result = [];
  var highwayCoords = {};
  var trafficLights = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (preserveType[val.properties.highway] && val.geometry.type === 'LineString') {
      var coords = val.geometry.coordinates;
      for (var k = 0; k < coords.length; k++) {
        highwayCoords[coords[k].join(',')] = true;
      }
    }
    if (val.properties.highway === 'traffic_signals' && val.geometry.type === 'Point') {
      trafficLights.push(val);
    }
  }

  for (var j = 0; j < trafficLights.length; j++) {
    var coordString = trafficLights[j].geometry.coordinates.join(',');
    if (!highwayCoords[coordString]) {
      trafficLights[j].properties._osmlint = osmlint;
      result.push(trafficLights[j]);
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};
