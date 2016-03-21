#### Description
This validator detects highways which are traced over another highway.  

![image](https://cloud.githubusercontent.com/assets/10425629/13935563/f63ca7c8-ef85-11e5-97d7-ce6b88e935ac.png)

#### Example
You can obtain all the overlapped highways in Peru, into a .json file

**Process:**
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint overlaphighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
