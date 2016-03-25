#### Description

This validator detects ways that does not have any tags. 

![image](https://cloud.githubusercontent.com/assets/10425629/13936161/c0c330fe-ef89-11e5-8c1f-9bb1232459f2.png)


#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint untaggedways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
