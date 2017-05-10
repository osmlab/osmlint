### Description

This validator detects all nodes which have the tag `bridge=yes`. The [bridge tag](http://wiki.openstreetmap.org/wiki/Key:bridge) is only applicable to Ways.

![image](https://cloud.githubusercontent.com/assets/10425629/13934129/741aff3a-ef7e-11e5-8ad8-fa325d0bb778.png)

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint bridgeonnode --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix the error

Delete from the node the `bridge=*` tag, but also check if the node contains another tags related to the `bridge` one such as `layer` or `bridge:*=*`

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/25923462/4725fb80-35a3-11e7-80cc-d703b9ca7bce.png)
_Delete the `bridge=yes` and `layer=1` tags_