### Description
 
From https://github.com/osmlab/osmlint/issues/116

Detecting motorway links without oneway tag , which is connected to a highway=motorway with a oneway

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: ` osmlint missingoneways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" peru.mbtiles`

### How to fix the error

Add missing `oneway=yes` tag to the `highway=motorway_link`.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/16496434/70403096-3eb7-11e6-988a-afa2a290c96a.png)

![image](https://cloud.githubusercontent.com/assets/10425629/16496452/8c173206-3eb7-11e6-9e46-b94138ba4f78.png)

_Add `oneway=yes`_ tag.