'use strict';
var stream = require('stream');
var turf = require('@turf/turf');

function createReadlineStream() {
  var transform = new stream.Transform();
  var lineBuffer = '';
  transform._transform = function (data, encoding, done) {
    var lines = data.toString().split('\n');
    lines[0] = lineBuffer + lines[0];
    lineBuffer = lines.pop();
    var output = '';
    lines.forEach(function(line) {
      output += line + '\n';
    });
    done(null, output);
  };
  return transform;
}

function createGeometryFilterTypeStream(types) {
  if (types) {
    types = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'];
  }
  var transform = new stream.Transform();

  transform._transform = function (line, encoding, done) {
    var obj = JSON.parse(line.toString());
    var features = [];
    for (var i = 0; i < obj.features.length; i++) {
      if (types.indexOf(obj.features[i].geometry.type) > -1) {
        features.push(obj.features[i]);
      }
    }
    if (features.length > 0) {
      var geojson = {
        type: 'FeatureCollection',
        features: features
      };
      this.push(JSON.stringify(geojson));
    }
    done();
  };
  return transform;
}

function createConvertToGeojsonStream() {
  var geojson = {
    'type': 'FeatureCollection',
    'features': []
  };
  var transform = new stream.Transform();
  transform._transform = function (line, encoding, done) {
    var obj = JSON.parse(line.toString());
    if (obj.type === 'FeatureCollection') {
      geojson.features = geojson.features.concat(obj.features);
    } else {
      geojson.features = geojson.features.concat(obj);
    }
    done();
  };
  transform._flush = function (done) {
    this.push(JSON.stringify(geojson));
    done();
  };
  return transform;
}

function createMergeByIdStream() {
  var transform = new stream.Transform();
  transform._transform = function (line, encoding, done) {
    var obj = JSON.parse(line);
    var result = {};
    var features = obj.features;
    for (var i = 0; i < features.length; i++) {
      var val = features[i];
      if (val.geometry.type === 'Point') {
        var id = val.properties._fromWay + ',' + val.properties._toWay;
        if (!result[id]) {
          result[id] = [val];
        } else {
          result[id].push(val);
        }
      }
    }
    var geojson = {
      'type': 'FeatureCollection',
      'features': []
    };
    var values = Object.keys(result).map(function(e) {
      return result[e];
    });
    values.forEach(function (val) {
      var points = {
        'type': 'FeatureCollection',
        'features': val
      };
      var multipoints = turf.combine(points);
      multipoints.features[0].properties = val[0].properties;
      geojson.features.push(multipoints.features[0]);
    });
    this.push(JSON.stringify(geojson) + '\n');
    done();
  };
  return transform;
}

function createToMultipointStream() {
  var transform = new stream.Transform();
  transform._transform = function (line, encoding, done) {
    var obj = JSON.parse(line);
    var geojson = {
      'type': 'FeatureCollection',
      'features': []
    };
    for (var i = 0; i < obj.features.length; i++) {
      if (obj.features[i].geometry.type === 'LineString' || obj.features[i].geometry.type === 'Polygon') {
        var multipoints = turf.combine(turf.explode(obj.features[i]));
        multipoints.features[0].properties = obj.features[i].properties;
        geojson.features.push(multipoints.features[0]);
      } else {
        geojson.features.push(obj.features[i]);
      }
    }
    this.push(JSON.stringify(geojson) + '\n');
    done();
  };
  return transform;
}

module.exports = {
  createReadlineStream: createReadlineStream,
  createGeometryFilterTypeStream: createGeometryFilterTypeStream,
  createConvertToGeojsonStream: createConvertToGeojsonStream,
  createMergeByIdStream: createMergeByIdStream,
  createToMultipointStream: createToMultipointStream
};
