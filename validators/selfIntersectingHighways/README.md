### Description

This validator detects highways that intersect with itself. 

![image](https://cloud.githubusercontent.com/assets/10425629/13935784/34b671c2-ef87-11e5-8f0a-1d09fdebe609.png)

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint selfintersectinghighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix this error

Split or disengage major o minor self-intersect way.

- If intersecting with the starting or ending point, split the way  according to satellite imagery.
- If intersecting with by a middle node, disengage the last one and reshape the way.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/16428868/818df402-3d39-11e6-988f-4571b0ed32ee.png)
_Split the way according to satellite imagery_

![image](https://cloud.githubusercontent.com/assets/10425629/16428895/a794f736-3d39-11e6-9924-c567915ebf9e.png)
_Disengage the intersecting node and reshape the way_