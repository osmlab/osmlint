#### Description

This validator detects nodes which end near a highway which are not connected.  

![image](https://cloud.githubusercontent.com/assets/10425629/13933529/9b098f74-ef7b-11e5-88d9-b64d1fe5b7ba.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint nodeendingnearhighway --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
