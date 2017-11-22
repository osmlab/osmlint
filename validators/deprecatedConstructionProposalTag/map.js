'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var result = [];
  var osmlint = 'deprecatedconstructionproposaltag';
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
  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    // form https://github.com/osmlab/to-fix/issues/215#issue-241160206
    // https://github.com/osmlab/to-fix/issues/215#issuecomment-314028464
    if (
      val.properties.highway &&
      preserveType[val.properties.highway] &&
      ((val.properties.construction &&
        (val.properties.construction === 'yes' ||
          val.properties.construction === 'widening')) ||
        (val.properties.proposed && val.properties.proposed === 'yes'))
    ) {
      val.properties._osmlint = osmlint;
      result.push(val);
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
