#### Description

This validator detects all polygons that have the same name that a near point. Nodes must be deleted.  

![image](https://cloud.githubusercontent.com/assets/10425629/21997330/c061b13e-dbfc-11e6-9b72-ee94251effce.png)


#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint doubledplaces --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
