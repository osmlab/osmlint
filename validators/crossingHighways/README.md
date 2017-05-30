### Description

This validator detects all the highways that intersect each other. Highways must be connected by a node.  

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint crossinghighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix the error

Review and repair highway intersections that are not connected to a node. By: 

- Connecting _level_ intersections of two highways with a node where they are not connected. This excludes bridges and tunnels. Confirm an intersection is level from satellite imagery.
- According to the satellite imagery, adding `bridge=yes` and `layer=*` or `tunnel=yes` and `layer=-1`.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/1152236/8833519/bda5b60a-3074-11e5-9342-4648a011f97d.png)
_Add `layer=1` to the bridge_

![image1](https://cloud.githubusercontent.com/assets/1152236/8806362/f2d9f496-2f9b-11e5-8f97-83f73cff4b12.png)
_Join the node to the road_

![image2](https://cloud.githubusercontent.com/assets/1152236/8834208/93750bd4-3078-11e5-9e19-47003b9bb005.png)
_Add `tunnel=yes` and `layer`=-1_

![image3](https://cloud.githubusercontent.com/assets/1152236/8806289/985f6fb4-2f9b-11e5-9c2e-78e72159b239.png)
_Add a node to connect both roads_

