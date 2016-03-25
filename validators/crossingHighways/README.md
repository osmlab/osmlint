#### Description

This validator detects all the highways that intersect each other. Highways must be connected by a node.  

![image](https://cloud.githubusercontent.com/assets/10425629/13934247/18cb19ca-ef7f-11e5-9429-f36dcec27611.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint crossinghighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
