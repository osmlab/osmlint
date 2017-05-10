### Description

Filter all invalid turnlanes, considering the number of lanes and `turn:lanes:*` number matching

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint invalidturnlanes --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix the error

Fix the number of lanes and the `turn:lanes` tag. By: 
- Checking if the number of `lanes` match with the sum of `lanes:backward`\+ `lanes:forward` + `lanes:both_ways`
- Checking if the number of `lanes`, `lanes:backward`, `lanes:forward` and `lanes:both_ways` match with the lanes number of `turn:lanes:backward`, `turn:lanes:forward` and `turn:lanes:both_ways`
- Checking the order of the `turn:lanes:*` which should be [`left-through-right`](http://wiki.openstreetmap.org/wiki/Key:turn#Turning_indications_per_lane)

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/16020605/7e124150-3174-11e6-8719-ad5da4d1b8d5.png)
_Tag should be `turn:lanes=left|left;through`_

![image](https://cloud.githubusercontent.com/assets/10425629/16020738/f939a71a-3174-11e6-8013-d35dd26c0f37.png)
_Tag should be `lanes=5`_

![image](https://cloud.githubusercontent.com/assets/10425629/16020783/324d0b3c-3175-11e6-8db5-a1bc36ac05b2.png)
_Tag should be deleted since it's very clear this doesn't have any sign in the street and this is not  `oneway=yes`_

![image](https://cloud.githubusercontent.com/assets/10425629/16020912/b2bef5a0-3175-11e6-9315-d06887472f0c.png)
_Tag should be `turn:lanes=left||`_
