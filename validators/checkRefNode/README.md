#### Description

Check wrong ref tah in `motorway_junction`
-  Wrongly mapped, ref=*, noref=yes
-  When there are multiple ref’s for a junction, it should be assigned with ref:left=* and ref:right=*
- `ref` elements must match with  `ref:right` and `ref:left` value
#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint deprecatehighways peru.mbtiles > peru.json`
