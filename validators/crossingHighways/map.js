'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var bboxes = [];
  var preserve = {
    'motorway': true,
    'primary': true,
    'secondary': true,
    'tertiary': true,
    'trunk': true,
    'residential': true,
    'unclassified': true,
    'service': true
  };

  layer.features.forEach(function(val) {
    if (preserve[val.properties.highway] && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString') && val.properties.layer === undefined) {
      val.properties._osmlint = 'crossinghighways';
      var bbox = turf.extent(val);
      bbox.push(val.properties._osm_way_id);
      bboxes.push(bbox);
      highways[val.properties._osm_way_id] = val;

    }
  });
  var traceTree = rbush(bboxes.length);
  traceTree.load(bboxes);
  var output = {};

  bboxes.forEach(function(bbox) {
    var overlaps = traceTree.search(bbox);
    overlaps.forEach(function(overlap) {
      if (bbox[4] !== overlap[4]) {
        var intersect = turf.intersect(highways[overlap[4]], highways[bbox[4]]);
        if (intersect !== undefined && (intersect.geometry.type === 'Point')) { //|| intersect.geometry.type === 'Multipoint'
          var arr = _.flatten(highways[overlap[4]].geometry.coordinates);
          arr.concat(_.flatten(highways[bbox[4]].geometry.coordinates));
          if (arr.indexOf(intersect.geometry.coordinates[0]) < 0 && arr.indexOf(intersect.geometry.coordinates[1]) < 0) {
            output[overlap[4]] = highways[overlap[4]];
            output[bbox[4]] = highways[bbox[4]];
            intersect.properties = {
              way1: overlap[4],
              way2: bbox[4]
            };
            if (bbox[4] > overlap[4]) {
              output[bbox[4].toString().concat(overlap[4])] = intersect;
            } else {
              output[overlap[4].toString().concat(bbox[4])] = intersect;
            }
          }
        }
      }
    });
  });

  var result = [];

  _.each(output, function(v) {
    result.push(v);
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
