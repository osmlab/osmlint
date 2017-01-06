#### Description

Find missing roads on osm which exist in TIGER 2016.

1. [OSM QA Tiles for USA](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/united_states_of_america.mbtiles.gz)
2. [TIGER](https://s3.amazonaws.com/mapbox/tile-reduce-watchbot/mbtiles/tiger2016.mbtiles)


#### Usage

```
osmlint tigerdelta --bbox="[-125.20432,24.200980,-66.581268,49.320899]" --zoom=12 united_states_of_america.mbtiles tiger2016.mbtiles > tiger.json
```
