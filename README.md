## AHB Region 3PG Model Runner

Run the [AHB 3PG model](https://github.com/CSTARS/poplar-3pg-model) over every
[pixel in the AHB Region](https://fusiontables.google.com/DataSource?docid=1hV9vQG3Sc0JLPduFpWJztfLK-ex6ccyMg_ptE_s).

By default, the cached weather an soil data will be used, no DB connection required.  Alternatively 
you can connect the database and retrieve data from SQL functions.

### Init

```bash
git clone https://github.com/cstarts/ahb-region-3pg-model-runner
cd ahb-region-3pg-model-runner && npm install
```

## Use

from inside repo dir

```bash
node index.js
```

Flags/options list
```bash
> node index.js --help

  Usage: index [options]

  Options:

    -h, --help                          output usage information
    -V, --version                       output the version number
    -p, --plant-date [YYYY-MM-DD]       Plant Date.  Default: 2016-10-20
    -f, --first-coppice [YYYY-MM-DD]    First Coppice Date.  Default: 2018-10-02
    -i, --irrigate                      Irrigate Poplar.  Default: False
    -m, --months-to-run [number]        How long to grow for. Default: 240
    -d, --use-db [path/to/config.json]  DB connection info. (optional)
    -o, --output [filename]             File to export to.  Default: export
```