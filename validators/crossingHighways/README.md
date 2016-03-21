#### Description
This validator detects all the highways that intersect each other. Highways need to be joined by a node.  

![image](https://cloud.githubusercontent.com/assets/10425629/13934247/18cb19ca-ef7f-11e5-9429-f36dcec27611.png)

#### Example
You can obtain the intersection of highways without a node in Peru, into a .json file

Process:
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint crossinghighways --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
