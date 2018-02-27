'use strict';
var turf = require('@turf/turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var osmLayer = tileLayers.osm.osm;
  var tigerLayer = tileLayers.tiger.tiger2015;
  var preserveType = {
    motorway: true,
    motorway_link: true,
    primary: true,
    primary_link: true,
    secondary: true,
    secondary_link: true,
    tertiary: true,
    tertiary_link: true,
    trunk: true,
    trunk_link: true,
    residential: true,
    unclassified: true,
    living_street: true,
    road: true
  };
  var osmlint = 'missingnamehighwayus';
  var osmFC = [];
  var tigerFC = [];

  for (var k = 0; k < osmLayer.features.length; k++) {
    var osmVal = osmLayer.features[k];
    if (
      osmVal.properties.highway &&
      osmVal.geometry.type === 'LineString' &&
      preserveType[osmVal.properties.highway] &&
      !osmVal.properties.name &&
      !osmVal.properties.ref
    ) {
      osmFC.push(osmVal);
    }
  }
  for (var h = 0; h < tigerLayer.features.length; h++) {
    var tigerVal = tigerLayer.features[h];
    if (tigerVal.properties.FULLNAME && tigerVal.geometry.type === 'LineString') {
      tigerFC.push(tigerVal);
    }
  }

  var result = [];

  if (osmFC.length > 0) {
    for (var i = 0; i < osmFC.length; i++) {
      var osmWay = osmFC[i];
      var buffer = turf.buffer(osmWay, 0.004, {
        units: 'miles'
      });
      for (var j = 0; j < tigerFC.length; j++) {
        var tigerWay = tigerFC[j];
        var tigerPoints = turf.explode(tigerWay);
        var nodes;
        nodes = turf.within(tigerPoints, turf.featureCollection([buffer]));
        if (nodes.features.length >= tigerPoints.features.length / 2 && tigerWay.properties.FULLNAME) {
          osmWay.properties._osmlint = osmlint;
          osmWay.properties.name = tigerWay.properties.FULLNAME;
          result.push(osmWay);
        }
      }
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
