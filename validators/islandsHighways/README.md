#### Description

This validator detects highways that are disconnected from other highways in the same area. 

![image](https://cloud.githubusercontent.com/assets/10425629/13935965/64204f4a-ef88-11e5-9f1a-7e7047df8197.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint unconnectedhighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
