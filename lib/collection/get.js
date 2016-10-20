var request = require('superagent');
var extend = require('extend');
var transform = require('./transform');
var cache = require('./cache');
var url = 'http://alder.bioenergy.casil.ucdavis.edu:8080/vizsource/rest';

var weatherParams = {
  view : 'pixelWeather(9053)',
  tq : 'select *'
}
var soilParams = {
  view : 'pixelSoil(9053)',
  tq : 'select *'
}

function getSoil(px, callback) {
  var cachedSoil = cache.getSoil(px);
  if( cachedSoil ) {
    setTimeout(function(){
      callback(null, cachedSoil);
    }, 10);
    return;
  }

  soilParams.view = `pixelSoil(${px})`;

  request
    .get(url)
    .query(soilParams)
    .end((err, resp) => {
      if( err ) {
        return callback(err);
      }
      
      var soil = transform(resp.text);
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

  weatherParams.view = `pixelWeather(${px})`;

  request
    .get(url)
    .query(weatherParams)
    .end((err, resp) => {
      if( err ) {
        return callback(err);
      }

      var data = transform(resp.text);
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

module.exports = getData;