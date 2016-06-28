#### Description
 
From https://github.com/osmlab/osmlint/issues/116

Detecting motorway links without oneway tag , which is connected to a highway=motorway with a oneway

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: ` osmlint missingoneways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" peru.mbtiles`
