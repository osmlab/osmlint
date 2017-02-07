'use strict';
var turf = require('turf');
var preserveType = require('./value_area');
var preventSource = require('./value_avoid');

// Find unclosed ways.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bbox = turf.bbox(layer);
  var bboxLineString = turf.bboxPolygon(bbox);
  bboxLineString.geometry.type = 'LineString';
  bboxLineString.geometry.coordinates = bboxLineString.geometry.coordinates[0];
  var buffer = turf.buffer(bboxLineString, 0.0005, 'miles');
  var result = layer.features.filter(function(val) {
    val.properties._osmlint = 'unclosedways';
    var valueType = (
      preserveType.area[val.properties.area] ||
      preserveType.building[val.properties.building] ||
      preserveType.landuse[val.properties.landuse] ||
      preserveType.aeroway[val.properties.aeroway] ||
      preserveType.leisure[val.properties.leisure] ||
      preserveType.natural[val.properties.natural] ||
      preserveType.man_made[val.properties.man_made]
    );

    if (val.geometry.type === 'LineString' && valueType && !(val.properties.source && val.properties.source.indexOf(preventSource[val.properties.source]) < 0)) {
      var coordinates = val.geometry.coordinates;
      var firstCoord = coordinates[0];
      var lastCoord = coordinates[coordinates.length - 1];
      if (turf.inside(turf.point(firstCoord), buffer) || turf.inside(turf.point(lastCoord), buffer)) {
        return false;
      }
      return true;
    }
  });

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
