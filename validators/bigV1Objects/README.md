### Description

This validator detects all the large new objects created that has version 1 in the last 3 days

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint bigv1objects peru.mbtiles > peru.json`

### How to fix this error

Fix the shape and tags of the features according to the satellite imagery.

#### Common issues:

![image](https://cloud.githubusercontent.com/assets/10425629/25972954/b8b810ca-3667-11e7-88e5-39827d5482b5.png)
_Improve the shape of the wetland_