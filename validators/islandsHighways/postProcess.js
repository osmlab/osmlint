'use strict';
var post = require('../../lib/postProcessing');

module.exports = function postProcess() {
  var lineStream = post.createReadlineStream();
  var filterStream = post.createGeometryFilterTypeStream(['LineString']);
  var convertStream = post.createConvertToGeojsonStream();

  lineStream
    .pipe(filterStream)
    .pipe(convertStream)
    .pipe(process.stdout);

  return lineStream;
};
