# Processors for OSM QA Tiles

*TileReduce processors for OSM QA Tiles*

Data analysis with [OSM QA Tiles](http://osmlab.github.io/osm-qa-tiles/)! TileReduce processors for analyzing OSM QA Tiles wrapped up as a node module.

## Usage

```javascript
// Outputs nodes with bridge tags to stdout
var processors = require('osm-qa-tiles-processors');
bridgeOnNode('./osm.mbtiles', [-122.1, 36.9, -121.9, 37.0], function() {
    console.log('done);
});
```

## Available processors

### Bridge on node

Identifies invalid nodes with [`bridge=*` tags](http://wiki.openstreetmap.org/wiki/Key:bridge) and outputs them to the command line

## Test

```sh
npm install & npm test
```
