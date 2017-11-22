'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
var flatten = require('geojson-flatten');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxLayer = turf.bboxPolygon(turf.bbox(layer));
  bboxLayer.geometry.type = 'LineString';
  bboxLayer.geometry.coordinates = bboxLayer.geometry.coordinates[0];
  var bufferLayer = turf.buffer(bboxLayer, 0.01, {
    units: 'miles'
  });
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
    // 'service': true,
    road: true
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
  // preserveType = _.extend(preserveType, pathRoads);
  var unit = {
    units: 'meters'
  };
  var distance = 5;
  var highways = {};
  var bboxes = [];
  var output = {};
  var osmlint = 'unconnectedhighways';
  var avoidPoints = {};

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    // Linestring evaluation
    if (val.geometry.type === 'LineString' && val.properties.highway) {
      var valIdL = val.properties['@id'] + 'L';
      var bboxL = objBbox(val, valIdL);
      bboxes.push(bboxL);
      highways[valIdL] = {
        highway: val,
        buffer: turf.buffer(val, distance, unit)
      };
    } else if (
      val.geometry.type === 'MultiLineString' &&
      val.properties.highway
    ) {
      //MultiLineString evaluation
      var flat = flatten(val);
      var id = val.properties['@id'] + 'L';
      for (var f = 0; f < flat.length; f++) {
        if (flat[f].geometry.type === 'LineString') {
          var idFlat = id + 'M' + f;
          var bboxM = objBbox(flat[f], idFlat);
          bboxes.push(bboxM);
          highways[idFlat] = {
            highway: flat[f],
            buffer: turf.buffer(flat[f], distance, unit)
          };
        }
      }
    }
    //check entrance, noexit and barrier
    if (
      val.geometry.type === 'Point' &&
      (val.properties.entrance ||
        val.properties.noexit === 'yes' ||
        val.properties.barrier ||
        val.properties.highway === 'turning_circle')
    ) {
      avoidPoints[val.geometry.coordinates.join('-')] = true;
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);

  for (var m = 0; m < bboxes.length; m++) {
    var valueBbox = bboxes[m];
    var valueHighway = highways[valueBbox.id].highway;
    //obtaining first and last coordinates
    var firstCoord = valueHighway.geometry.coordinates[0];
    var firstPoint = turf.point(firstCoord);
    var endCoord =
      valueHighway.geometry.coordinates[
        valueHighway.geometry.coordinates.length - 1
      ];
    var endPoint = turf.point(endCoord);

    if (
      preserveType[valueHighway.properties.highway] &&
      !_.isEqual(firstCoord, endCoord)
    ) {
      var overlapsFirstPoint = [];
      if (!turf.booleanPointInPolygon(firstPoint, bufferLayer)) {
        overlapsFirstPoint = highwaysTree.search(
          objBbox(
            turf.bboxPolygon(
              turf.bbox(turf.buffer(firstPoint, distance, unit)),
              'id'
            )
          )
        );
      }
      var overlapsEndPoint = [];
      if (!turf.booleanPointInPolygon(endPoint, bufferLayer)) {
        overlapsEndPoint = highwaysTree.search(
          objBbox(
            turf.bboxPolygon(
              turf.bbox(turf.buffer(endPoint, distance, unit)),
              'id'
            )
          )
        );
      }
      var overlapBboxes = overlapsFirstPoint.concat(overlapsEndPoint);
      var arrayCorrd = [];
      for (var j = 0; j < overlapBboxes.length; j++) {
        var overlapBbox = overlapBboxes[j];
        if (valueBbox.id !== overlapBbox.id) {
          arrayCorrd = arrayCorrd.concat(
            _.flatten(highways[overlapBbox.id].highway.geometry.coordinates)
          );
        }
      }

      var props = {
        _fromWay: valueHighway.properties['@id'],
        _osmlint: osmlint,
        _type: classification(
          majorRoads,
          minorRoads,
          pathRoads,
          valueHighway.properties.highway
        )
      };

      if (!avoidPoints[firstCoord.join('-')]) {
        for (var k = 0; k < overlapsFirstPoint.length; k++) {
          var overlapPointFirst = overlapsFirstPoint[k];
          var toHighwayFirst = highways[overlapPointFirst.id].highway;

          if (
            valueBbox.id !== overlapPointFirst.id &&
            (arrayCorrd.indexOf(firstCoord[0]) === -1 ||
              arrayCorrd.indexOf(firstCoord[1]) === -1)
          ) {
            if (
              turf.booleanPointInPolygon(
                firstPoint,
                highways[overlapPointFirst.id].buffer
              )
            ) {
              props.toWay = toHighwayFirst.properties['@id'];
              firstPoint.properties = props;
              //Check out whether the streets are connected at some point
              var coordinatesF = valueHighway.geometry.coordinates;
              var valueCoorF = _.flatten([coordinatesF[1], coordinatesF[2]]);
              var overlapCoorF = _.flatten(toHighwayFirst.geometry.coordinates);
              if (_.intersection(valueCoorF, overlapCoorF).length < 2) {
                valueHighway.properties._osmlint = osmlint;
                toHighwayFirst.properties._osmlint = osmlint;
                //both roads must have the same layer and road to connect should not be in construction
                if (
                  valueHighway.properties.layer ===
                    toHighwayFirst.properties.layer &&
                  toHighwayFirst.properties.highway !== 'construction'
                ) {
                  output[valueBbox.id] = valueHighway;
                  output[overlapPointFirst.id] = toHighwayFirst;
                  if (
                    valueHighway.properties['@id'] >
                    toHighwayFirst.properties['@id']
                  ) {
                    output[
                      valueBbox.id.toString().concat(overlapPointFirst.id)
                    ] = firstPoint;
                  } else {
                    output[
                      overlapPointFirst.id.toString().concat(valueBbox.id)
                    ] = firstPoint;
                  }
                }
              }
            }
          }
        }
      }
      if (!avoidPoints[endCoord.join('-')]) {
        for (var l = 0; l < overlapsEndPoint.length; l++) {
          var overlapPointEnd = overlapsEndPoint[l];
          var toHighwayEnd = highways[overlapPointEnd.id].highway;
          if (
            valueBbox.id !== overlapPointEnd.id &&
            (arrayCorrd.indexOf(endCoord[0]) === -1 ||
              arrayCorrd.indexOf(endCoord[1]) === -1)
          ) {
            if (
              turf.booleanPointInPolygon(
                endPoint,
                highways[overlapPointEnd.id].buffer
              )
            ) {
              props.toWay = toHighwayEnd.properties['@id'];
              endPoint.properties = props;
              //Check out whether the streets are connected at some point
              var coordinatesE = valueHighway.geometry.coordinates;
              var valueCoorE = _.flatten([
                coordinatesE[coordinatesE.length - 1],
                coordinatesE[coordinatesE.length - 2]
              ]);
              var overlapCoorE = _.flatten(toHighwayEnd.geometry.coordinates);
              if (_.intersection(valueCoorE, overlapCoorE).length < 2) {
                valueHighway.properties._osmlint = osmlint;
                toHighwayEnd.properties._osmlint = osmlint;
                //both roads must have the same layer and road to connect should not be in construction
                if (
                  valueHighway.properties.layer ===
                    toHighwayEnd.properties.layer &&
                  toHighwayEnd.properties.highway !== 'construction'
                ) {
                  output[valueBbox.id] = valueHighway;
                  output[overlapPointEnd.id] = toHighwayEnd;
                  if (
                    valueHighway.properties['@id'] >
                    toHighwayEnd.properties['@id']
                  ) {
                    output[
                      valueHighway.properties['@id']
                        .toString()
                        .concat(toHighwayEnd.properties['@id'])
                    ] = endPoint;
                  } else {
                    output[
                      toHighwayEnd.properties['@id']
                        .toString()
                        .concat(valueHighway.properties['@id'])
                    ] = endPoint;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  var result = _.values(output);

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};

function classification(major, minor, path, highway) {
  if (major[highway]) {
    return 'major';
  } else if (minor[highway]) {
    return 'minor';
  } else if (path[highway]) {
    return 'path';
  }
}

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
