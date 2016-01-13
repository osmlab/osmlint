'use strict';
var turf = require('turf');
var preserveType = require('./value_area');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bbox = turf.extent(layer);
  var bboxlinestring = turf.bboxPolygon(bbox);
  bboxlinestring.geometry.type = 'LineString';
  bboxlinestring.geometry.coordinates = bboxlinestring.geometry.coordinates[0];
  var buffer = turf.buffer(bboxlinestring, 0.0005, 'miles').features[0];

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

    if (val.geometry.type === 'LineString' && valueType) {
      var coordinates = val.geometry.coordinates;
      var firstCoord = coordinates[0];
      var lastCoord = coordinates[coordinates.length - 1];
      if (turf.inside(turf.point(firstCoord), buffer) || turf.inside(turf.point(lastCoord), buffer)) {
        return false;
      }
      return true;
    }
  });

  var fc = turf.featurecollection(result);
  writeData(JSON.stringify(fc) + '\n');

  done(null, null);
};
