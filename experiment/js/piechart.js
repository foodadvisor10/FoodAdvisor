var currentlySelectedPieChart = 'rice';
function pieChart() {
    $("#chart").find("svg").remove();
    (function (d3) {
        'use strict';

        var width = 840;
        var height = 840;
        var radius = Math.min(width, 420) / 2;
        var donutWidth = 75;
        var legendRectSize = 18;
        var legendSpacing = 3;


        var color = d3.scaleOrdinal(d3.schemeCategory20);
        var svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            // .style('margin-left', '500px');
            .attr('transform', 'translate(' + (width / 4) +
            ',' + (height / 4) + ')');

        var arc = d3.arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);

        var pie = d3.pie()
            .value(function (d) {
                return d.count;
            })
            .sort(null);

        var tooltip = d3.select('#chart')
            .append('div')
            .attr('class', 'tooltip');

        tooltip.append('div')
            .attr('class', 'label');

        tooltip.append('div')
            .attr('class', 'count');

        tooltip.append('div')
            .attr('class', 'percent');

        // try {
        d3.csv('../data/food/' + currentlySelectedPieChart + '.csv', function (error, dataset) {
            //console.log(dataset);
            if (error) {
                document.getElementById("chart").innerHTML = "<b id=\"titlehead\">" + country + " " + yearStr[yearSelected] + ": " + tempT + "</b><br>\nThere is unfortunately no data for this category!";
            } else {
                $("#titlehead").text(currentlySelectedPieChart);
                dataset.forEach(function (d) {
                    d.count = +d.count;
                    d.enabled = true;
                })
                dataset = dataset.filter(function (d) {
                    return d.count !== 0;
                }).sort(function (a, b) {
                    return b - a;
                });


                var path = svg.selectAll('path')
                    .data(pie(dataset))
                    .enter()
                    .append('path')
                    .attr('d', arc)
                    .attr('fill', function (d, i) {
                        return color(d.data.label);
                    })
                    .each(function (d) {
                        this._current = d;
                    });

                path.on('mouseover', function (d) {
                    var total = d3.sum(dataset.map(function (d) {
                        return (d.enabled) ? d.count : 0;
                    }));
                    var percent = Math.round(1000 * d.data.count / total) / 10;
                    tooltip.select('.label').html(d.data.label);
                    tooltip.select('.count').html(d.data.count);
                    tooltip.select('.percent').html(percent + '%');
                    tooltip.style('display', 'block');
                });

                path.on('mouseout', function () {
                    tooltip.style('display', 'none');
                });

                // Mouse over funciton
                path.on('mousemove', function (d) {
                    tooltip.style('top', (d3.event.layerY + 10) + 'px')
                        .style('left', (d3.event.layerX + 10) + 'px');
                });


                var legend = svg.selectAll('.legend')
                    .data(color.domain())
                    .enter()
                    .append('g')
                    // .style('overflow', 'auto')
                    .attr('class', 'legend')
                    // .attr('transform', 'translate(500,500)')
                    // .style('float', 'left')
                    // .attr('width', 100)
                    // .style('width', 100)
                    .attr('transform', function (d, i) {
                        var height = legendRectSize + legendSpacing;
                        var offset = height * dataset.length / 2;
                        var horz = -2 * legendRectSize + 300;
                        var vert = i * height - offset + 30;
                        return 'translate(' + horz + ',' + vert + ')';
                    });

                legend.append('rect')
                    .attr('width', legendRectSize)
                    .attr('height', legendRectSize)
                    .style('fill', color)
                    .style('stroke', color)

                    // .style('text-align' , 'center')
                    .on('click', function (label) {
                        var rect = d3.select(this);
                        var enabled = true;
                        var totalEnabled = d3.sum(dataset.map(function (d) {
                            return (d.enabled) ? 1 : 0;
                        }));

                        if (rect.attr('class') === 'disabled') {
                            rect.attr('class', '');
                        } else {
                            if (totalEnabled < 2) return;
                            rect.attr('class', 'disabled');
                            enabled = false;
                        }

                        pie.value(function (d) {
                            if (d.label === label) d.enabled = enabled;
                            return (d.enabled) ? d.count : 0;
                        });

                        path = path.data(pie(dataset));

                        path.transition()
                            .duration(750)
                            .attrTween('d', function (d) {
                                var interpolate = d3.interpolate(this._current, d);
                                this._current = interpolate(0);
                                return function (t) {
                                    return arc(interpolate(t));
                                };
                            });
                    });
                legend.append('text')
                    .attr('x', legendRectSize + legendSpacing)
                    .attr('y', legendRectSize - legendSpacing)
                    // .style('z-index', 100)
                    // .style('width', 1)
                    // .style('overflow','auto')
                    .text(function (d) {
                        return d;
                    });
            }
        });
    })(window.d3);
}




