### Description

This validator detects strange layers in objects. e.g: `layer=1` in a tunnel or `layer=-1` in a bridge.

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a [country](http://osmlab.github.io/osm-qa-tiles/country.html) that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint strangelayer --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix this error

Correct the layer=* tag of bridges and tunnels. 

- If the bridge has `layer=-1`, change it by `layer=1`, inspect imagery to fix the level.
- If the tunnel has `layer=1`,  change it by `layer=-1`, inspect imagery to fix the level.

#### Common issues

![image](https://cloud.githubusercontent.com/assets/10425629/16776384/c0019800-482a-11e6-9345-e39b87a78392.png)
_Correct `layer` tag of the tunnel as `layer=-1` instead of `layer=1`_

![image](https://cloud.githubusercontent.com/assets/10425629/16776486/281880fc-482b-11e6-9af4-bd632d739b20.png)
_Correct `layer` tag of the bridge as `layer=1` instead of `layer=-1`_