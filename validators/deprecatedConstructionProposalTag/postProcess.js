'use strict';
var post = require('../../lib/postProcessing');

module.exports = function postProcess() {
  var lineStream = post.createReadlineStream();
  var convertStream = post.createConvertToGeojsonStream();

  lineStream
    .pipe(convertStream)
    .pipe(process.stdout);

  return lineStream;
};
