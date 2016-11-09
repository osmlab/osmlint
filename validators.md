# Available osmlint processors

#### osmlint bridgeonnode

  *Identifies invalid nodes with bridge=* tags and sends them to stdout.*

  `osmlint bridgeonnode --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint filterdate

  *Filters features added/modified and sends them to stdout.*

  `osmlint filterdate --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint filterusers

  *Filters features touched by a set of users and sends them to stdout.*

  `osmlint filterusers --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint missinghighwaysus

  *Compares OpenStreetMap to US Tiger data and outputs difference as geojson files to stdout.*

  `osmlint missinghighwaysus --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles tiger.mbtiles`

#### osmlint missinglayerbridges

  *Identifies bridges with a missing layer tag and sends them to stdout.*

  `osmlint missinglayerbridges --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint untaggedways

  *Identifies ways with no tags at all and sends them to stdout.*

  `osmlint untaggedways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint selfintersectinghighways

  *Identifies self intersecting highways.*

  `osmlint selfintersectinghighways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint unconnectedhighways

  *Identifies highway nodes ending near another highway, when the two highways don't intersect, and sends them to stdout.*

  `osmlint unconnectedhighways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint crossingwaterwayshighways

  *Identifies faulty intersections of waterways and highways and sends them to stdout.*

  `osmlint crossingwaterwayshighways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint crossinghighways

  *Identifies missing intersections when two highways cross each other and sends them to stdout.*

  `osmlint crossinghighways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint unclosedways

  *Identifies unclosed ways and sends them to stdout.*

  `osmlint unclosedways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint turnlanes

  *Identifies invalid turnlanes and sends them to stdout.*

  `osmlint turnlanes --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint tigerdelta

  *Identifies missing roads on osm which exist in TIGER 2015 and sends them to stdout.*

  `osmlint tigerdelta --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint strangelayer

  *Identifies strange layers in objects and sends them to stdout.*

  `osmlint strangelayer --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint overlaphighways

  *Identifies highways that overlap other highways without a shared node and sends them to stdout.*

  `osmlint overlaphighways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint mixedlayer

  *Identifies ways which are intersecting in a node and they have a tag with different layers and sends them to stdout.*

  `osmlint mixedlayer --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint missingoneways

  *Identifies motorway links without oneway tag , which is connected to a highway=motorway with a oneway and sends and them to stdout.*

  `osmlint missingoneways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint islandshighways

  *Identifies highways that are disconnected from other highways in the same area and sends them to stdout.*

  `osmlint islandshighways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint impossibleoneways

  *Identifies imposible one ways and sends them to stdout.*

  `osmlint impossibleoneways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint impossibleangle

  *Identifies highways with less likely turning angles. The threshold currently is less than 30 degrees and sends them to stdout.*

  `osmlint impossibleangle --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint fixmetag

  *Identifies all objects which has fixme tag and them to stdout.*

  `osmlint fixmetag --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`

#### osmlint deprecatehighways

  *Identifies highways which are deprecated and them to stdout.*

  `osmlint deprecatehighways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`
