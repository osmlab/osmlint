'use strict';
/**
 * Merge ids, according to which is greater, this is to avoid duplicates objects in the lists
 * @param  {Object -> Feature} road1
 * @param  {Object -> Feature} road2
 * @return {String} Returns a concat of the id's
 */
module.exports = function(road1, road2) {
  var id;
  var id1 = road1.properties['@id'];
  var id2 = road2.properties['@id'];
  if (id1 > id2) {
    id = id1.toString().concat(id2);
  } else {
    id = id1.toString().concat(id2);
  }
  return id;
};
