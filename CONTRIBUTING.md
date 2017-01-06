### How do I create a new validator?

- Clone this repository

```sh
$ git clone https://github.com/osmlab/osmlint.git --depth=1
$ cd osmlint
$ npm install
```

- Before making any changes, check if all tests pass by running `npm test`

- Create a new test file (in `test/`) and a new fixture file (in `test/fixtures/`)
  
    For example,
    - Test file: `deprecatehighways.test.js`
    - Fixture file: `deprecatehighways.mbtiles`

 The fixture could be a [country file](http://osmlab.github.io/osm-qa-tiles/country.html) or from [mbtiles-extracts](https://github.com/mapbox/mbtiles-extracts) to get a smaller file size. Usually we use `mbtiles-extracts` to add fixtures.

- Create a copy of template folder `validators/01_dir_template` and rename it with the name of your validator 
  
    e.g  `deprecateHighways`

- Write the validator

- Add the validator to `index.js`, like so
  
```
'deprecatehighways': require('./validators/deprecateHighways')
```

- To run the validator use

```
osmlint deprecatehighways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles
```

- Write tests and execute them with `npm test`