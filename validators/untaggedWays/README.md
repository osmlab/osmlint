### Description

This validator detects ways that does not have any tags. 

![image](https://cloud.githubusercontent.com/assets/10425629/13936161/c0c330fe-ef89-11e5-8c1f-9bb1232459f2.png)


### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint untaggedways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix this error

Add the respective tag according to the satelite imagery, use https://wiki.openstreetmap.org/wiki/Main_Page to identify the tags for each feature.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/25924067/691233fa-35a6-11e7-8aa8-fb15cc006c78.png)
_Add `building=yes` tag_