'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var levenshtein = require('fast-levenshtein');

// Identificar escuelas duplicadas
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var resultPoints = {};
  var objnames = {};
  var keepFeatures = {
    school: true,
    kindergarten: true
  };
  var osmlint = 'doubledpoi';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (
      val.properties.amenity &&
      keepFeatures[val.properties.amenity] &&
      val.properties.name &&
      (val.geometry.type === 'Point' || val.geometry.type === 'Polygon')
    ) {
      var id = val.properties['@id'];
      if (val.geometry.type === 'Polygon') {
        var centroid = turf.centroid(val);
        centroid.properties = val.properties;
        val = centroid;
      }
      //The next layer should be replaced according to the country, This example was made for Peru.
      val.properties.name = val.properties.name
        .toLowerCase()
        .replace(/\s/g, '')
        .replace('institucióneducativa', '')
        .replace('inicialno.', '')
        .replace('no.', '');
      if (!objnames[id]) {
        objnames[id] = val;
      }
    }
  }

  for (var poiA in objnames) {
    for (var poiB in objnames) {
      var name = objnames[poiA].properties.name;
      var name2 = objnames[poiB].properties.name;
      if (
        getDistance(objnames[poiA], objnames[poiB]) < 0.5 &&
        objnames[poiA].properties.amenity === objnames[poiB].properties.amenity
      ) {
        if (
          (poiB !== poiA &&
            _.isNumber(name) &&
            _.isNumber(name2) &&
            name === name2) ||
          (poiB !== poiA &&
            !_.isNumber(name) &&
            !_.isNumber(name2) &&
            levenshtein.get(name, name2) < 2)
        ) {
          var poisIds = poiB + '' + poiA;
          if (poiA > poiB) {
            poisIds = poiA + '' + poiB;
          }
          var multiPt = turf.multiPoint([
            objnames[poiB].geometry.coordinates,
            objnames[poiA].geometry.coordinates
          ]);
          multiPt.properties = Object.assign(
            objnames[poiB].properties,
            objnames[poiA].properties
          );
          resultPoints[poisIds] = multiPt;
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
  return turf.distance(pp, p, {
    units: 'kilometers'
  });
}
