'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var resultPoints = {};
  var schoolBboxes = [];
  var priorschools = {};
  var keepFeatures = {
    school: true,
    kindergarten: true
  };
  var osmlint = 'groupedpoi';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    val.properties._osmlint = osmlint;
    if (
      keepFeatures[val.properties.amenity] && val.properties.amenity && val.geometry.type === 'Point') {
      var buffered = turf.buffer(val, 0.02, {
        units: 'kilometers'
      });

      buffered.properties = val.properties;
      var bbox1 = objBbox(buffered, buffered.properties.id);
      schoolBboxes.push(bbox1);
      priorschools[val.properties['id']] = val;
    }
  }
  var schoolsTree = rbush(schoolBboxes.length);
  schoolsTree.load(schoolBboxes);

  for (var j = 0; j < schoolBboxes.length; j++) {
    var bbox2 = schoolBboxes[j];
    var overlaps = schoolsTree.search(bbox2);
    //writeData(overlaps.length +'\n' )

    if (overlaps.length > 5) {

      var points = {};
      for (var k = 0; k < overlaps.length; k++) {
        var overlapId = overlaps[k].id;
        if (overlapId.split('/').length > 1) {
          overlapId = overlapId.split('/')[1];
        }
        points[overlapId] = priorschools[overlaps[k].id];
        
      }
      var fc = turf.featureCollection(_.values(points));
      var multipoint = turf.combine(fc).features[0];
      multipoint.properties = priorschools[overlaps[0].id].properties;
      resultPoints[getId(points)] = multipoint;
    }
  }
  var result = _.values(resultPoints);
  if (result.length > 0) {
    var fc1 = turf.featureCollection(result);
    writeData(JSON.stringify(fc1) + '\n');
  }
  done(null, null);
};

function objBbox(obj, id) {
  var bboxExtent = ['minX', 'minY', 'maxX', 'maxY'];
  var bbox = {};
  var valBbox = turf.bbox(obj);
  for (var d = 0; d < valBbox.length; d++) {
    bbox[bboxExtent[d]] = valBbox[d];
  }
  bbox.id = id || obj.properties['@id'];
  return bbox;
}

function getId(objs) {

  var ids = _.keys(objs);

  ids.sort(function(a, b) {
    return a - b;
  });

  return ids.join(''); // lo une los ids y lo convierte  en un string
}
