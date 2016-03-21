#### Description
This validator detects areas that aren't closed. 

![image](https://cloud.githubusercontent.com/assets/10425629/13935875/c9155090-ef87-11e5-9211-099c083f24e2.png)


#### Example
You can obtain all the unclosed areas in Peru, into a .json file

**Process:**
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint unclosedways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
