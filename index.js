var program = require('commander');

const msPerYear = 1000 * 60 * 60 * 24 * 356;
var defaultDate =  new Date().toISOString().replace(/T.*/,'');
var dateCoppiced = new Date(new Date().getTime() + (msPerYear * 2)).toISOString().replace(/T.*/,'');

program
  .version(require('./package.json').version)
  .option('-p, --plant-date [YYYY-MM-DD]', `Plant Date.  Default: ${defaultDate}`)
  .option('-f, --first-coppice [YYYY-MM-DD]', `First Coppice Date.  Default: ${dateCoppiced}`)
  .option('-i, --irrigate', 'Irrigate Poplar.  Default: False')
  .option('-m, --months-to-run [number]', 'How long to grow for. Default: 240')
  .option('-d, --use-db [path/to/config.json]', 'DB connection info.')
  .option('-o, --output [filename]', 'File to export to.  Default: export')
  .option('-e, --dump-errors', 'Dump pixel errors to file')
  .parse(process.argv);

require('./lib/options')(program);

var o = {};
for( var key in program ) {
  if( key[0] === '_' ) continue;
  if( program[key] && typeof program[key] !== 'object' && typeof program[key] !== 'function' ) {
    o[key] = program[key];
  }
}

console.log(`Arguments:
${JSON.stringify(o, '  ', '  ')}
`);


require('./lib');