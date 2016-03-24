#### Description
This validator detects all the highways that intersect with waterways.  Mostly, highways need to be splitted and tagged with `bridge=yes`  

![image](https://cloud.githubusercontent.com/assets/10425629/13934558/d234934a-ef80-11e5-989f-2d69699517e2.png)

#### Example
You can obtain the intersection of highways with waterways in Peru, into a .json file

**Process:**
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint crossingwaterwayshighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
