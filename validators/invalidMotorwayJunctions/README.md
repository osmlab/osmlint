#### Description

Check wrong ref tah in `motorway_junction`

-  Wrongly mapped, ref=*, noref=yes
-  When there are multiple ref’s for a junction, it should be assigned with ref:left=* and ref:right=*
- `ref` elements must match with  `ref:right` and `ref:left` value

#### Usage

`osmlint deprecatehighways peru.mbtiles`