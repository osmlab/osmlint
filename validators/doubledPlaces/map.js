'use strict';
var turf = require('turf');
var _ = require('underscore');

// Identify object with the same name.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var resultPoints = [];
  var objnames = {};

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.name !== undefined && (val.geometry.type === 'Point' || val.geometry.type === 'Polygon') && val.properties.public_transport === undefined && val.properties.railway === undefined  && val.properties.amenity !== 'bus_station' && val.properties.highway === undefined && val.properties.place === undefined && val.properties.amenity !== 'parking_entrance' && val.properties['addr:housenumber'] === undefined) {
      if (!objnames[val.properties.name]) {
        objnames[val.properties.name] = val;
      } else if (objnames[val.properties.name].properties['@id'] !== val.properties['@id'] && objnames[val.properties.name].geometry.type !== val.geometry.type && getDistance(objnames[val.properties.name], val) < 0.03) {
        resultPoints.push(objnames[val.properties.name]);
        resultPoints.push(val);
      }
    }
  }
  var result = _.values(resultPoints);
  if (result.length > 0) {
    var fc = turf.featurecollection(result);
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
