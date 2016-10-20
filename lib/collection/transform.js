module.exports = function(text) {
  text = text.replace('google.visualization.Query.setResponse(', '');
  text = text.replace(');', '');

  var resp = eval('('+text+')');

  if( resp.status === 'error' ) {
    console.error(resp);
    throw new Error(resp);
  }

  resp = resp.table;
  var data = [];

  for( var i = 0; i < resp.rows.length; i++ ) {
    var row = {};
    for( var j = 0; j < resp.cols.length; j++ ) {
      row[resp.cols[j].id] = resp.rows[i].c[j] ? resp.rows[i].c[j].v : null;
    }

    data.push(row);
  }

  return data;
}