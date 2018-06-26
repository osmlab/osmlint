"use strict";
var turf = require("@turf/turf");
var _ = require("underscore");
var rbush = require("rbush");
var lineOverlap = require("@turf/line-overlap");
var _ = require("lodash");

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var bboxes = [];
  var majorRoads = {
    motorway: true,
    trunk: true,
    primary: true,
    secondary: true,
    tertiary: true,
    motorway_link: true,
    trunk_link: true,
    primary_link: true,
    secondary_link: true,
    tertiary_link: true
  };
  var minorRoads = {
    unclassified: true,
    residential: true,
    living_street: true,
    service: true
    // road: true
  };
  var pathRoads = {
    pedestrian: true,
    track: true,
    footway: true,
    path: true,
    cycleway: true,
    steps: true
  };
  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);
  //preserveType = _.extend(preserveType, pathRoads);
  var osmlint = "overlaphighways";

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (
      preserveType[val.properties.highway] &&
      (val.geometry.type === "LineString" ||
        val.geometry.type === "MultiLineString") &&
      val.properties.layer === undefined
    ) {
      var bboxHighway = objBbox(val);
      bboxes.push(bboxHighway);
      highways[val.properties["@id"]] = val;
    }
  }
  var traceTree = rbush(bboxes.length);
  traceTree.load(bboxes);
  var output = {};
  for (var j = 0; j < bboxes.length; j++) {
    var bbox = bboxes[j];
    // var intersectCoordinates = [];
    var overlaps = traceTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      if (bbox.id !== overlap.id) {
        var fromHighway = highways[bbox.id];
        var toHighway = highways[overlap.id];
        var intersect = turf.lineOverlap(fromHighway, toHighway);
        if (intersect.features.length > 0) {
          console.log(JSON.stringify(intersect));
        }
        // var initialCollection = [];
        // initialCollection.push(intersect.features[0]);
        // // console.log(initialCollection);
        // if (initialCollection[0] !== undefined) {
        //   intersectCoordinates.push(initialCollection[0].geometry.coordinates);
        //   console.log(intersectCoordinates);
        // }
        // for (var z = 0; z < intersect.features.length; z++) {
        // var uniqIntersect = _.uniq(intersect.features);
        // var uniqueIntersect = _.uniq(intersect.features);
        // console.log(JSON.stringify(Oneintersect));
      }

      // }
      // }
      // if (intersect && intersect.features.length > 0) {
      //   if (intersect.features.length > 1) {
      //     intersect = turf.combine(intersect);
      //     // console.log(JSON.stringify(intersect));
      //   }
      //   intersect = intersect.features[0];
      //   // if (intersect.geometry.type === 'LineString' || intersect.geometry.type === 'MultiLineString') {
      //   // var type;
      // }
    }
  }
  var result = _.values(output);

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + "\n");
  }

  done(null, null);
};

function objBbox(obj, id) {
  var bboxExtent = ["minX", "minY", "maxX", "maxY"];
  var bbox = {};
  var valBbox = turf.bbox(obj);
  for (var d = 0; d < valBbox.length; d++) {
    bbox[bboxExtent[d]] = valBbox[d];
  }
  bbox.id = id || obj.properties["@id"];
  return bbox;
}
