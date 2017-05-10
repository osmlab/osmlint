### Description

This validator detects highways that are disconnected from other highways in the same area. 

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint unconnectedhighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix this error

Connect the road to a near highway.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/14218209/61d21730-f818-11e5-8d23-d780ba6da0d7.png)

![image](https://cloud.githubusercontent.com/assets/10425629/14218228/84b3c582-f818-11e5-8c9b-50a2552dd341.png)
