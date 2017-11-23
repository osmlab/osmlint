'use strict';
var turf = require('@turf/turf');
module.exports = {
  objBbox
};

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
