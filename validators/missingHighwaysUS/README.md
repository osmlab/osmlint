# Missing highway names in USA

This analyzer find unnamed highways  where is possible add a name from Tiger.

#### List of Mbtiles
- [USA](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/united_states_of_america.mbtiles.gz) or the [world](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz) 
- [tiger](https://s3.amazonaws.com/mapbox/tile-reduce-watchbot/mbtiles/tiger2015.mbtiles)


#### bbox

`[-126.70395,24.536232,-66.498871,49.446059]`


#### Run

`osmlint missinghighwaysus --box="[7.4, 43.7, 7.4, 43.7]" --zoom=15 osm.mbtiles tiger.mbtiles`