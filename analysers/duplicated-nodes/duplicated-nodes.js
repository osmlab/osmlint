'use strict'
var _ = require('underscore');
var turf = require('turf');

var nodes = {};
module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    layer.features.map(function(val) {
        if (val.geometry.type === 'Point') {
            nodes[val.properties._osm_node_id] = val.geometry.coordinates;
        }
    });
    var result = turf.featurecollection([]);
    var nodes_invert = _.invert(nodes);
    if (_.size(nodes_invert) !== _.size(nodes)) {
        _.each(nodes_invert, function(v, k) {
            delete nodes[v];
        });
        _.each(nodes, function(v) {
            result.features.push(turf.point(v));
        });
    }
    if (result.length > 0) {
        writeData(JSON.stringify(result) + '\n');
    }

    done(null, null);
};