'use strict';
var turf = require('@turf/turf');
module.exports = {
  objBbox
};

/**
 * Format the bbox of the feature in rbush required https://github.com/mourner/rbush#adding-data
 * @param  {Object -> Feature} osm object
 * @param  {String||Object} osm object identifier
 * @return {Object} e.g {minX:20,minY:40,maxX:30,maxY:50,id:osmId};
 */
function objBbox(feature, id) {
  var bboxExtent = ['minX', 'minY', 'maxX', 'maxY'];
  var bbox = {};
  var valBbox = turf.bbox(feature);
  for (var d = 0; d < valBbox.length; d++) {
    bbox[bboxExtent[d]] = valBbox[d];
  }
  bbox.id = id || feature.properties['@id'];
  return bbox;
}