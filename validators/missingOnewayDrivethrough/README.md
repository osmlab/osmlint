### Description

Detects missing `oneway=yes` for `highway=service`; `service=drive-through`.
According to the OpenStreetMap [wiki](https://wiki.openstreetmap.org/wiki/Tag:service%3Ddrive-through), "drive-throughs are typically `oneway=yes`".

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint missingonewaydrivethrough --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix this error

* Inspect the imagery if the highway is a drive-through (other sources such as OpenStreetCam, Mapillary and Bing Streetside can also help).
* Add `oneway=yes` for confirmed drive-troughs.
* Remove `service=drive-through` if it's not a drive-through.

