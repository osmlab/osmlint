#### Description
This validator detects nodes which end near a highway, but they need to be connected.  

![image](https://cloud.githubusercontent.com/assets/10425629/13933529/9b098f74-ef7b-11e5-88d9-b64d1fe5b7ba.png)

#### Example
You can obtain all nodes that end near a highway in Peru, into a .json file

Process:
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint nodeendingnearhighway --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
