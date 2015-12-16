# Missing highway names in USA

This analyzer find unnamed highways  where is possible add a name from Tiger.

#### List of Mbtiles
- [USA](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/united_states_of_america.mbtiles.gz) or the [world](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz) 
- [tiger](https://s3.amazonaws.com/mapbox/tile-reduce-watchbot/mbtiles/tiger2015.mbtiles)


#### BBox

`[-126.70395,24.536232,-66.498871,49.446059]`


#### Run

`node index.js --area [-126.70395,24.536232,-66.498871,49.446059] --mbtiles  /path/to/latest.planet.mbtiles --mbtiles_tiger /path/to/tiger2015.mbtiles`