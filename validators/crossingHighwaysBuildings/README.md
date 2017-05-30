### Description

This validator detects all the highways that intersect with buildings
![image](https://cloud.githubusercontent.com/assets/1152236/19428413/abdc74b0-9467-11e6-8b35-f8c17af6b14b.png)

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint crossinghighwaysbuildings peru.mbtiles > peru.json`

### How to fix the error

- If a highway and a building are crossing each other, align them to avoid the crossing.
- If the highway that go through a building have walls to all sides, add the `tunnel=building_passage` tag. Consider to join at the entry and exit points of the building and check if the `layer=*` is the same for both features.
- If the building is opened at least on one side, add the `covered=yes` tag. Consider to join the features at the entry and end points of the building and check if the layer is the same for both features.

#### Common issues

![building](https://cloud.githubusercontent.com/assets/12261974/25731321/d2c32656-310a-11e7-97ec-a8b88bbef051.gif)
_Split the way, add `tunnel=building_passage` tag._

![covered](https://cloud.githubusercontent.com/assets/12261974/25731148/4eea5e54-3109-11e7-8300-650aee030cb7.gif)
_Split the way, add `covered=yes` tag._

![align](https://cloud.githubusercontent.com/assets/12261974/25731192/ced7f5ae-3109-11e7-9f2d-69ace3dffae6.gif)
_Align the building and/or highway._
