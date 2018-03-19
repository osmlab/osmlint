#### Description

This validator finds incomplete residential buildings based on the following tag criteria:
* `building=residential`
* `wall=*`
* `roof` or `roof:material`

#### Output
* Writes all incomplete residential buildings to stdout
* Returns a stats object with the following: 
```
{
  'buildingYes': count,
  'buildingResidential': count,
  'buildingResidentialIncomplete': count,
  'totalBuildings': count
}
```
#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint incompleteresidentialbuildings peru.mbtiles > peru.json`
