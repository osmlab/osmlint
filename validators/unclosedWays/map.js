'use strict'
var turf = require('turf');
var preserve_type = require('./value_area');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bbox = turf.extent(layer);
  var bboxlinestring = turf.bboxPolygon(bbox);
  bboxlinestring.geometry.type = 'LineString';
  bboxlinestring.geometry.coordinates = bboxlinestring.geometry.coordinates[0];
  var buffer = turf.buffer(bboxlinestring, 0.0005, 'miles').features[0];

  var result = layer.features.filter(function(val) {
    val.properties._osmlint = 'unclosedWays';
    var value_type = (
      preserve_type.area[val.properties.area] ||
      preserve_type.building[val.properties.building] ||
      preserve_type.landuse[val.properties.landuse] ||
      preserve_type.aeroway[val.properties.aeroway] ||
      preserve_type.leisure[val.properties.leisure] ||
      preserve_type.natural[val.properties.natural] ||
      preserve_type.man_made[val.properties.man_made]);

    if (val.geometry.type === 'LineString' && value_type) {
      var coordinates = val.geometry.coordinates;
      var first_coor = coordinates[0];
      var last_coor = coordinates[coordinates.length - 1];
      if (turf.inside(turf.point(first_coor), buffer) || turf.inside(turf.point(last_coor), buffer)) {
        return false;
      }
      return true;
    }
  });

  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};