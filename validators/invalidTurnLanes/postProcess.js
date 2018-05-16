'use strict';
var post = require('../../lib/postProcessing');

module.exports = function postProcess() {
  var lineStream = post.createReadlineStream();
  var toMultipointStream = post.createToMultipointStream();
  var convertStream = post.createConvertToGeojsonStream();

  lineStream
    .pipe(toMultipointStream)
    .pipe(convertStream)
    .pipe(process.stdout);

  return lineStream;
};
