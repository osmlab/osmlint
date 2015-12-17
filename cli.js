#!/usr/bin/env node
'use strict';

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

var usage = function() {
    console.log('Usage: osmlint <processor> --<options> <arguments ...>');
    console.log('  Example: osmlint bridgeonnode --zoom=15 --bbox="[7.4, 43.7, 7.4, 43.7]" osm.mbtiles');
    console.log('  Type osmlint --processors for available processors.');
};

(function() {
    if (argv.processors == true) {
        console.log(fs.readFileSync(__dirname + '/processors.txt', 'UTF-8'));
        return;
    }
    if (argv._.length < 2) {
        return usage();
    }

    var processor = (function(name) {
        var processors = fs.readdirSync(__dirname + '/processors/');
        for (var i = 0; i < processors.length; i++) {
            if (processors[i].toLowerCase() == name) {
                return require(__dirname + '/processors/' + processors[i]);
            }
        }
        return null;
    })(argv._[0]);

    if (!processor) {
        console.error('Unknown processor "' + argv._[0] + '"')
        return usage();
    }
    var bbox = argv.bbox ? JSON.parse(argv.bbox) : null;
    var zoom = argv.zoom ? parseInt(argv.zoom) : 12;
    processor.apply(null, [bbox, zoom].concat(argv._.slice(1)));
})();
