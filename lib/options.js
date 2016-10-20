var options;

function setDefaults(o) {
  if( !o.output ) o.output = 'export';

  o.plantDate = o.plantDate || new Date().toISOString().replace(/T.*/,'');
  o.monthsToRun = o.monthsToRun || 240;

  var msPerYear = 1000 * 60 * 60 * 24 * 356;
  var plantDate = new Date(o.plantDate);
  var firstCoppice = o.firstCoppice || (plantDate.getTime() + (msPerYear * 2));

  o.firstCoppice = new Date(firstCoppice).toISOString().replace(/T.*/,'');

  o.irrigate = o.irrigate || false;
  return o;
}

module.exports = function(o) {
  if( o ) options = setDefaults(o);
  return options;
}