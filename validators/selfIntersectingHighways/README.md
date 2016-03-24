#### Description
This validator detects highways that intersect itself. 

![image](https://cloud.githubusercontent.com/assets/10425629/13935784/34b671c2-ef87-11e5-8f0a-1d09fdebe609.png)

#### Example
You can obtain all the selfintersected highways in Peru, into a .json file

**Process:**
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint selfintersectinghighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
