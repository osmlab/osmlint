### Description

Detects highway nodes (start/end) near another highway and does not connect.  

### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint nodeendingnearhighway --bbox="[-85.348663,-19.664209,-64.606476,1.3831570]" --zoom=12 peru.mbtiles`

### How to fix the error

Connect roads that are motorable and end near another road but not connected to it. By: 

- Joining disconnected roads and junctions verifiable from satellite imagery (Do not make connections where there is a possibility of a fence or barrier in between the roads)

#### Common issues
![imagen 1](https://cloud.githubusercontent.com/assets/10425629/8985611/e3ca6ec8-369d-11e5-8c0b-350e67f9b749.png)

_Select the nodes and merge them_

![imagen 2](https://cloud.githubusercontent.com/assets/10425629/8985652/0a2eb9de-369e-11e5-8621-72255117efd8.png)
_Select the node and join it to the road_

