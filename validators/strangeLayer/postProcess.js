'use strict';
var post = require('../../lib/postProcessing');

module.exports = function postProcess() {
  var lineStream = post.createReadlineStream();
  var toMultiPointStream = post.createToMultipointStream();
  var convertStream = post.createConvertToGeojsonStream();

  lineStream
    .pipe(toMultiPointStream)
    .pipe(convertStream)
    .pipe(process.stdout);

  return lineStream;
};
