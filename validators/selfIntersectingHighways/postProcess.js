'use strict';
var post = require('../../lib/postProcessing');

module.exports = function postProcess() {
  var lineStream = post.createReadlineStream();
  var filterStream = post.createGeometryFilterTypeStream(['Point', 'MultiPoint']);
  var mergeByIdStream = post.createMergeByIdStream();
  var convertStream = post.createConvertToGeojsonStream();

  lineStream
    .pipe(filterStream)
    .pipe(mergeByIdStream)
    .pipe(convertStream)
    .pipe(process.stdout);

  return lineStream;
};
