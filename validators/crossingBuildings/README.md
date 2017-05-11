### Description

This validator detects all the buildings that intersect each other. Buildings must be connected by nodes in one side.

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint crossingbuildings --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix the error

Review and repair buildings intersections by: 

- Aligning the buildings according to the satellite imagery.
- Joining nodes of the shared side.
- Adding  `building:level=*`
- Combining the buildings according to the satellite imagery
- Deleting extra building

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/25973711/e528cf7a-366a-11e7-8d0f-60cad7f4df60.png)
_Delete the extra building_

