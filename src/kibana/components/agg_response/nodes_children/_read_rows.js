define(function (require) {

  function readRows(table, agg, index, chart) {
    var nodes = chart.nodes;
    var children = chart.children;
    var data = chart.data;
    var tend = chart.tend;

    table.rows.forEach(function (row) {
      var node = row[index.nodes].value;
      var valChildren = row[index.children].value;
      var valData = row[index.metric].value;
      var valTendance = row[index.tendance].value;

     // valChildren.split(';').forEach(function (child) {});
      children.features.push(valChildren);      
      nodes.features.push(node);
      data.features.push(valData);
      tend.features.push(valTendance);
    });
  }

  return readRows;
});
