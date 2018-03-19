'use strict';
var turf = require('@turf/turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'incompleteresidentialbuildings';
  var meta = {
    'buildingYes': 0,
    'buildingResidential': 0,
    'buildingResidentialIncomplete': 0,
    'totalBuildings': 0
  };
  
  var result = [];
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.hasOwnProperty('building')) {
      meta.totalBuildings = meta.totalBuildings + 1;
      if (val.properties['building'] === 'yes') {
        meta.buildingYes = meta.buildingYes + 1;
      }

      if (val.properties['building'] === 'residential') {
        meta.buildingResidential = meta.buildingResidential + 1;
        if (!val.properties.hasOwnProperty('roof') || !val.properties.hasOwnProperty('wall') ) {
          meta.buildingResidentialIncomplete = meta.buildingResidentialIncomplete + 1;
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

  done(null, meta);
};
