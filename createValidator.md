### How do I create a new validator?

- Clone this repository

```sh
git clone https://github.com/osmlab/osmlint.git
cd osmlint
npm install
```

- Check if all tests pass before making your changes with npm test

- Create a new test file in the directory `test/` and a fixture file in the directory `test/fixtures/`
  
    *e.g*
    - Test file: `deprecatehighways.test.js`
    - Fixture file: `deprecatehighways.mbtiles`

 `deprecatehighways.mbtiles` could be a [country file](http://osmlab.github.io/osm-qa-tiles/country.html), or use [mbtiles-extracts](https://github.com/mapbox/mbtiles-extracts) to get a small size of mbtiles, usually for the app we use this tool to add mbtiles fixtures

- Create a copy of folder `validators/01_dir_template` and then rename it with the validator name , 

  
    e.g  `deprecateHighways`

- Start writing the validator

- Add the validator in `index.js`.

  'deprecatehighways': require('./validators/deprecateHighways')

- Execute the validator 

`osmlint deprecatehighways --bbox="[7.4, 43.7, 7.4, 43.7]" --zoom=12 osm.mbtiles`


- Write the test and execute it with `npm test`
