#!/usr/bin/env node
'use strict';

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

var usage = function() {
    console.log('Usage: osmlint <validator> --<options> <arguments ...>');
    console.log('  Example: osmlint bridgeonnode --zoom=15 --bbox="[7.4, 43.7, 7.4, 43.7]" osm.mbtiles');
    console.log('  Type osmlint --validators for available validators.');
};

(function() {
    if (argv.validators == true) {
        console.log(fs.readFileSync(__dirname + '/validators.txt', 'UTF-8'));
        return;
    }
    if (argv._.length < 2) {
        return usage();
    }

    var validator = (function(name) {
        var validators = fs.readdirSync(__dirname + '/validators/');
        for (var i = 0; i < validators.length; i++) {
            if (validators[i].toLowerCase() == name) {
                return require(__dirname + '/validators/' + validators[i]);
            }
        }
        return null;
    })(argv._[0]);

    if (!validator) {
        console.error('Unknown validator "' + argv._[0] + '"')
        return usage();
    }
    var bbox = argv.bbox ? JSON.parse(argv.bbox) : null;
    var zoom = argv.zoom ? parseInt(argv.zoom) : 12;
    validator.apply(null, [bbox, zoom].concat(argv._.slice(1)));
})();
