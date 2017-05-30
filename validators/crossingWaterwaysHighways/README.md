### Description

This validator detects all the highways that intersect with waterways. These sections are usually tagged as `bridge=yes`.

![image](https://cloud.githubusercontent.com/assets/10425629/13934558/d234934a-ef80-11e5-989f-2d69699517e2.png)

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint crossingwaterwayshighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix the error

Fix by adding bridge, tunnel, layer or ford.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/16160564/8dca2352-348e-11e6-8e63-81198d680083.png)
_Add `bridge=yes` and `layer=1` tags_

![image](https://cloud.githubusercontent.com/assets/10425629/16160787/8ac1c57e-348f-11e6-9909-ff2598af5516.png)
_Add `tunnel=culvert` and `layer=-1` tags_

![image](https://cloud.githubusercontent.com/assets/10425629/16160637/e75ffe5a-348e-11e6-9f1d-46b506b49ace.png)
_Move points so bridge cover completely the river_

![image](https://cloud.githubusercontent.com/assets/10425629/16160823/c9c22282-348f-11e6-8364-05082850bffa.png)
_Reshape the lake_
