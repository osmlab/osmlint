var processors = require('../index.js');
var bbox = [7.4068451, 43.723259, 7.4422073, 43.752901];

processors.bridgeOnNode(__dirname + '/osm.mbtiles', bbox);
processors.filterDate(__dirname + '/osm.mbtiles', bbox);
processors.filterUsers(__dirname + '/osm.mbtiles', bbox);
// needs TIGER fixture processors.missingHighwaysUS(__dirname + '/osm.mbtiles', __dirname + '/tiger.mbtiles', bbox);
processors.missingLayerBridges(__dirname + '/osm.mbtiles', bbox);
processors.untaggedWays(__dirname + '/osm.mbtiles', bbox);
