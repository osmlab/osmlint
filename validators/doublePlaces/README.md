### Description

This validator detects cities that have the same attributes.


### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint doubleplaces --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix the error

When the similar feature are: 

- Two nodes, combine the tags into one and set the places in the center of these nodes.

-A polygon and a node, create a relation `type=boundary` where the polygon will be the `outer` part and the point will be the `admin_centre` part, and then move the attributes of the point and polygon into the relation. The point only should have `name` and `place` tags.

#### Common issues

![screenshot from 2017-04-28 11-18-49](https://cloud.githubusercontent.com/assets/1152236/25537626/de16c8a6-2c04-11e7-84c3-6c0a37254b5a.png)
_Two points with the same tags `name:*` and `place:*`_

![screenshot from 2017-04-28 11-12-14](https://cloud.githubusercontent.com/assets/1152236/25537628/e01ba43c-2c04-11e7-8b34-6676e9ee5158.png)
_A point and a polygon,  with the same tags `name:*` and `place:*`_


