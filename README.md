## AHB Region 3PG Model Runner

### Init

```bash
git clone https://github.com/cstarts/ahb-region-3pg-model-runner
cd ahb-region-3pg-model-runner && npm install
```

## Using

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
    -d, --use-db [path/to/config.json]  DB connection info.
    -o, --output [filename]             File to export to.  Default: export
```