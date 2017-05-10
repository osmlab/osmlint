### Description

This validator detects highways that overlap other highways without a shared node.

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint overlaphighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix this error

Delete the overlapped street based on the number of attributes, the age of the street and the experience of the mapper who traced it.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/14258245/31f48a88-fa67-11e5-8211-16718e5f495f.png)

![image](https://cloud.githubusercontent.com/assets/10425629/14258256/44269520-fa67-11e5-8046-f8f32adb370c.png)

