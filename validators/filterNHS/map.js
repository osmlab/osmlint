'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.tiger.tiger2016;
  var osmlint = '01_dir_template';
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.FULLNAME && val.properties.FULLNAME.replace(/\s+/g, '').toLowerCase().indexOf('ushwy1') > -1) {
      result.push(val);
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
