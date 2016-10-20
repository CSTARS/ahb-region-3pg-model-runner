const fs = require('fs');
const async = require('async');
const path = require('path');
const EventEmitter = require('events');
const events = new EventEmitter();
// const get = require('./get');
const get = require('./getPg');
const extend = require('extend');
const modelConfig = require('../modelConfig');
const options = require('../options')();

var pixelCsvPath = path.join(__dirname, '..', '..', 'data', 'AHB-PNW_8km_Grid.csv');
var weather = {};
var soil = {};

function Collection() {
  this.pixels = fs.readFileSync(pixelCsvPath, 'utf-8').split('\n');
  this.pixels.splice(0, 1);
  this.pixels = this.pixels.map((row) => {
    return row.replace(/,.*/, '');
  });

  this.on = function(e, fn) {
    events.on(e, fn);
  }

  this.load = function(callback) {
    if( options.useDb ) {
      get.verifyCacheFolder();

      get.connect(options.useDb, () => {
        async.eachSeries(
          this.pixels,
          (px, next) => {
            get.get(px, (resp) => {
              weather[px] = resp.weather;
              soil[px] = resp.soil;

              events.emit('data-load', resp);
              next();
            });
          },
          (err) => {
            events.emit('load-complete');
          }
        );

        callback();
      });
    
    } else {
      get.prepareCache(() => {
        async.eachSeries(
          this.pixels,
          (px, next) => {
            get.get(px, (resp) => {
              weather[px] = resp.weather;
              soil[px] = resp.soil;

              setTimeout(() => {
                events.emit('data-load', resp);
                next();
              }, 0);
              
            });
          },
          (err) => {
            events.emit('load-complete');
          }
        );

         callback();
      });
    }
  }

  this.closeClient = function() {
    get.close();
  }

  this.get = function(px) {
    if( !weather[px] ) {
      throw new Error(`Pixel ${px} has not been loaded yet.`);
    }

    var config = extend(true, {}, modelConfig);
    config.weather = {};
    config.soil = {};

    var w = weather[px];
    for(var i = 0; i < w.length; i++ ) {
      config.weather[i] = w[i];
    }

    config.soil = soil[px];

    return config;
  }
}

module.exports = new Collection();
