define(function (require) {
  return function BundlingHandler(d3, Private) {
    var _ = require('lodash');

    var Handler = Private(require('components/vislib/lib/handler/handler'));
    var Data = Private(require('components/vislib/lib/data'));

    return function (vis) {
      var data = new Data(vis.data, vis._attr);

      var BundlingHandler = new Handler(vis, {
        data: data
      });

      /*BundlingHandler.resize = function () {
        this.charts.forEach(function (chart) {
          chart.resizeArea();
        });
      };*/

      return BundlingHandler;
    };
  };
});

