#### Description

This validator detects strange layers in objects. e.g: `layer=1` in a tunnel or `layer=-1` in a bridge.

![image](https://cloud.githubusercontent.com/assets/1152236/16308936/8bc52230-392c-11e6-9d97-dd97fdd83ee0.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a [country](http://osmlab.github.io/osm-qa-tiles/country.html) that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint strangelayer --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
