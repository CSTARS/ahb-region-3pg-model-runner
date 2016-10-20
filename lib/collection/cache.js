var fs = require('fs');
var path = require('path');
var unzip = require('unzip');
var cacheRoot = path.join(__dirname, '..', '..', 'cache');
var cacheZip = path.join(__dirname, '..', '..', 'cache.zip');

function prepareCache(callback) {
  if( !fs.existsSync(cacheRoot) ) {
    console.log('Unpacking data...');
    var stream = fs.createReadStream(cacheZip).pipe(unzip.Extract({ path: cacheRoot }));
    stream.on('close', function(){
      console.log('Data unpacked');
      callback();
    });
  } else {
    callback();
  }
}

function verifyFolder() {
  if( !fs.existsSync(cacheRoot) ) {
    fs.mkdirSync(cacheRoot);  
  }
}

function getWeather(px) {
  return read(px, 'w');
}

function getSoil(px) {
  return read(px, 's');
}

function setWeather(px, json) {
  return write(px, 'w', json);
}

function setSoil(px, json) {
  return write(px, 's', json);
}

function read(px, type) {
  var file = path.join(cacheRoot, `${type}-${px}.json`);
  if( fs.existsSync(file) ) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return;
}

function write(px, type, json) {
  var file = path.join(cacheRoot, `${type}-${px}.json`);
  if( !fs.existsSync(file) ) {
    fs.writeFileSync(file, JSON.stringify(json));
  }
}

module.exports = {
  getWeather : getWeather,
  setWeather : setWeather,
  getSoil : getSoil,
  setSoil : setSoil,
  verifyFolder : verifyFolder,
  prepareCache : prepareCache
}