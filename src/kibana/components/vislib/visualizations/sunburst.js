define(function (require) {
    return function sunburstFactory(d3, Private) {
        var _ = require('lodash');
        var $ = require('jquery');
        var L = require('leaflet');
        var Chart = Private(require('components/vislib/visualizations/_chart'));
        var errors = require('errors');
        require('css!components/vislib/styles/main');
        /**
         * Pie Chart Visualization
         *
         * @class PieChart
         * @constructor
         * @extends Chart
         * @param handler {Object} Reference to the Handler Class Constructor
         * @param el {HTMLElement} HTML element to which the chart will be appended
         * @param chartData {Object} Elasticsearch query results for this specific chart
         */
        _(sunburst).inherits(Chart);
        function sunburst(handler, chartEl, chartData) {
            if (!(this instanceof sunburst)) {
                return new sunburst(handler, chartEl, chartData);
            }
            sunburst.Super.apply(this, arguments);
        }

        //  ############ RECURSE TREE ##############

        function recurseTree(tree, newKey, newId, newVal, hasBeenFound) {
            if (hasBeenFound.valueOf())
                return true;
            if (!(tree instanceof Object))
                return;
            if ((tree instanceof Object) && $.isEmptyObject(tree)) {
                tree.name = newKey;
                tree.children = [];
                tree.children.push({});
                tree.children[0].name = newId;
                tree.children[0].size = newVal;
                return false;
            }


            $.each(tree, function (key, value) {

                var tmpLength;
                if (!(value instanceof Object) && value === newKey && key !== 'children') {
                    if (!tree.children) {
                        tree.children = [];
                        tmpLength = 0;
                    } else {
                        tmpLength = tree.children.length;
                    }
                    tree.children.push({});
                    tree.children[tmpLength].name = newId;
                    tree.children[tmpLength].size = newVal;
                    hasBeenFound.valueOf = function () {
                        return true;
                    };
                    return true;
                }
                else if (value instanceof Object && value.name === newKey && key !== 'children') {
                    if (!tree[key].children) {
                        tree[key].children = [];
                        tmpLength = 0;
                    } else {
                        tmpLength = tree[key].children.length;
                    }
                    tree[key].children.push({});
                    tree[key].children[tmpLength].name = newId;
                    tree[key].children[tmpLength].size = newVal;
                    hasBeenFound.valueOf = function () {
                        return true;
                    };
                    return true;
                }
            });
            var child = null;
            if (tree instanceof Object && tree.children) {
                child = tree.children;
            }
            var children = [];
            if (tree instanceof Array) {
                for (var i = 0; i < tree.length; i++) {
                    if (tree[i].children) {
                        children.push(tree[i].children);
                    }
                }
            }

            if (child) { // recursively process on child
                recurseTree(child, newKey, newId, newVal, hasBeenFound);
            }
            if (children) {
                for (var j = 0; j < children.length; j++) {
                    recurseTree(children[j], newKey, newId, newVal, hasBeenFound);
                }
            }
            return false;
        }

        function convertIntoJSON(data) {
            var nodes = data.nodes.features;
            var childrenList = data.children.features;
            var vals = data.data.features;

            var json = {};
            // json.name = 'cluster';
            json.children = [];
            var i = 0;
            var hasBeenFound = false;
            hasBeenFound = Object(hasBeenFound);
            // For each node
            nodes.forEach(function (node) {

                hasBeenFound.valueOf = function () {
                    return false;
                };
                var resp = false;
                if (json.children) {

                    for (var j = 0; j < json.children.length; j++) {
                        resp = recurseTree(json.children[j], node, childrenList[i], vals[i], hasBeenFound);
                        if (hasBeenFound.valueOf())
                            break;
                    }
                } else {
                    resp = recurseTree(json, node, childrenList[i], hasBeenFound);
                }

                if (!hasBeenFound.valueOf()) {
                    var tmpLength = json.children.length;
                    json.children.push({});
                    json.children[tmpLength].name = node;
                    json.children[tmpLength].children = [];
                    json.children[tmpLength].children.push({});
                    json.children[tmpLength].children[0].name = childrenList[i];
                    json.children[tmpLength].children[0].size = vals[i];

                }
                i += 1;
            });
            return (json);
        }


        sunburst.prototype.draw = function () {
            var self = this;
            return function (selection) {

                // ######### Debut d'implementation ########         

                selection.each(function (data) {
                    var el = this;
                    var width = $(el).width();
                    var height = $(el).height();
                    var div = d3.select(el);
                    radius = Math.min(width, height) / 2;
                    var x = d3.scale.linear()
                            .range([0, 2 * Math.PI]);
                    var y = d3.scale.linear()
                            .range([0, radius]);
                    var color = d3.scale.category20c();
                    var svg = div.append('svg') //d3.select("body").append("svg")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");
                    var partition = d3.layout.partition()
                            .value(function (d) {
                                return d.size;
                            });
                    var arc = d3.svg.arc()
                            .startAngle(function (d) {
                                return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                            })
                            .endAngle(function (d) {
                                return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
                            })
                            .innerRadius(function (d) {
                                return Math.max(0, y(d.y));
                            })
                            .outerRadius(function (d) {
                                return Math.max(0, y(d.y + d.dy));
                            });
                    // Keep track of the node that is currently being displayed as the root.
                    var node;
                    //d3.json("components/vislib/visualizations/exemple.json", function(error, root) {

                    var dataJSON = convertIntoJSON(data);

                    var g = svg.selectAll("g")
                            .data(partition.nodes(dataJSON))
                            .enter().append("g");
                    var path = g.append("path")
                            .attr("d", arc)
                            .style("fill", function (d) {
                                //return color((d.children ? d : d.parent).name);
                                //  console.log("l'etat: ", d.etat);
                                // console.log("la couleur: ", color(d.name));
                                if (d.etat === "ko") // si HS
                                    return "#ff000f"; // red color
                                else
                                    return color(d.name); // random color with name

                            })
                            .on("click", click)
                            .each(stash);
                    d3.selectAll("input").on("change", function change() {
                        var value = this.value === "count"
                                ? function () {
                                    return 1;
                                }
                        : function (d) {
                            return d.size;
                        };
                        path
                                .data(partition.value(value).nodes)
                                .transition()
                                .duration(1000)
                                .attrTween("d", arcTween);
                    });
                    var text = g.append("text")
                            .attr("transform", function (d) {
                                return "rotate(" + computeTextRotation(d) + ")";
                            })
                            .attr("x", function (d) {
                                return y(d.y);
                            })
                            .attr("dx", "6") // margin
                            .attr("dy", ".35em") // vertical-align
                            .text(function (d) {
                                return d.name;
                            });
                    function click(d) {
                        // fade out all text elements
                        text.transition().attr("opacity", 0);
                        path.transition()
                                .duration(750)
                                .attrTween("d", arcTweenZoom(d))
                                .each("end", function (e, i) {
                                    // check if the animated element's data e lies within the visible angle span given in d
                                    if (e.x >= d.x && e.x < (d.x + d.dx)) {
                                        // get a selection of the associated text element
                                        var arcText = d3.select(this.parentNode).select("text");
                                        // fade in the text element and recalculate positions
                                        arcText.transition().duration(750)
                                                .attr("opacity", 1)
                                                .attr("transform", function () {
                                                    return "rotate(" + computeTextRotation(e) + ")"
                                                })
                                                .attr("x", function (d) {
                                                    return y(d.y);
                                                });
                                    }
                                });
                    }
                    //});

                    d3.select(self.frameElement).style("height", height + "px");
                    // Interpolate the scales!
                    function arcTween(d) {
                        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                                yd = d3.interpolate(y.domain(), [d.y, 1]),
                                yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
                        return function (d, i) {
                            return i
                                    ? function (t) {
                                        return arc(d);
                                    }
                            : function (t) {
                                x.domain(xd(t));
                                y.domain(yd(t)).range(yr(t));
                                return arc(d);
                            };
                        };
                    }
                    // Setup for switching data: stash the old values for transition.
                    function stash(d) {
                        d.x0 = d.x;
                        d.dx0 = d.dx;
                    }

                    // When zooming: interpolate the scales.
                    function arcTweenZoom(d) {
                        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                                yd = d3.interpolate(y.domain(), [d.y, 1]),
                                yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
                        return function (d, i) {
                            return i
                                    ? function (t) {
                                        return arc(d);
                                    }
                            : function (t) {
                                x.domain(xd(t));
                                y.domain(yd(t)).range(yr(t));
                                return arc(d);
                            };
                        };
                    }
                    function computeTextRotation(d) {
                        return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
                    }

                });
            };
        };
        return sunburst;
    };
});
