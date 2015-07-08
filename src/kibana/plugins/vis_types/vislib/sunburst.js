define(function (require) {
  return function HistogramVisType(Private) {
    var VislibVisType = Private(require('plugins/vis_types/vislib/_vislib_vis_type'));
    var Schemas = Private(require('plugins/vis_types/_schemas'));
    var familyBuilder = Private(require('components/agg_response/nodes_children/nodes_children'));

    return new VislibVisType({
       name: 'sunburst',
      title: 'SunBurst',
      icon: 'fa-pie-chart',
      description: 'Sunburst is similar to the treemap, except it uses a radial layout. The root node of the tree is at the center, with leaves on the circumference tree. It is used to visualize HPC clusters topologies for example.',
      editor: require('text!plugins/vis_types/vislib/editors/sunburst.html'),
      responseConverter: familyBuilder,
      //hierarchicalData: true,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Slice Size',
          min: 1,
          max: 1,
          aggFilter: ['sum', 'count', 'cardinality'],
          defaults: [
            { schema: 'metric', type: 'count' }
          ]
        },
        {
          group: 'buckets',
          name: 'nodes',
          title: 'Nodes',
          min: 1,
          max: 1,
          aggFilter: '!geohash_grid'
        },
        {
          group: 'buckets',
          name: 'children',
          title: 'Children',
          min: 1,
          max: 1,
          aggFilter: '!geohash_grid'
        }
      ])
    });
  };
});

//      definitive