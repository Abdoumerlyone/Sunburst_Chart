define(function (require) {

  function readRows(table, agg, index, chart) {
    var nodes = chart.nodes;
    var children = chart.children;
    var data = chart.data;

    table.rows.forEach(function (row) {
      var node = row[index.nodes].value;
      var valChildren = row[index.children].value;
      var valData = row[index.metric].value;

     // valChildren.split(';').forEach(function (child) {});
        children.features.push(valChildren);
      
      nodes.features.push(node);
      data.features.push(valData);
    });
  }

  return readRows;
});
