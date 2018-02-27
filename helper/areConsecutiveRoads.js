'use strict';
/**
 * Check if two roads are consecutive
 * @param  {Object -> Feature} road1
 * @param  {Object -> Feature} road2
 * @return {Boolean}
 */
module.exports = function(road1, road2) {
  var coord1 = road1.geometry.coordinates;
  var coord2 = road2.geometry.coordinates;
  if (
    (coord1[0][0] === coord2[0][0] && coord1[0][1] === coord2[0][1]) ||
    (coord1[0][0] === coord2[coord2.length - 1][0] && coord1[0][1] === coord2[coord2.length - 1][1]) ||
    (coord1[coord1.length - 1][0] === coord2[0][0] && coord1[coord1.length - 1][1] === coord2[0][1]) ||
    (coord1[coord1.length - 1][0] === coord2[coord2.length - 1][0] &&
      coord1[coord1.length - 1][1] === coord2[coord2.length - 1][1])
  ) {
    return true;
  }
  return false;
};
