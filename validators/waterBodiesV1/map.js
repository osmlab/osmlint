'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'waterbodiesv1';
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.natural && val.properties.natural === 'water' && val.geometry.type === 'Polygon' && val.properties['@version'] === 1 && val.properties['@timestamp'] > '1464739200') {
      var fc = {
        type: 'FeatureCollection',
        'features': [val]
      };
      var area = turf.area(fc);

      if (area > 200000) {
        val.properties._osmlint = osmlint;
        result.push(val);
      }
    }
  }

  if (result.length > 0) {
    //var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
