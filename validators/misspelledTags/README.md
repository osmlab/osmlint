#### Description

This validator detects objects that are misspelled. 

![image](https://cloud.githubusercontent.com/assets/10425629/22605862/bf03e10a-ea1f-11e6-89e2-b1b24eff974d.png)

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint misspelledtags --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`
