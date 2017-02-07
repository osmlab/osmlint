'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');

// Identify object with the same name.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var resultPoints = [];
  var objnames = {};

  var featuresE = ['shop', 'landuse', 'leisure', 'historic'];
  var osmlint = 'doubledplaces';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if ((val.geometry.type === 'Point' || val.geometry.type === 'Polygon') && val.properties.name && !val.properties.public_transport && !val.properties.railway && val.properties.amenity !== 'bus_station' && !val.properties.highway && !val.properties.place && val.properties.amenity !== 'parking_entrance' && val.properties['addr:housenumber'] === undefined) {
      var nlc = val.properties.name.toLowerCase();
      for (var j = 0; j < featuresE.length; j++) {
        if (val.properties[featuresE[j]]) {
          if (!objnames[nlc]) {
            objnames[nlc] = val;
          } else if (objnames[nlc] && objnames[nlc].properties['@id'] !== val.properties['@id'] && objnames[nlc].properties.name.toLowerCase() === nlc && objnames[nlc].geometry.type !== val.geometry.type && getDistance(objnames[nlc], val) < 0.03 && objnames[nlc].properties[featuresE[j]] === val.properties[featuresE[j]]) {
            objnames[nlc].properties._osmlint = osmlint;
            val.properties._osmlint = osmlint;
            resultPoints.push(objnames[nlc]);
            resultPoints.push(val);
          }
        }
      }
    }
  }

  var result = _.values(resultPoints);
  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};

function getDistance(o1, o2) {
  var p, pp;
  if (o1.geometry.type === 'Polygon') {
    pp = turf.centroid(o1);
    p = o2;
  } else {
    pp = turf.centroid(o2);
    p = o1;
  }
  return turf.distance(pp, p, 'kilometers');
}
