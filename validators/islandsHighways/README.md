#### Description
This validator detects highways that are disconnected of another highway. 

![image](https://cloud.githubusercontent.com/assets/10425629/13935965/64204f4a-ef88-11e5-9f1a-7e7047df8197.png)


#### Example
You can obtain all the disconnected highways in Peru, into a .json file

**Process:**
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint unconnectedhighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
