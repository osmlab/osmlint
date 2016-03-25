#### Description

This validator detects all the highways that intersect with waterways. These sections are usually tagged as `bridge=yes`.

![image](https://cloud.githubusercontent.com/assets/10425629/13934558/d234934a-ef80-11e5-989f-2d69699517e2.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint crossingwaterwayshighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
