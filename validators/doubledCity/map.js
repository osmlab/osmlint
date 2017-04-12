'use strict';
var turf = require('turf');
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var osmlint = 'doubledcity';
    var result = [];
    var objs = {};
    var places = {
      'suburb': true,
      'hamlet': true,
      'neighbourhood': true
    };

    for (var i = 0; i < layer.features.length; i++) {
      var val = layer.features[i];
      if (val.properties.place && places[val.properties.place] && (val.geometry.type === 'Point' || val.geometry.type === 'Polygon') && val.properties.name) {
        var pname = val.properties.name.toLowerCase();
        if (objs[pname]) {
          objs[pname].push(val);
          objs[pname] = [val];
        }
      }


      _.each(objs, function(v, k) {
        if (v.length > 1) {
          // writeData(JSON.stringify(v.length) + '\n')

          var coordenadas = [];
          for (var i = 0; i < v.length; i++) {
            coordenadas.push(v[i].geometry.coordinates);
          }

          writeData(JSON.stringify(coordenadas) + '\n')

        }


      });


      if (result.length > 0) {
        var fc = turf.featureCollection(result);
        //writeData(JSON.stringify(fc) + '\n');
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
    