#### Description

Find missing roads on osm which exist in tiger 2015.

1. [OSM QA Tiles for USA](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/united_states_of_america.mbtiles.gz)
2. [TIGER](https://s3.amazonaws.com/mapbox/tile-reduce-watchbot/mbtiles/tiger2015.mbtiles)


#### Usage

`osmlint tigerdelta --box=[-126.70395,24.536232,-66.498871,49.446059] --zoom=12 united_states_of_america.mbtiles tiger2015.mbtiles`
