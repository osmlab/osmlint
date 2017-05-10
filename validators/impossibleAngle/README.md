### Description

This validator detects highways with less likely turning angles. The threshold currently is less than 10 degrees.

![image](https://cloud.githubusercontent.com/assets/1152236/14332852/2f6b08d6-fc11-11e5-81c9-9dcf6ceaa7d9.png)

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a [country](http://osmlab.github.io/osm-qa-tiles/country.html) that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint impossibleangle --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix the error

Fix the nodes which make impossible angles on the road. By

- Deleting nodes that are piled up.
- Aligning nodes according to satellite imagery.
- Splitting the road according to satellite imagery.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/5991158/9045885/778eeebc-39ec-11e5-89d9-4002569a39c8.jpg)
_Delete irrelevant node_

![image](https://cloud.githubusercontent.com/assets/5991158/9045888/77925408-39ec-11e5-94fd-7261cd6d7227.jpg)
_Align the road if it's necessary and where there are GPS traces_

![image](https://cloud.githubusercontent.com/assets/10425629/18391178/bb390fda-7672-11e6-83a3-49952dc596fe.png)
_Split the way into two segments for each direction_

![image](https://cloud.githubusercontent.com/assets/10425629/18455208/392fc1de-790e-11e6-80d2-5b009565c68c.png)
_Not an error_