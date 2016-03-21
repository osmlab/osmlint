#### Description
This validator detects all the objects which were created or modified into the last 7 days.

![image](https://cloud.githubusercontent.com/assets/10425629/13935002/12312682-ef83-11e5-93a6-84ddf07dedaf.png)

#### Example
You can obtain all data that was addes or edited into the last 7 days in Peru, into a .json file

**Process:**
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint filterdate --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
