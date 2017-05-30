### Description

Detecting traffic lights which are unconnected from highways.

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint trafficlightsunconnected peru.mbtiles > peru.json`

### How to fix this error

If its a simple junction, merge the traffic sign node to the junction.
