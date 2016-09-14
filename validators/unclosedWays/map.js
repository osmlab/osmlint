'use strict';
var turf = require('turf');
var preserveType = require('./value_area');

// Find unclosed ways.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bbox = turf.extent(layer);
  var bboxLineString = turf.bboxPolygon(bbox);
  var preventSource = {
    'NHD': true,
    'Kartverket N50': true,
    'MetroGIS DataFinder': true,
    'CANVEC': true,
    'ABS_2006': true,
    'Bing:GSI/KIBAN 2005': true,
    'BDLL25, EGRN, Instituto Geográfico Nacional': true,
    'Bing;GSI/KIBAN 2500': true,
    'CLC2006': true,
    'CLC_2006': true,
    'CLC_HUN': true,
    'CanVec 4.0 - NRCan': true,
    'CanVec 6.0 - NRCan': true,
    'CanVec 6.0 - NRCan;NRCan-CanVec-7.0': true,
    'CanVec_Import_2009': true,
    'DCGIS; NPS': true,
    'Digital Globe 2011-03-13': true,
    'DEP Wetlands (1:12,000) - April 2007 (http://www.mass.gov/mgis/wetdep.htm)': true,
    'GSI KIBAN 2500;NARO': true,
    'GSI/KIBAN 2500': true,
    'GSI/KIBAN 2500, 2008-03-31': true,
    'GSI/KIBAN 2500,NARO': true,
    'GSI/KIBAN 25000; NARO': true,
    'GSI/KIBAN 2500; NARO': true,
    'GSI/KIBAN 2500; NARO,Bing-2011-4': true,
    'GSI/KIBAN 2500;NARO': true,
    'NRCan-CanVec-10.0': true,
    'NRCan-CanVec-7.0': true,
    'NRCan-CanVec-7.0;CanVec 6.0 - NRCan': true,
    'NRCan-CanVec-8.0': true
  };
  bboxLineString.geometry.type = 'LineString';
  bboxLineString.geometry.coordinates = bboxLineString.geometry.coordinates[0];
  var buffer = turf.buffer(bboxLineString, 0.0005, 'miles').features[0];

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

    if (val.geometry.type === 'LineString' && valueType && !(val.properties.source && preventSource[val.properties.source])) {
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
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};
