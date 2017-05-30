### Description

Find new street names by comparing latest US Census Bureau TIGER data to OpenStreetMap. This validator uses two MBTiles sets:

1. [OSM QA Tiles for USA](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/united_states_of_america.mbtiles.gz)
2. [TIGER](https://s3.amazonaws.com/mapbox/tile-reduce-watchbot/mbtiles/tiger2015.mbtiles)


### Usage

`osmlint missingnamehighwaysus --box=[-126.70395,24.536232,-66.498871,49.446059] --zoom=12 united_states_of_america.mbtiles tiger2015.mbtiles`

### How to fix this error

Add the `name=*` tag to an unnamed US road considering the TIGER layer.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/25923869/359a9400-35a5-11e7-9b23-ec8d7395042a.png)
_Add the visible name from TIGER layer_
