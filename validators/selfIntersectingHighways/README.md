#### Description

This validator detects highways that intersect with itself. 

![image](https://cloud.githubusercontent.com/assets/10425629/13935784/34b671c2-ef87-11e5-8f0a-1d09fdebe609.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint selfintersectinghighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
