'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'invalidmotorwayjunctions';
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    // Wrongly mapped, ref=*, noref=yes
    if (val.properties.ref && val.properties.noref) {
      val.properties._osmlint = osmlint;
      result.push(val);
    }
    // Missing highway=motorway_junction
    // When there are multiple ref’s for a junction, it should be assigned with ref:left=* and ref:right=*
    if (val.geometry.type === 'Point' && val.properties.ref) {
      var refs = val.properties.ref.split(';');
      if ((refs.length - 1) > 1) {
        val.properties._osmlint = osmlint;
        result.push(val);
      } else if ((refs.length - 1) === 1) {
        // ref elements must match with  ref:right and ref:left value
        if (!(val.properties['ref:right'] && val.properties['ref:left'])) {
          val.properties._osmlint = osmlint;
          result.push(val);
        } else if (!(val.properties['ref:left'] === refs[0] && val.properties['ref:right'] === refs[1])) {
          val.properties._osmlint = osmlint;
          result.push(val);
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
