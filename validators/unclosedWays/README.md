### Description

This validator detects areas that are not closed. 

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint unclosedways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix this error

- If the highway has any tag for areas (i.e. `landuse` or `buildings`) delete this tag.
- If the area has a self-intersect node, disengage it and reshape the area.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/16502180/b50a18ac-3ed2-11e6-8314-1a8ff70574f0.png)
_Delete the `building=yes` tag_

![image](https://cloud.githubusercontent.com/assets/10425629/16502199/cc1efecc-3ed2-11e6-8204-c0fbff0a147a.png)
_Delete the irrelevant node_

![image](https://cloud.githubusercontent.com/assets/1152236/18569401/f6e828aa-7b67-11e6-8536-f0c1ba8ddbfc.png)