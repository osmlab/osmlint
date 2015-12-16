var processors = require('../index.js');
var bbox = [7.4068451, 43.723259, 7.4422073, 43.752901];

processors.bridgeOnNode(__dirname + '/monaco.mbtiles', bbox);
