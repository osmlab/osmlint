### Description

This validator detects all the buildings that has building:part=yes and building=yes tag.

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint buildingpartyes peru.mbtiles > peru.json`

### How to fix this error

According to the satellite imagery delete one of the tags, `building:part=yes` or `building=yes tag`, due to these can't go together.

