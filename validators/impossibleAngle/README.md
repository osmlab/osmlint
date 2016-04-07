#### Description

This validator detects highways with less likely turning angles. The threshold currently is less than 10 degrees.

![image](https://cloud.githubusercontent.com/assets/1152236/14332852/2f6b08d6-fc11-11e5-81c9-9dcf6ceaa7d9.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a [country](http://osmlab.github.io/osm-qa-tiles/country.html) that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint impossibleangle --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
