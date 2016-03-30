#### Description

This validator detects all the bridges that does not have the tag `layer=*`.  

![image](https://cloud.githubusercontent.com/assets/10425629/13935335/d886969a-ef84-11e5-9155-2a9e95088474.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint missinglayerbridges --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
