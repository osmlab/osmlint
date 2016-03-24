#### Description
This validator detects ways that don't have any tag. 


![image](https://cloud.githubusercontent.com/assets/10425629/13936161/c0c330fe-ef89-11e5-8c1f-9bb1232459f2.png)


#### Example
You can obtain all the untagged ways in Peru, into a .json file

**Process:**
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint untaggedways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
