'use strict';
var turf = require('turf');
var _ = require('underscore');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var buildings = {};
  var listofpoints = {};
  var bbox = turf.extent(layer);
  var squareGrid = turf.squareGrid(bbox, 0.1, 'kilometers');
  squareGrid.features.map(function(poly, k) {
    poly.properties.id = (k + 1);
    return poly;
  });

  layer.features.forEach(function(val) {
    if (val.geometry.type === 'Polygon' && val.geometry.coordinates.length === 1 && val.properties.building === 'yes') {
      var kinks = turf.kinks(val);
      if (kinks.intersections.features.length === 0) {
        val.properties._osmlint = 'crossingbuildings';
        var centroidPt = turf.centroid(val);
        centroidPt.properties.id = val.properties._osm_way_id;
        buildings[val.properties._osm_way_id] = val;
        squareGrid.features.map(function(poly) {
          if (turf.inside(centroidPt, poly)) {
            if (!listofpoints[poly.properties.id]) {
              listofpoints[poly.properties.id] = [centroidPt];
            } else {
              listofpoints[poly.properties.id].push(centroidPt);
            }
          }
        });
        return true;
      }
    }
  });

  var output = {};
  _.each(listofpoints, function(v) {
    var points = v;
    while (points.length > 0) {
      var point = points[0];
      points.splice(0, 1);
      var j = points.length;
      while (j--) {
        var distance = turf.distance(point, points[j], 'kilometers');
        if (distance < 0.9) {
          var intersect = turf.intersect(buildings[point.properties.id], buildings[points[j].properties.id]);
          if (intersect !== undefined && intersect.geometry.type === 'Polygon') {
            var area = turf.area(intersect);
            if (area > 0.1) {
              output[point.properties.id] = buildings[point.properties.id];
              output[points[j].properties.id] = buildings[points[j].properties.id];
            }
            break;
          }
        }
      }
    }
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
