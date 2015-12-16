# Processors for OSM QA Tiles

*TileReduce processors for OSM QA Tiles*

Data analysis with [OSM QA Tiles](http://osmlab.github.io/osm-qa-tiles/)! TileReduce processors for analyzing OSM QA Tiles wrapped up as a node module.

## Usage

```javascript
// Outputs nodes with bridge tags to stdout
var processors = require('osm-qa-tiles-processors');
processors.bridgeOnNode('./osm.mbtiles', [-122.1, 36.9, -121.9, 37.0], function() {
    console.log('done');
});
```

## Available processors

### Bridge tag on node 

Identifies invalid nodes with [`bridge=*` tags](http://wiki.openstreetmap.org/wiki/Key:bridge) and sends them to `stdout`.

```javascript
processors.bridgeOnNode(mbTilesFile, boundingBox);
```

### Filter by date

Creates a new MBTiles file with only tiles newer than given date.

```javascript
processors.filterTime(mbTilesFile, boundingBox);
```

### Filter by users

Creates a new MBTiles file with only tiles containing geometries by given users.

```javascript
processors.filterUsers(mbTilesFile, boundingBox);
```

### Missing highways in the US

Compares OpenStreetMap to US Tiger data and outputs difference as geojson files to stdout.

```javascript
processors.missingHighwaysUS(mbTilesFileOSM, mbTilesFileTIGER, boundingBox);
```

### Missing layer tag on bridges

Identifies bridges with a missing [`layer tag`](http://wiki.openstreetmap.org/wiki/Key:layer) and sends them to `stdout`.

```javascript
processors.missingLayerBridges(mbTilesFile, boundingBox);
```

### Untagged ways

Identifies ways with no tags at all and sends them to `stdout`.

```javascript
processors.untaggedWays(mbTilesFile, boundingBox);
```

## Test

```sh
npm install & npm test
```
