var processors = require('../index.js');
var bbox = [-122.05862045288086, 36.93768132842635, -121.97296142578124, 37.00378647456494];

processors.bridgeOnNode(__dirname + '/osm.mbtiles', bbox);
