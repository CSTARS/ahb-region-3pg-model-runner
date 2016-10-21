var async = require('async');
var fs = require('fs');
var path = require('path');
var options = require('./options')();
var collection = require('./collection');
var run3pgModel = require('./process');

var loaded = {};
var waiting = null;

collection.on('data-load', (e) => {
  loaded[e.px] = true;

  if( !waiting ) return;

  if( waiting.px === e.px ) {
    waiting.onReady();
    waiting = null;
  }
});

function run(px, callback) {
  if( loaded[px] ) {

    pxReadyRun(px, callback);

  } else {

    waiting = {
      px : px,
      onReady : function() {

        // let the waiting reference clear.
        setTimeout(() => {
          pxReadyRun(px, callback);
        }, 50);

      }
    }

  }
}

var wstream = fs.createWriteStream(path.join(__dirname, '..', `${options.output}.csv`));
var headerWritten = false;
var count = 0;

function pxReadyRun(px, callback) {
  count++;

  config = collection.get(px);
  var result = run3pgModel(config, px);
  
  displayProgress();

  if( result.growthError ) {
    return callback();
  }

  if( !headerWritten ) {
    var arr = result.harvests.map((row) => {
      return row[0].replace(/T.*/,'');
    });
    arr.unshift('Pixel');
    wstream.write(arr.join(',')+'\n');
    headerWritten = true;
  }

  var arr = result.harvests.map((row) => {
    return row[1];
  });
  arr.unshift(px);
  wstream.write(arr.join(',')+'\n');

  callback();
}


var startTime = new Date().getTime();
function displayProgress() {
  var p = Math.floor((count / collection.pixels.length) * 100);
  if( !process.stdout.clearLine ) return;
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${count}/${collection.pixels.length}    ${p}%`);
}

collection.load(() => {
  console.log('Running model for pixel...');

  async.eachSeries(
    collection.pixels,
    (px, next) => {
      run(px, ()=> {
        next();
      });
    },
    (err) => {
      if( err ) throw new Error(err);
      console.log(`
Done.
Pixel Errors: ${options.growthErrors}
Recovered Pixels: ${options.recoveredBadPixels}
      `);

      if( options.dumpErrors ) {
        var data = options.badPixels.map((e) => {return e.join(',')});
        fs.writeFileSync('pixelErrors.dump', data.join('\n'));
      }


      if( options.useDb ) {
        collection.closeClient();
      }
    }
  )
});


