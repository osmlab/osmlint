#### Description

This validator detects broken relations.

#### Usage

1. Data : https://s3.amazonaws.com/mapbox/osm-qa-tiles/multipolygon/latest.country/peru.mbtiles.gz

2. `osmlint nonclosedrelations --bbox="[-74.392548,-13.226243,-74.228439,-13.088842]" peru.mbtiles>peru.json`
