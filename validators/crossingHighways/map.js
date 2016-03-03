'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var bboxes = [];
  var majorRoads = {
    'motorway': true,
    'trunk': true,
    'primary': true,
    'secondary': true,
    'tertiary': true,
    'motorway_link': true,
    'trunk_link': true,
    'primary_link': true,
    'secondary_link': true,
    'tertiary_link': true
  };
  var minorRoads = {
    'unclassified': true,
    'residential': true,
    'living_street': true,
    'service': true,
    'road': true
  };
  var pathRoads = {
    'pedestrian': true,
    'track': true,
    'footway': true,
    'path': true,
    'cycleway': true,
    'steps': true
  };
  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);
  //preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'crossinghighways';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (preserveType[val.properties.highway] && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString') && val.properties.layer === undefined) {
      var bboxHighway = turf.extent(val);
      bboxHighway.push(val.properties._osm_way_id);
      bboxes.push(bboxHighway);
      highways[val.properties._osm_way_id] = val;
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  var output = {};

  for (var j = 0; j < bboxes.length; j++) {
    var bbox = bboxes[j];
    var overlaps = highwaysTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      if (bbox[4] !== overlap[4]) {
        var intersectPoint = turf.intersect(highways[overlap[4]], highways[bbox[4]]);
        if (intersectPoint !== undefined && (intersectPoint.geometry.type === 'Point' || intersectPoint.geometry.type === 'MultiPoint')) {
          var highwayCoord = _.flatten(highways[overlap[4]].geometry.coordinates);
          highwayCoord.concat(_.flatten(highways[bbox[4]].geometry.coordinates));
          var intersectPointCoord = _.flatten(intersectPoint.geometry.coordinates);
          if (_.difference(highwayCoord, intersectPointCoord).length === highwayCoord.length) {
            var fromHighway = highways[bbox[4]];
            var toHighway = highways[overlap[4]];
            fromHighway.properties._osmlint = osmlint;
            toHighway.properties._osmlint = osmlint;
            output[bbox[4]] = fromHighway;
            output[overlap[4]] = toHighway;
            var type;
            if (majorRoads[fromHighway.properties.highway] && majorRoads[toHighway.properties.highway]) {
              type = 'major-major';
            } else if ((majorRoads[fromHighway.properties.highway] && minorRoads[toHighway.properties.highway]) || (minorRoads[fromHighway.properties.highway] && majorRoads[toHighway.properties.highway])) {
              type = 'major-minor';
            } else if ((majorRoads[fromHighway.properties.highway] && pathRoads[toHighway.properties.highway]) || (pathRoads[fromHighway.properties.highway] && majorRoads[toHighway.properties.highway])) {
              type = 'major-path';
            } else if (minorRoads[fromHighway.properties.highway] && minorRoads[toHighway.properties.highway]) {
              type = 'minor-minor';
            } else if ((minorRoads[fromHighway.properties.highway] && pathRoads[toHighway.properties.highway]) || (pathRoads[fromHighway.properties.highway] && minorRoads[toHighway.properties.highway])) {
              type = 'minor-path';
            } else if (pathRoads[fromHighway.properties.highway] && pathRoads[toHighway.properties.highway]) {
              type = 'path-path';
            }
            intersectPoint.properties = {
              fromWay: fromHighway.properties._osm_way_id,
              toWay: toHighway.properties._osm_way_id,
              _osmlint: osmlint,
              type: type
            };
            if (fromHighway.properties._osm_way_id > toHighway.properties._osm_way_id) {
              output[bbox[4].toString().concat(overlap[4])] = intersectPoint;
            } else {
              output[overlap[4].toString().concat(bbox[4])] = intersectPoint;
            }
          }
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
