#### Description

This validator detects all the objects that were created or modified by a set of user. The usernames are [listed here](https://github.com/osmlab/osmlint/blob/master/validators/filterUsers/users.json).

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint filterusers --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
