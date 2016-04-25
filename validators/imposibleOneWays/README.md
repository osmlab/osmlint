#### Description

This validator detects highways that overlap other highways without a shared node.

![image](https://cloud.githubusercontent.com/assets/10425629/13935563/f63ca7c8-ef85-11e5-97d7-ce6b88e935ac.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint overlaphighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
