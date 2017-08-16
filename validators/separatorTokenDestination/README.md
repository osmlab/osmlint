### Description

This validator detects invalid separator token in tags such as   `destination` , `destination:ref` or `destination:street`
The correct separator in these  tags is semicolon `;`

Example: 
* `destination`=` Mila Street | Mariposa Street `
* `destination:ref`=`3A|3B`

### Usage

Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a [country](http://osmlab.github.io/osm-qa-tiles/country.html) that you are interested in.
For example, to run for peru.mbtiles: osmlint separatortokendestination --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles

### How to fix this error

Correct the separator token  in highways such as Motorway, primary,primary_link, secondary_link, secondary  destination, destination:street an destinaton:ref

If the `destination:street` has `Mariposa Street | Mila Street` change it by `Mariposa Street ; Mila Street`
If the `destination:ref` has 3A| 3B change it by `3A; 3B`
If the `destination` has  `Lima | Cusco` change iy by `Lima;Cusco`


### Common issues

![example2](https://user-images.githubusercontent.com/8483644/29380997-5cd9849c-828d-11e7-842d-f0ba864edd9c.png)
destination:ref  has `SH7|SH59`  the corrected separator is `SH7;SH59`