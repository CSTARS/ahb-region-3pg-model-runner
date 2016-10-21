var poplar3pgModel = require('poplar-3pg-model');
var options = require('./options')();

// 20 years
const monthsToRun = options.monthsToRun;
const msPerYear = 1000 * 60 * 60 * 24 * 356;

options.growthErrors = 0;
options.badPixels = [];

function run(config, px) {
  config.manage.datePlanted = new Date(options.plantDate);
  config.manage.dateCoppiced = new Date(options.firstCoppice);
  config.manage.irrigFrac = options.irrigate ? 1 : 0;

  for( var key in config) {
    poplar3pgModel[key] = config[key];
  }

  var profile = {
    growthError : false,
    harvests : []
  };

  var date;
  poplar3pgModel.onHarvest = function(e) {
    date = e.date;
    profile.harvests.push([e.date.toISOString(), e.data.WS]);
  }.bind(this);

  try {
    var results = poplar3pgModel.run(monthsToRun);
    profile.harvests.push([date.toISOString(), results[results.length-1][31]]);

    if( isNaN(profile.harvests[0][1]) || profile.harvests[1][1] === 0 ) {
      profile.growthError = true;
      options.growthErrors++;
    }
  } catch(e) {
    options.growthErrors++;
    options.badPixels.push([px, e]);
    profile.growthError = true;
  }

  return profile;
}

module.exports = run;