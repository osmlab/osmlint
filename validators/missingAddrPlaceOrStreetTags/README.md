#### Description

Detecting missing `addr:place` or `addr:street` tags on address which has `addr:housenumber` according http://wiki.openstreetmap.org/wiki/Key:addr

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint missingaddrplaceorstreettags peru.mbtiles > peru.json`
