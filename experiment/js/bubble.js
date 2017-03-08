function BubbleChart(el, filterField, filters) {
    var that = this;

    var db = [];
    var data = [];
    var options = {};
    var filter = [];
    var groups = [];
    var keyword = "";

    //TODO: move this to its rightful place
    function onSearch() {
        console.log("on change");
        that.createBubble(data, options, filter, groups, this.value);
    }

    var W = parseInt(el.style('width')), H = parseInt(el.style('height'));

    // Chart dimensions.
    var margin = {top: 19.5, right: 19.5, bottom: 30, left: 39.5},
        marginL = {top: 19.5, right: 19.5, bottom: 120, left: 29.5},
        marginB = {top: 430, right: 19.5, bottom: 30, left: 79.5},
        width = W - margin.right,
        height = H - margin.top - margin.bottom,
        heightB = H - marginB.top - marginB.bottom,
        heightL = H - marginL.top - marginL.bottom;

    // Brush dimensions
    var zBrushHeight = height / 2,
        zBrushWidth = 30,
        zBrushX = width + 10,
        zBrushY = 30,
        xBrushWidth = 30,
        yBrushWidth = 30;

    // Create the SVG container and set the origin.
    var svg = el.select("svg")
        .attr('class', 'container')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);


    var zoomRegion = svg.append("rect")
        .attr("class", "zoom")
        .style("cursor", "zoom-in")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var focus = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var rightPanel = svg.append("g")
        .attr("transform", "translate(" + zBrushX + "," + zBrushY + ")");

    var leftPanel = svg.append("g")
        .attr("transform", "translate(" + marginL.left + "," + marginL.top + ")");

    var bottomPanel = svg.append("g")
        .attr("transform", "translate(" + marginB.left + "," + marginB.top + ")");

    // Define the div for the tooltip
    var tooltip = el.append("div")
        .attr("class", "bubble-tooltip")
        .style("opacity", 0);

    // Dashed data reading
    var hLine = focus.append("line")
            .style("stroke-dasharray", "3, 3")
            .attr("class", "h-line")
            .style("stroke", "gray"),
        vLine = focus.append("line")
            .style("stroke-dasharray", "3, 3")
            .attr("class", "v-line")
            .style("stroke", "gray"),
        vText,
        hText;

    // Add the x-axis.
    var xAxisGroup = focus.append("g")
        .attr("class", "x axis--x")
        .attr("transform", "translate(0," + height + ")");

    // Add the y-axis.
    var yAxisGroup = focus.append("g")
        .attr("class", "y axis--y");

    // // Create z-brush
    // var zAxisGroup = rightPanel.append("g");

    // Create bubbles
    var dots = focus.append("g")
        .attr("class", "dots");

    var dot = dots.selectAll(".dot");

    var menuX = filters.map(function(d) {
        return {
            title: d,
            action: function() {
                options.x = d;
                that.createBubble(data, options, filter, groups);
            }
        }
    });

    var menuY = filters.map(function(d) {
        return {
            title: d,
            action: function() {
                options.y = d;
                that.createBubble(data, options, filter, groups);
            }
        }
    });




    // Add an x-axis label.
    var xLabel = focus.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .on("click", d3.contextMenu(menuX));

    // Add a y-axis label.
    var yLabel = focus.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .on("click", d3.contextMenu(menuY));

    // // Add an z-axis label.
    // var zLabel = rightPanel.append("text")
    //     .attr("class", "z label")
    //     .attr("text-anchor", "end")
    //     .attr("y", 20)
    //     .attr("dy", ".75em")
    //     .attr("transform", "translate(" + (-zBrushWidth - 5) + ", 0) rotate(-90)");

    this.setDB = function(data) {
        db = data;
    };

    this.createBubble = function (newData, opt, fil, grps, kw) {
        options = opt;
        filter = fil;
        groups = grps;
        keyword = kw;
        console.log("redrawn");
        // Axis definition
        var keyField = options.key,
            xField = options.x,
            yField = options.y,
            zField = options.z,
            radiusField = options.r,
            colorField = options.color;


        // Various accessors that specify the dimensions of data to visualize.
        function x(d) {
            return +d[xField];
        }

        function y(d) {
            return +d[yField];
        }

        function z(d) {
            return +d[zField];
        }

        function radius(d) {
            return +d[radiusField];
        }

        function color(d) {
            return d[colorField];
        }

        function key(d) {
            return d[keyField];
        }

        function f(d) {
            return d[filterField];
        }

        function scaler(data, accessor) {
            return data.length === 1 ? [0, 2 * d3.max(data, accessor)] : [0, 1.1 * d3.max(data, accessor)];
        }

        data = newData.filter(function (d) {
            return !filter || filter[f(d)];
        });

        // additional search item
        if (keyword && data.filter(function(d) {
                return key(d) === keyword;
            }).length === 0) {
            var d = db.filter(function(d) {
                return key(d) === keyword;
            });
            if (d) {
                data.push(d[0]);
            }
        }

        // Various scales. These domains make assumptions of data, naturally.
        var xScale = d3.scaleLinear().domain(scaler(data, x)).range([0, width]),
            xScaleB = d3.scaleLinear().domain(scaler(data, x)).range([0, width]),
            yScale = d3.scaleLinear().domain(scaler(data, y)).range([height, 0]),
            yScaleL = d3.scaleLinear().domain(scaler(data, y)).range([heightL, 0]),
            zScale = d3.scaleLinear().domain(scaler(data, z)).range([zBrushHeight, 0]),
            radiusScale = d3.scaleSqrt().domain(scaler(data, radius)).range([0, 40]),
            colorScale = d3.scaleOrdinal(d3.schemeCategory20).domain(groups);

        // The x & y axes.
        var xAxis = d3.axisBottom(xScale),//.scale(xScale).ticks(12, d3.format(",d")),
            yAxis = d3.axisLeft(yScale),//.orient("left");
            yAxisL = d3.axisLeft(yScaleL),//.orient("left");
            zAxis = d3.axisRight(zScale),
            xAxisB = d3.axisBottom(xScaleB);

        // Create zoom
        var xZoomOption = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", onZoom)
            .on("end", onZoomend);

        zoomRegion.call(xZoomOption);


        // Create y-brush
        //leftPanel.append("g")
        //    .call(yAxisL);
        //
        //
        //var yBrushOption = d3.brushY()
        //    .extent([[-yBrushWidth / 2, 0], [yBrushWidth / 2, height]])
        //    .on("start brush end", yBrushMove);
        //
        //var yBrush = leftPanel.append("g")
        //    .attr("class", "brush")
        //    .call(yBrushOption)
        //    .call(yBrushOption.move, yScale.range());


        // Create x-brush
        //bottomPanel.append("g")
        //    .call(xAxisB);
        //
        //var xBrushOption = d3.brushX()
        //    .extent([[0, -xBrushWidth / 2], [width, xBrushWidth / 2]])
        //    .on("start brush end", xBrushMove);
        //
        //var xBrush = bottomPanel.append("g")
        //    .attr("class", "brush")
        //    .call(xBrushOption)
        //    .call(xBrushOption.move, xScale.range());


        // function xBrushMove() {
        //     if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        //     var s = d3.event.selection || xScaleB.range();
        //     //s = Math.abs(s[1] - s[0]) > 0.001 ? s : xScale2.range();
        //     //console.log(s);
        //     xScale.domain(s.map(xScaleB.invert, xScaleB));
        //     focus.select(".axis--x").call(xAxis);
        //     //svg.select(".zoom").call(xZoomOption.transform, d3.zoomIdentity
        //     //    .scale(width / (s[1] - s[0]))
        //     //    .translate(-s[0], 0));
        //
        // }
        //
        //
        // function yBrushMove() {
        //     if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        //     var s = d3.event.selection || yScaleL.range();
        //     //s = Math.abs(s[1] - s[0]) > 0.001 ? s : xScale2.range();
        //     //console.log(s);
        //     yScale.domain(s.map(yScaleL.invert, yScaleL));
        //     focus.select(".axis--y").call(yAxis);
        //     //svg.select(".zoom").call(xZoomOption.transform, d3.zoomIdentity
        //     //    .scale(height / (s[1] - s[0]))
        //     //    .translate(-s[0], 0));
        //
        // }

        function onZoom() {
            //if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = d3.event.transform;
            if (d3.event.sourceEvent.type === 'mousemove') {
                zoomRegion.style("cursor", "move");
            }
            xScale.domain(t.rescaleX(xScaleB).domain());
            yScale.domain(t.rescaleY(yScaleL).domain());
            //svg.selectAll(".dot")
            //    .attr("cx", function(d) {return xScale(x(d))})
            //    .attr("cy", function(d) {return yScale(y(d))});
            //focus.select(".axis--x").call(xAxis);
            //bottomPanel.select(".brush").call(xBrushOption.move, xScale.range().map(t.invertX, t));

            xAxisGroup.call(xAxis);
            yAxisGroup.call(yAxis);
            dot
                .attr("cx", function (d) {
                    return xScale(x(d));
                })
                .attr("cy", function (d) {
                    return yScale(y(d));
                });

        }

        function onZoomend() {
            zoomRegion.style("cursor", "zoom-in");
        }


        // zAxisGroup.call(zAxis);


        // var zBrushOption = d3.brushY()
        //     .extent([[-zBrushWidth / 2, 0], [zBrushWidth / 2, zBrushHeight]])
        //     .on("start brush end", zBrushMove);
        //
        // zLabel.text(zField);


        // var zBrush = rightPanel.append("g")
        //     .attr("class", "brush")
        //     .call(zBrushOption);

        xAxisGroup.call(xAxis);
        yAxisGroup.call(yAxis);


        xLabel.text(xField);
        yLabel.text(yField);

        var s = dots.selectAll(".dot").data(data, key);
        s.call(setDotEvent)
            .sort(order)
            .transition()
            .call(position);
        s.enter().append("circle")
            .attr("class", "dot")
            .style("fill", function (d) {
                return colorScale(color(d));
            })
            .call(setDotEvent)
            .sort(order)
            .attr("cx", function (d) {
                return xScale(x(d));
            })
            .attr("cy", function (d) {
                return yScale(y(d));
            })
            .transition()
            .attr("r", function (d) {
                return radiusScale(radius(d));
            });
        s.exit().remove();
        dot = dots.selectAll(".dot");
        //highlightSelected(currentlySelectedPieChart);


        // Setup search box
        // TODO: change to d3 selection
        var searchBox = $("#search-box")
            .off("change", onSearch)
            .on("change", onSearch);
        search(searchBox.val());

        function highlightSelected(selected) {
            toggleTransparency(dot, true);
            dot.filter(function (d) {
                return key(d) === selected;
            }).classed('selected', true);
        }


        function unhighlightSelected(selected) {
            dot.filter(function (d) {
                return key(d) === selected;
            }).classed('selected', false);
        }

        function toggleTransparency(s, hidden) {
            s.classed("half-transparent", hidden);
        }

        function search(query) {
            dot.each(function (d) {
                if (query && key(d) !== query) {
                    d3.select(this)
                        .classed("half-transparent", true)
                        .classed("search-target", false);
                } else if (key(d) === query) {
                    d3.select(this)
                        .classed("half-transparent", false)
                        .classed("search-target", true);
                }
            })

        }


        // function zBrushMove() {
        //     var s = d3.event.selection || zScale.range();
        //     if (s) {
        //         var sz = s.map(zScale.invert);
        //         dot.attr('visibility', function (d) {
        //             return d3.min(sz) <= z(d) && z(d) <= d3.max(sz) ? 'visible' : 'hidden';
        //         })
        //         d3.select(".search-target")
        //             .attr("visibility", true)
        //     }
        // }

        function setDotEvent(dot) {
            dot.on("mouseenter", highlightDot)
                .on("mousemove", moveTooltip)
                .on("mouseleave", unhighlightDot)
                .on("click", selectDot)
        }

        function selectDot(d) {
            console.log(currentlySelectedPieChart);
            unhighlightSelected(currentlySelectedPieChart);
            firstLoad = true;
            currentlySelectedPieChart = key(d);
            highlightSelected(currentlySelectedPieChart);
            pieChart(d);
        }

        function highlightDot(d) {
            dot
                .classed("half-transparent", true);
            d3.select(this)
                .classed("half-transparent", false);

            showDash(d);

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip
                .html(key(d));
            moveTooltip(d);
        }


        function unhighlightDot(d) {
            dot
                .classed("half-transparent", false);

            hideDash(d);

            tooltip.transition()
                .duration(50)
                .style("opacity", 0);
            search(searchBox.val());
        }


        function moveTooltip(d) {
            tooltip
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
        }

        function drawTextbox(s, x, y, v, isV) {
            var w = 40, h = 20;
            var pad = 1;
            var g = s.append("g")
                .attr("transform", "translate(" + x + "," + y + ")");
            g.append('rect')
                .attr("x", isV ? -w - pad : -0.5 * w)
                .attr("y", isV ? -0.5 * h : pad)
                .attr("width", w)
                .attr("height", h)
                .style("fill", "white")
                .style("opacity", 0.8);
            g.append("text")
                .attr("x", isV ? -10 : 0)
                .attr("y", isV ? 4: 16)
                .attr("text-anchor", isV ? "end" : "middle")
                .text(v);
        }

        function showDash(d) {
            vLine.classed("invisible", false)
                .attr("x1", xScale(x(d)))
                .attr("y1", yScale.range()[0])
                .attr("x2", xScale(x(d)))
                .attr("y2", yScale(y(d)));

            hLine.classed("invisible", false)
                .attr("x1", xScale.range()[0])
                .attr("y1", yScale(y(d)))
                .attr("x2", xScale(x(d)))
                .attr("y2", yScale(y(d)));

            vText = focus.append("g")
                .call(drawTextbox, xScale.range()[0], yScale(y(d)), y(d), true);

            hText = focus.append("g")
                .call(drawTextbox, xScale(x(d)), yScale.range()[0], x(d), false);

            // vText.remove();
            // vText = focus.append('text')
            //     .style('font-weight', 'bold');
            //
            // vText.classed("invisible", false)
            //     .attr('x', xScale.range()[0] - 28)
            //     .attr('y', yScale(y(d)))
            //     .text(y(d));
            //
            // hText.classed("invisible", false)
            //     .attr('x', xScale(x(d)))
            //     .attr('y', yScale.range()[0] + 16)
            //     .text(x(d));
        }

        function hideDash(d) {
            vLine.classed("invisible", true);
            hLine.classed("invisible", true);

            vText.remove();
            hText.remove();
        }

        // Positions the dots based on data.
        function position(dot) {
            dot.attr("cx", function (d) {
                return xScale(x(d));
            })
                .attr("cy", function (d) {
                    return yScale(y(d));
                })
                .attr("r", function (d) {
                    return radiusScale(radius(d));
                });
        }

        // Defines a sort order so that the smallest dots are drawn on top.
        function order(a, b) {
            return radius(b) - radius(a);
        }
    };

    this.updateFilter = function (filters) {
        dot.classed("invisible", function (d) {
            var visible = filters.every(function (filter) {
                return (filter.min <= d[filter.field] && d[filter.field] <= filter.max);
            });
            return !visible;
        });

        el.select(".search-target")
            .classed("invisible", true)

    }

    this.updateGroups = function(category) {
        that.createBubble(db, options, category, groups, keyword);
    }
}