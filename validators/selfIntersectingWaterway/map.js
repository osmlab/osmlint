'use strict';
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'selfintersectingwaterway';
  var result = [];
  var preserveType = {
    river: true,
    stream: true,
    canal: true,
    drain: true
  };
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.waterway && preserveType[val.properties.waterway] && val.geometry.type === 'LineString') {
      var intersect = turf.intersect(val, val);
      if (intersect.geometry.coordinates.length > val.geometry.coordinates.length) {
        var coords = {};
        for (var x = 0; x < val.geometry.coordinates.length; x++) {
          var coord = val.geometry.coordinates[x];
          coords[coord.join('-')] = true;
        }
        var pointFC = turf.explode(intersect);
        var intersectObjs = [];
        for (var n = 0; n < pointFC.features.length; n++) {
          var p = pointFC.features[n];
          if (!coords[p.geometry.coordinates.join('-')]) {
            intersectObjs.push(p.geometry.coordinates);
          }
        }
        var point;
        if (intersectObjs.length === 1) {
          point = turf.point(intersectObjs[0]);
        } else {
          point = {
            type: 'Feature',
            geometry: {
              type: 'MultiPoint',
              coordinates: intersectObjs
            },
            properties: {}
          };
        }
        point.properties._osmlint = osmlint;
        point.properties._fromWay = val.properties['@id'];
        result.push(point);
        val.properties._osmlint = osmlint;
        result.push(val);
      }
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
