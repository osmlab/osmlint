'use strict';
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
