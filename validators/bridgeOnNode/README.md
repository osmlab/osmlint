#### Description
This validator detects all nodes which have the tag `bridge=yes`. Nodes haven't have this tag.

![image](https://cloud.githubusercontent.com/assets/10425629/13934129/741aff3a-ef7e-11e5-8ad8-fa325d0bb778.png)

#### Example
You can obtain all nodes that have the tag `bridge=yes` in Peru, into a .json file

Process:
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Running in the terminal:  
`osmlint bridgeonnode --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
