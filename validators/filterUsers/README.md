#### Description
This validator detects all the objects which were created or modified by a list of user. Those users should be listed in the `users.json` file.

#### Example
You can obtain all data that was added or edited by certain users in Peru, into a .json file

**Process:**
* Downloading [peru.mbtiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/peru.mbtiles.gz)

* Modified `users.json` file

* Running in the terminal:  
`osmlint filterusers --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles >peru.json`
