### Description

This validator detects highways which are deprecated, from http://wiki.openstreetmap.org/wiki/Deprecated_features

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint deprecatehighways peru.mbtiles > peru.json`

### How to fix the error

Identify the `highway=*` tag which is deprecated considering the list: `http://wiki.openstreetmap.org/wiki/Deprecated_features`, and change it with an alternative tag.

