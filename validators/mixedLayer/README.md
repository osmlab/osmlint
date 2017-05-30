### Description

This validator  detects ways which are intersecting in a node and they have a tag with different layers

![image](https://cloud.githubusercontent.com/assets/1152236/16323375/f9f87e6c-396f-11e6-9b1b-0f4adbc14c8d.png)


### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint mixedLayer --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix this error

Remove incorrect layer=* tag from major or minor highways.

- If the highway has `layer=*` without `bridge` or `tunnel`, inspect imagery to make one of the following fix:
  - Remove `layer` if the road is on the ground surface without any crossing with any other way
  - Add missing `bridge=yes` or `tunnel=yes` if  visible on the imagery

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/16428186/5c9a2d58-3d36-11e6-8f41-ff818d49b09d.png)
_Delete `layer=-1`_

![image](https://cloud.githubusercontent.com/assets/10425629/16428220/86090d8a-3d36-11e6-9022-0f90312f2738.png)
_Delete `layer=1`_