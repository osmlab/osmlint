#### Description

Find new street names by comparing latest US Census Bureau TIGER data to OpenStreetMap. This validator uses two mbtiles sets:

1. [OSM QA Tiles for USA](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/united_states_of_america.mbtiles.gz)
2. [TIGER](https://s3.amazonaws.com/mapbox/tile-reduce-watchbot/mbtiles/tiger2015.mbtiles)


#### Usage

`osmlint missingnamehighwaysus --box=[-126.70395,24.536232,-66.498871,49.446059] --zoom=12 united_states_of_america.mbtiles tiger2015.mbtiles`
