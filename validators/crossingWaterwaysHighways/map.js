'use strict';
var turf = require('turf');
var rbush = require('rbush');
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var waterways = {};
  var highwaybboxes = [];
  var waterwaybboxes = [];
  var preserveHighways = {
    'motorway': true,
    'motorway_link': true,
    'primary': true,
    'primary_link': true,
    'secondary': true,
    'secondary_link': true,
    'tertiary': true,
    'tertiary_link': true,
    'trunk': true,
    'trunk_link': true,
    'residential': true,
    'unclassified': true,
    'living_street': true,
    'road': true
  };
  var dontPreserveWaterways = {
    'dam': true,
    'weir': true,
    'waterfall': true
  };
  var fords = {};
  var osmlint = 'crossingwaterwayshighways';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var bbox;
    if (preserveHighways[val.properties.highway] && val.geometry.type === 'LineString' && val.properties.bridge === undefined && val.properties.tunnel === undefined && val.properties.ford === undefined) {
      bbox = turf.extent(val);
      bbox.push(val.properties._osm_way_id);
      highwaybboxes.push(bbox);
      highways[val.properties._osm_way_id] = val;
    } else if (val.properties.waterway && (val.geometry.type === 'LineString' || val.geometry.type === 'Polygon') && !dontPreserveWaterways[val.properties.waterway]) {
      if (val.geometry.type === 'Polygon') {
        val.geometry.type = 'LineString';
        val.geometry.coordinates = val.geometry.coordinates[0];
      }
      bbox = turf.extent(val);
      bbox.push(val.properties._osm_way_id);
      waterwaybboxes.push(bbox);
      waterways[val.properties._osm_way_id] = val;
    } else if (val.properties.ford === 'yes' && val.geometry.type === 'Point') {
      fords[val.geometry.coordinates.join(',')] = true;
    }
  }

  var traceTree = rbush(highwaybboxes.length);
  traceTree.load(highwaybboxes);
  var output = {};

  for (var j = 0; j < waterwaybboxes.length; j++) {
    var waterbbox = waterwaybboxes[j];
    var overlaps = traceTree.search(waterbbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      var intersect = turf.intersect(highways[overlap[4]], waterways[waterbbox[4]]);
      if (intersect !== undefined) {
        var props = {
          idHighway: overlap[4],
          idWaterway: waterbbox[4],
          _osmlint: osmlint
        };
        intersect.properties = props;
        highways[overlap[4]].properties._osmlint = osmlint;
        waterways[waterbbox[4]].properties._osmlint = osmlint;
        output[overlap[4]] = highways[overlap[4]];
        output[waterbbox[4]] = waterways[waterbbox[4]];
        if (intersect.geometry.type === 'MultiPoint') {
          var coord = intersect.geometry.coordinates;
          for (var l = 0; l < coord.length; l++) {
            if (!fords[coord[l].join(',')]) {
              var point = turf.point(coord[l]);
              point.properties = props;
              output[waterbbox[4].toString().concat(l)] = point;
            }
          }
        } else if (intersect.geometry.type === 'Point' && !fords[intersect.geometry.coordinates.join(',')]) {
          output[waterbbox[4].toString().concat('P')] = intersect;
        }
      }
    }
  }

  var result = _.values(output);

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
