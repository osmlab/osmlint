### Description

Check if highways with `oneway=yes` are not blocked because of the direction of the roads connected to it.

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: ` osmlint impossibleoneways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" peru.mbtiles`

### How to fix this error

Fix this error by: 

- Reversing the highway pressing `R`
- Ensuring the way has `oneway=yes` instead of `oneway=-1`

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/16501066/3612f4f6-3ecd-11e6-97aa-ee60a5153c85.png)
_Reverse the way and make sure it has `oneway=yes` instead of `oneway=-1` tag_

![image](https://cloud.githubusercontent.com/assets/10425629/16501774/b58e0c90-3ed0-11e6-9862-ffd712485ed0.png)
_Join all nodes_
