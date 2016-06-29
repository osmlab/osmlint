#### Description

This validator  detects ways which are intersecting in a node and they have a tag with different layers

![image](https://cloud.githubusercontent.com/assets/1152236/16323375/f9f87e6c-396f-11e6-9b1b-0f4adbc14c8d.png)


#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint mixedLayer --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
