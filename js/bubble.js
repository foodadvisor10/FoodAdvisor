// Dirty hack again
d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};
NodeList.prototype.find = Array.prototype.find;
d3.selection.prototype.moveAfter = function(condition) {
    return this.each(function() {
        var firstChild = this.parentNode.childNodes.find(condition.bind(d3.select(this)));
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        } else {
            this.parentNode.appendChild(this);
        }
    });
};

function BubbleChart(el, filterField, filters, groups, colors) {
    var that = this;
    var fg;
    var db = [];
    var data = [];
    var options = {};
    var filter = [];
    var keyword = "";
    var selected;

    //TODO: move this to its rightful place
    function onSearch() {
        var kw = this.value;
        if (!kw) return;
        console.log("on change");
        selected = db.find(function(d) {
            return kw === d[options.key];
        })
        if (fg)
            that.updateFilter(fg);
        that.createBubble(data, options, filter, groups, kw);
    }

    var W = parseInt(el.style('width')), H = parseInt(el.style('height'));

    // Chart dimensions.
    var margin = {top: 29.5, right: 19.5, bottom: 30, left: 49.5},
        marginL = {top: 29.5, right: 19.5, bottom: 120, left: 39.5},
        marginB = {top: 430, right: 19.5, bottom: 30, left: 89.5},
        marginT = {top: 25.5, right: 19.5, bottom: 39.5, left: 49.5},
        width = W - margin.right,
        height = H - margin.top - margin.bottom,
        heightB = H - marginB.top - marginB.bottom,
        heightL = H - marginL.top - marginL.bottom;


    var xScale;
    var xScaleB;
    var yScale;
    var yScaleL;
    var zScale;
    var radiusScale;
    var colorScale;

    var xAxis;
    var yAxis;
    var yAxisL;
    var zAxis;
    var xAxisB;

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


    var g2 = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    // Ugly hack
    var bubbleSvg = g2.append("svg")
        .attr("class", "bubble-svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var title = svg.append("g")
        .attr("transform", "translate(" + marginT.left + "," + marginT.top + ")");

    var focus = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dottedCross = bubbleSvg.append("g");

    var axisReading = svg.append("g")
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

    // container for hover dotted cross and their axis reading
    var hoverCross;
    var hoverReading;

    // container for selected dotted cross and their axis reading
    var selectedCross;
    var selectedReading;

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
    var dots = bubbleSvg.append("g")
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

    var menuR = filters.map(function(d) {
        return {
            title: d,
            action: function() {
                options.r = d;
                that.createBubble(data, options, filter, groups);
            }
        }
    });


    function setupLabel(s, textAnchor) {
        s.attr("text-anchor", textAnchor || "end")
            .style("fill", "black")
            .on("mouseover", function() {
                d3.select(this)
                    .style("text-decoration", "underline")
            })
            .on("mouseleave", function() {
                d3.select(this)
                    .style("text-decoration", null)
            })
    }

    // Add an x-axis label.
    var xLabel = focus.append("text")
        .attr("class", "x label")
        .call(setupLabel)
        .attr("x", width)
        .attr("y", height - 6)
        .on("click", d3.contextMenu(menuX));

    // Add a y-axis label.
    var yLabel = focus.append("text")
        .attr("class", "y label")
        .attr("y", 6)
        .attr("dy", ".75em")
        .call(setupLabel)
        .attr("transform", "rotate(-90)")
        .on("click", d3.contextMenu(menuY));

    // Add a r-axis label
    var rLabel = title.append("text")
        .attr("class", "r label")
        .attr("x", width / 2)
        .call(setupLabel, "middle")
        .on("click", d3.contextMenu(menuR));


    // Add an x-flip icon
    var xFlip = focus.append("text")
        .attr("class", "flip")
        .text("\uf0ec")
        .attr("x", width + 5)
        .attr("y", height + 6);

    // Add an y-flip icon
    var yFlip = focus.append("text")
        .attr("class", "flip")
        .text("\uf0ec")
        .attr("x", 3)
        .attr("y", 4)
        .attr("transform", "rotate(-90)");

    // // Add an z-axis label.
    // var zLabel = rightPanel.append("text")
    //     .attr("class", "z label")
    //     .attr("text-anchor", "end")
    //     .attr("y", 20)
    //     .attr("dy", ".75em")
    //     .attr("transform", "translate(" + (-zBrushWidth - 5) + ", 0) rotate(-90)");

    // TODO: refactor this
    var x;
    var y;
    var radius;

    var animateDots;
    var xZoomOption;
    var resetZoom = 0;


    function scaler(data, accessor) {
        return data.length === 1 ? [0, 2 * d3.max(data, accessor)] : [0, 1.1 * d3.max(data, accessor)];
    }

    this.setDB = function(data) {
        db = data;
    };

    this.createBubble = function (newData, opt, fil, kw) {
        options = opt;
        filter = fil;
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
        x = function(d) {
            return +d[xField];
        }

        y = function(d) {
            return +d[yField];
        }

        function z(d) {
            return +d[zField];
        }

        radius = function(d) {
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


        data = newData.filter(function (d) {
            return !filter || filter[f(d)];
        });

        // additional search item
        if (selected) {
            if (!data.find(function(d) {
                return key(d) === key(selected);
                }))
            data.push(selected);
        }

        // Various scales. These domains make assumptions of data, naturally.
        xScale = d3.scaleLinear().domain(scaler(data, x)).range([0, width]),
        xScaleB = d3.scaleLinear().domain(scaler(data, x)).range([0, width]),
        yScale = d3.scaleLinear().domain(scaler(data, y)).range([height, 0]),
        yScaleL = d3.scaleLinear().domain(scaler(data, y)).range([heightL, 0]),
        zScale = d3.scaleLinear().domain(scaler(data, z)).range([zBrushHeight, 0]),
        radiusScale = d3.scaleSqrt().domain(scaler(data, radius)).range([0, 40]),
        colorScale = d3.scaleOrdinal(colors).domain(groups);

        // The x & y axes.
        xAxis = d3.axisBottom(xScale),//.scale(xScale).ticks(12, d3.format(",d")),
        yAxis = d3.axisLeft(yScale),//.orient("left");
        yAxisL = d3.axisLeft(yScaleL),//.orient("left");
        zAxis = d3.axisRight(zScale),
        xAxisB = d3.axisBottom(xScaleB);

        // Create zoom
        xZoomOption = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", onZoom)
            .on("end", onZoomend);

        zoomRegion.call(xZoomOption)
            .on("wheel", function() { d3.event.preventDefault(); });;

        function onZoom() {
            if (resetZoom) {
                // this is really dirty
                d3.event.transform.k = 1;
                d3.event.transform.x = 0;
                d3.event.transform.y = 0;
                resetZoom = 0;
            }
            var t = d3.event.transform;

            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'mousemove') {
                zoomRegion.style("cursor", "move");
            }
            xScale.domain(t.rescaleX(xScaleB).domain());
            yScale.domain(t.rescaleY(yScaleL).domain());

            xAxisGroup.call(xAxis);
            yAxisGroup.call(yAxis);


            showSelectedDash(selected);
            dot.call(position)

        }


        // Add an axis flipping effect
        xFlip.on("click", onRevertX);
        yFlip.on("click", onRevertY);

        function onRevertX() {
            // alert("mf");
            xScale.domain([xScale.domain()[1], xScale.domain()[0]]);
            xScaleB.domain([xScaleB.domain()[1], xScaleB.domain()[0]]);

            xAxisGroup
                .transition()
                .call(xAxis);

            animateDots();
        }

        function onRevertY() {
            // alert("mf");
            yScale.domain([yScale.domain()[1], yScale.domain()[0]]);
            yScaleL.domain([yScaleL.domain()[1], yScaleL.domain()[0]]);

            yAxisGroup
                .transition()
                .call(yAxis);

            animateDots();
        }

        function onZoomend() {
            zoomRegion.style("cursor", "zoom-in");
        }


        xAxisGroup.call(xAxis);
        yAxisGroup.call(yAxis);

        var dropIcon = '\u25BC';

        // if(xField.match("CO2 footprint")){
        //     xField = "CO₂ footprint";
        // }

        xLabel.html(xField + " " + dropIcon);
        yLabel.text(yField + " " + dropIcon);
        rLabel.text("Bubble size: " + radiusField + " " + dropIcon);

        animateDots = function() {
            var s = dots.selectAll(".dot").data(data, key);
            s.selectAll(".removed")
                .remove();
            s.call(setDotEvent)
                .transition()
                .call(position);
            s.enter().append("circle")
                .attr("class", "dot")
                .style("fill", function (d) {
                    return colorScale(color(d));
                })
                .call(setDotEvent)
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
            s.exit()
                .classed("removed", true)
                .transition()
                .attr("r", 0)
                .remove();
            dot = dots.selectAll(".dot:not(.removed)");
            dot.moveAfter(reorderNode);
            // console.log(getSelectedDot(selected).data());
            getSelectedDot(selected).moveToFront();
            if (selected) highlightSelected(key(selected));
            showSelectedDash(selected);
            //highlightSelected(currentlySelectedPieChart);

        }
        animateDots();
        // if(filters)
        // that.updateFilter(filters);


        // Setup search box
        // TODO: change to d3 selection
        var searchBox = $("#search-box")
            .off("select2:close", onSearch)
            .on("select2:close", onSearch);
        search(searchBox.val());

        function highlightSelected(selected) {
            // toggleTransparency(dot, true);
            dot.filter(function (d) {
                return key(d) === selected;
            }).classed('selected', true)
                .moveToFront();
        }


        function unhighlightSelected(selected) {
            if (!selected) return;
            var s = dot.filter(function (d) {
                return key(d) === selected;
            }).classed('selected', false);
            s.moveAfter(reorderNode);
        }

        function reorderNode(node) {
            return order(d3.select(node).data()[0], this.data()[0]) > 0;
        }

        function toggleTransparency(s, hidden) {
            s.classed("half-transparent", hidden);
        }

        function search(query) {
            if (!query) return;
            dot.each(function (d) {
                if (query && key(d) !== query) {
                    d3.select(this)
                        .classed("search-target", false);
                } else if (key(d) === query) {
                    d3.select(this)
                        .classed("search-target", true);
                }
            })
            var searched = db.find(function(d) {
                return key(d) === query;
            })
            selectDot(searched);
        }

        function setDotEvent(dot) {
            dot.on("mouseenter", highlightDot)
                .on("mousemove", moveTooltip)
                .on("mouseleave", unhighlightDot)
                .on("click", selectDot)
                .on("mousewheel", function() {
                    d3.event.preventDefault();
                })
        }

        function getSelectedDot(data) {
            return dot.filter(function(d) {
                return data && key(data) === key(d)
            });
        }

        function selectDot(d) {
            selected = d;
            console.log(currentlySelectedPieChart);
            unhighlightSelected(currentlySelectedPieChart);
            firstLoad = true;
            currentlySelectedPieChart = key(d);
            highlightSelected(currentlySelectedPieChart);
            showSelectedDash(d);
            pieChart(d);
        }

        function highlightDot(d) {
            dot
                .classed("half-transparent", true);
            d3.select(this)
                .classed("half-transparent", false);

            showHoverDash(d);

            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip
                .html(key(d));
            moveTooltip(d);
        }


        function unhighlightDot(d) {
            dot
                .classed("half-transparent", false);

            hideHoverDash(d);

            tooltip.transition()
                .duration(50)
                .style("opacity", 0);
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

        function showHoverDash(d) {
            hideDash(d, hoverCross, hoverReading);
            hoverCross = dottedCross.append("g");
            hoverReading = axisReading.append("g");
            createDash(d, hoverCross, hoverReading)
        }

        function showSelectedDash(d) {
            hideDash(d, selectedCross, selectedReading);
            selectedCross = dottedCross.append("g");
            selectedReading = axisReading.append("g");
            createDash(d, selectedCross, selectedReading)
        }

        function hideHoverDash(d) {
            hideDash(d, hoverCross, hoverReading);
        }

        function createDash(d, lineGroup, readingGroup) {
            if (!d || !lineGroup || !readingGroup) {
                return;
            }
            lineGroup.append("line")
                    .style("stroke-dasharray", "3, 3")
                    .attr("class", "h-line")
                    .style("stroke", "gray")
                    .attr("x1", xScale.range()[0])
                    .attr("y1", yScale(y(d)))
                    .attr("x2", xScale.range()[1])
                    .attr("y2", yScale(y(d)));

            lineGroup.append("line")
                .style("stroke-dasharray", "3, 3")
                .attr("class", "v-line")
                .style("stroke", "gray")
                .attr("x1", xScale(x(d)))
                .attr("y1", yScale.range()[0])
                .attr("x2", xScale(x(d)))
                .attr("y2", yScale.range()[1]);

            readingGroup.append("g")
                .call(drawTextbox, xScale.range()[0], yScale(y(d)), y(d), true);

            readingGroup.append("g")
            .call(drawTextbox, xScale(x(d)), yScale.range()[0], x(d), false);
        }

        function hideDash(d, lineGroup, readingGroup) {
            if (lineGroup)
                lineGroup.remove();
            if (readingGroup)
                readingGroup.remove();
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
            // second term as tie breaker
            return radius(b) - radius(a) + (y(b) > y(a) ? 0.001 : -0.001) + (x(b) > x(a) ? 0.0001 : -0.0001) + (key(b) > key(a) ? 0.00001 : -0.00001);
        }
    };

    this.updateFilter = function (filterGroup) {
        resetZoom = 1;
        function f(filter, d) {
            return +d[filter.field]
        }
        // console.log(selected);
        function visible(d) {
            return filterGroup.every(function (filter) {
                var res = (filter.min <= f(filter, d) && f(filter, d) <= filter.max) || (selected && d[options.key] === selected[options.key]);
                return res;
            })
        }
        fg = filterGroup;
        dot.classed("invisible", function (d) {
            return !visible(d);
        });
        // el.select(".search-target")
        //     .classed("invisible", false)

        var filteredData = dot.filter(function(d) {
            return visible(d);
        }).data();
        if (!filteredData.length) return;

        function filterScaler(data, accessor) {
            var min = d3.min(data, accessor) * 0.8;
            var max = d3.max(data, accessor) * 1.1;
            return [min < 0.1 && (max - min) > 1 ? 0 : min, max];
        }
        xScale.domain(d3.extent(filterScaler(filteredData, x)));
        xScaleB.domain(d3.extent(filterScaler(filteredData, x)));
        yScale.domain(d3.extent(filterScaler(filteredData, y)));
        yScaleL.domain(d3.extent(filterScaler(filteredData, y)));
        xAxisGroup
            .transition()
            .call(xAxis);
        yAxisGroup
            .transition()
            .call(yAxis);

        animateDots();
    }

    this.updateGroups = function(category) {
        resetZoom = 1;
        that.createBubble(db, options, category, groups, keyword);
    }

    this.updateOptions = function(options) {
        that.createBubble(db, options, filter, groups, keyword);
    }
}