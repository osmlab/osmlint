#### Description
This validator detects all the bridges that don't have the tag `layer=*`.  

![image](https://cloud.githubusercontent.com/assets/10425629/13935335/d886969a-ef84-11e5-9155-2a9e95088474.png)

#### Example
You can obtain all the bridges with layer tag missing in Peru, into a .json file

**Process:**
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint missinglayerbridges --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
