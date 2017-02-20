'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'buildinghigher1km'; //nombre igual al de README
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.building && val.geometry.type === 'Polygon') {
      var fc = {
        type: 'FeatureCollection',
        "features": [val]
      };
      var area = turf.area(fc);

      if (area > 100000) {
        val.properties._osmlint = osmlint;
        result.push(val);
      }
    }
  }

  if (result.length > 0) {
    //var fc = turf.featurecollection(result);
    writeData(JSON.stringify(result) + '\n');
  }

  done(null, null);
};
