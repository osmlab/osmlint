#### Description

This validator detects all the highways that have the name property of 'No Name' or 'No-Name' or 'NoName' (case insensitive).

Examples: 

- [http://www.openstreetmap.org/way/39864464](http://www.openstreetmap.org/way/39864464)
- [http://www.openstreetmap.org/way/63467130](http://www.openstreetmap.org/way/63467130)
- [http://www.openstreetmap.org/way/338318718](http://www.openstreetmap.org/way/338318718)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint noname peru.mbtiles > peru.json`
