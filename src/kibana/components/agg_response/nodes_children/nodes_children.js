define(function(require) {
    return function BuildFamily(Private, timefilter, $compile, $rootScope) {
        var _ = require('lodash');
        var readRows = require('components/agg_response/nodes_children/_read_rows');

        function findCol(table, name) {
            return _.findIndex(table.columns, function(col) {
                return col.aggConfig.schema.name === name;
            });
        }

        return function createFamily(vis, table) {

            var index = {
                nodes: findCol(table, 'nodes'),
                children: findCol(table, 'children'),
                metric: findCol(table, 'metric')
            };

            var col = {
                nodes: table.columns[index.nodes],
                children: table.columns[index.children],
                metric: table.columns[index.metric]
            };

            var agg = _.mapValues(col, function(col) {
                return col && col.aggConfig;
            });

            var chart = {
                names: ['_all'],
                slices: {
                    children: [
                        {name: '_all'},
                        {size: '_all'}
                    ]
                }
            };

            chart.nodes = {
                type: 'FeatureCollection',
                features: []
            };
            chart.children = {
                type: 'FeatureCollection',
                features: []
            };
            chart.data = {
                type: 'FeatureCollection',
                features: []
            };

            // we're all done if there are no columns
            if (!col.nodes || !col.children || !col.metric || !table.rows.length)
                return chart;

            // read the rows into the geoJson features list
            readRows(table, agg, index, chart);

            return chart;
        };
    };
});
