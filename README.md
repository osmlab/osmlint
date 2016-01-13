# OSM Lint

_Work in progress and changing fast._

Validate OpenStreetMap data with [OSM QA Tiles](http://osmlab.github.io/osm-qa-tiles/). OSM Lint is a selection of validators built with [TileReduce](https://github.com/mapbox/tile-reduce) for validating OSM QA Tiles. Use from the command line or as a node module.

## Installation

```sh
git clone https://github.com/osmlab/osmlint.git
cd osmlint
npm install -g && npm link
```

## Usage

### Command line

```sh
osmlint bridgeonnode --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=15 osm.mbtiles
```

### Javascript

```javascript
// Outputs nodes with bridge tags to stdout
require('osmlint').bridgeOnNode({bbox: [-122.1, 36.9, -121.9, 37.0], zoom: 15}, './osm.mbtiles', function() {
    console.log('done');
});
```

## Available validators

See [`validators.txt`](https://github.com/osmlab/osmlint/blob/master/validators.txt).

## Test

```sh
npm install & npm test
```
