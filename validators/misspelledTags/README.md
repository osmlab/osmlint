#### Description

This validator detects objects that are misspelled. 

![image](https://cloud.githubusercontent.com/assets/10425629/13935875/c9155090-ef87-11e5-9211-099c083f24e2.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint misspelledtags --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
