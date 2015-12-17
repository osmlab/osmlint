# OSM Lint

*Validate OSM data with TileReduce and OSM QA Tiles*

Data analysis with [OSM QA Tiles](http://osmlab.github.io/osm-qa-tiles/)! TileReduce processors for validating OSM QA Tiles wrapped up as a node module.

## Installation

```sh
git clone https://github.com/osmlab/osmlint.git
cd osmlint
npm install && npm link
```

## Usage

### Command line

```sh
osmlint bridgeonnode --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=15 osm.mbtiles
```

### Javascript

```javascript
// Outputs nodes with bridge tags to stdout
require('osmlint').bridgeOnNode([-122.1, 36.9, -121.9, 37.0], 15, './osm.mbtiles', function() {
    console.log('done');
});
```

## Available validators

See [`validators.txt`](https://github.com/osmlab/osmlint/blob/master/validators.txt).

## Test

```sh
npm install & npm test
```
