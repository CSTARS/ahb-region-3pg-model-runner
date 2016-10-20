var pg = require('pg');
var extend = require('extend');
var transform = require('./transform');
var cache = require('./cache');
var path = require('path');
var fs = require('fs');

var client;

function connect(confFile, callback) {
  if( !path.isAbsolute(confFile) ) {
    confFile = path.join(process.cwd(), confFile);
  }

  var config = JSON.parse(fs.readFileSync(confFile, 'utf-8'));
  client = new pg.Client(config);

  client.connect(function (err) {
    if (err) throw err;
    console.log('connected to db');
    callback();
  });
}

function prepareCache(callback) {
  cache.prepareCache(callback);
}

function verifyCacheFolder() {
  cache.verifyFolder();
}

function close() {
  console.log('Closing DB connection');
  client.end(function (err) {
    if (err) throw err;
  });
}

function getSoil(px, callback) {
  var cachedSoil = cache.getSoil(px);
  if( cachedSoil ) {
    setTimeout(function(){
      callback(null, cachedSoil);
    }, 10);
    return;
  }

  // execute a query on our database
  client.query(`select * from public_view.pixelSoil(${px})`, function (err, result) {
    if (err) throw err;

    var soil = result.rows;
    if( soil.length === 0 ) {
       cache.setSoil(px, {});
       return callback(null, {});
    }
    soil = soil[0];

    soil.maxAWS = soil.maxaws;
    delete soil.maxaws;
  
    for( var key in soil ) {
       soil[key] = parseFloat(soil[key]);
    }

    cache.setSoil(px, soil);
    callback(null, soil);
  });
}

function getWeather(px, callback) {
  var cachedWeather = cache.getWeather(px);
  if( cachedWeather ) {
    setTimeout(function(){
      callback(null, cachedWeather);
    }, 10);
    return;
  }

  // execute a query on our database
  client.query(`select * from public_view.pixelWeather(${px})`, function (err, result) {
    if (err) throw err;

    var data = result.rows;
    cache.setWeather(px, data); 
    callback(null, data);
  });
}

function getData(px, callback) {
  var weather, soil;

  function onResponse() {
    if( soil && weather ) {
      callback({
        soil : soil,
        weather : weather,
        px: px
      });
    }
  }

  var requestWrapper1 = new Retry(px, getWeather, (data) => {
    weather = data;
    onResponse();
  });
  var requestWrapper2 = new Retry(px, getSoil, (data) => {
    soil = data;
    onResponse();
  });
  requestWrapper1.request();
  requestWrapper2.request();
}


/**
 * try 3 times to make request, then fail
 */
function Retry(px, fn, callback) {
  this.errorCount = 0;

  this.request = function() {
    fn(px, this.onResponse.bind(this));
  },

  this.onResponse = function(err, resp) {
    if( err ) {
      this.errorCount++;

      if( this.errorCount > 3) {
        console.error(err);
        throw err;
      } else {
        console.log(`Retry failure ${this.errorCount}`);
        setTimeout(function(){
          this.request();
        }.bind(this), 100 * this.errorCount);
      }
      return;
    }

    callback(resp);
  }

}

module.exports = {
  get : getData,
  close : close,
  connect : connect,
  verifyCacheFolder : verifyCacheFolder,
  prepareCache : prepareCache
}