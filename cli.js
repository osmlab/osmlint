#!/usr/bin/env node
'use strict';

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

var usage = function() {
    console.log('Usage: osmlint <processor> --<options> <arguments ...>');
    console.log('Type osmlint --processors for available processors.');
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
        var processor = 0;
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
    var zl = argv.zl ? parseInt(argv.zl) : 12;
    processor.apply(null, [bbox, zl].concat(argv._.slice(1)));
})();
