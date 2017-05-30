### Description

This validator detects all the bridges that does not have the tag `layer=*`.  

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint missinglayerbridges --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix this error

Fix this error by:

- Checking satellite imagery/Mapillary to make sure a bridge is visible:
  - If a bridge is visible add `layer=1` tag. For complex intersections add the correct `layer=` value based on the overlap order
  - If bridge does not exist and there are no crossing ways, remove the `bridge` tag

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/16427723/3bf762b6-3d34-11e6-90dc-9f64c7a551d9.png)

![image](https://cloud.githubusercontent.com/assets/10425629/16427764/78b34e2c-3d34-11e6-9ebd-0aa9d35ffc2c.png)

![image](https://cloud.githubusercontent.com/assets/10425629/16427843/ed02b1fa-3d34-11e6-9cff-4aa27e35683a.png)
_Add `layer=1` tag_
