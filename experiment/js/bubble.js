function createBubble(data, el, options, filter, groups) {
    // Axis definition
    var keyField = options.key,
        xField = options.x,
        yField = options.y,
        zField = options.z,
        radiusField = options.r,
        colorField = options.color;

    var filterField = filter.field,
        filterValue = filter.value;

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


    data = data.filter(function(d) {
        return filterValue === 'ALL' || f(d) === filterValue;
    });

    // Chart dimensions.
    var margin = {top: 19.5, right: 19.5, bottom: 120, left: 39.5},
        margin2 = {top: 450, right: 19.5, bottom: 30, left: 39.5},
        width = 960 - margin.right,
        height = 500 - margin.top - margin.bottom,
        height2 = 500 - margin2.top - margin2.bottom;

    // Brush dimensions
    var zBrushHeight = height / 2,
        zBrushWidth = 30,
        zBrushX = 30 + width,
        xBrushWidth = 30;

    // Various scales. These domains make assumptions of data, naturally.
    var xScale = d3.scaleLinear().domain(scaler(data, x)).range([0, width]),
        xScale2 = d3.scaleLinear().domain(scaler(data, x)).range([0, width]),
        yScale = d3.scaleLinear().domain(scaler(data, y)).range([height, 0]),
        yScale2 = d3.scaleLinear().domain(scaler(data, y)).range([height2, 0]),
        zScale = d3.scaleLinear().domain(scaler(data, z)).range([zBrushHeight, 0]),
        radiusScale = d3.scaleSqrt().domain(scaler(data, radius)).range([0, 40]);
        colorScale = d3.scaleOrdinal(d3.schemeCategory20).domain(groups);

    // The x & y axes.
    var xAxis = d3.axisBottom(xScale),//.scale(xScale).ticks(12, d3.format(",d")),
        yAxis = d3.axisLeft(yScale),//.orient("left");
        zAxis = d3.axisRight(zScale),
        xAxis2 = d3.axisBottom(xScale2);


    // Create the SVG container and set the origin.
    var svg = el.append("svg")
        .attr('class', 'container')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Create zoom

    var xZoomOption = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", onXZoom);


    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(xZoomOption);

    var focus = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var rightPanel =  svg.append("g")
        .attr("transform", "translate(" + zBrushX + ",0)");

    var bottomPanel = svg.append("g")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");



    // Create x-brush
    bottomPanel.append("g")
        .call(xAxis2);

    var xBrushOption = d3.brushX()
        .extent([[0, -xBrushWidth / 2], [width, xBrushWidth / 2]])
        .on("start brush end", xBrushMove);

    var xBrush = bottomPanel.append("g")
        .attr("class", "brush")
        .call(xBrushOption)
        .call(xBrushOption.move, xScale.range());


    function xBrushMove() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || xScale2.range();
        xScale.domain(s.map(xScale2.invert, xScale2));
        focus.select(".axis--x").call(xAxis);
        svg.select(".zoom").call(xZoomOption.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0));

    }

    function onXZoom() {
        //if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        console.log("x zooming");
        var t = d3.event.transform;
        xScale.domain(t.rescaleX(xScale2).domain());
        svg.selectAll(".dot")
            .attr("cx", function(d) {return xScale(x(d))})
            .attr("cy", function(d) {return yScale(y(d))});
        focus.select(".axis--x").call(xAxis);
        bottomPanel.select(".brush").call(xBrushOption.move, xScale.range().map(t.invertX, t));

    }


    // Create z-brush
    rightPanel.append("g")
        .call(zAxis);


    var zBrushOption = d3.brushY()
        .extent([[-zBrushWidth / 2, 0], [zBrushWidth / 2, zBrushHeight]])
        .on("start brush end", zBrushMove);

    // Add an z-axis label.
    rightPanel.append("text")
        .attr("class", "z label")
        .attr("text-anchor", "end")
        .attr("y", 20)
        .attr("dy", ".75em")
        .attr("transform", "translate(" + (-zBrushWidth - 5) + ", 0) rotate(-90)")
        .text(zField);



    var zBrush = rightPanel.append("g")
        .attr("class", "brush")
        .call(zBrushOption);

    // Define the div for the tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
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
        xText = focus.append('text')
            .style('font-weight', 'bold'),
        yText = focus.append('text')
            .style('font-weight', 'bold');

    // Add the x-axis.
    focus.append("g")
        .attr("class", "x axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the y-axis.
    focus.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Add an x-axis label.
    focus.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text(xField);

    // Add a y-axis label.
    focus.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(yField);

    // Add a dot per nation. Initialize the data at 1800, and set the colors.
    var dot = focus.append("g")
        .attr("class", "dots")
        .selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .style("fill", function (d) {
            return colorScale(color(d));
        })
        .on("mouseenter", highlightDot)
        .on("mousemove", moveTooltip)
        .on("mouseleave", unhighlightDot)
        .call(position)
        .sort(order);


    function zBrushMove() {
        var s = d3.event.selection;
        if (s) {
            var sz = s.map(zScale.invert);
            dot.attr('visibility', function (d) {
                return sz[1] <= z(d) && z(d) <= sz[0] ? 'visible' : 'hidden';
            })
        }
    }

    function highlightDot(d) {
        dot
            .attr("opacity", 0.3);
        d3.select(this)
            .attr("opacity", 1);

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
            .attr("opacity", 1);

        hideDash(d);

        tooltip.transition()
            .duration(50)
            .style("opacity", 0);
    }


    function moveTooltip(d) {
        tooltip
            .style("left", (d3.event.pageX - 110) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
    }

    function showDash(d) {
        vLine.attr("visibility", "visible")
            .attr("x1", xScale(x(d)))
            .attr("y1", yScale.range()[0])
            .attr("x2", xScale(x(d)))
            .attr("y2", yScale(y(d)));

        hLine.attr("visibility", "visible")
            .attr("x1", xScale.range()[0])
            .attr("y1", yScale(y(d)))
            .attr("x2", xScale(x(d)))
            .attr("y2", yScale(y(d)));

        xText.attr('visibility', 'visible')
            .attr('x', xScale.range()[0] - 20)
            .attr('y', yScale(y(d)))
            .text(y(d));

        yText.attr('visibility', 'visible')
            .attr('x', xScale(x(d)))
            .attr('y', yScale.range()[0] + 16)
            .text(x(d));
    }

    function hideDash(d) {
        vLine.attr("visibility", "hidden");
        hLine.attr("visibility", "hidden");

        xText.attr("visibility", "hidden");
        yText.attr("visibility", "hidden");
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
}

var customAxis = ["x", "y", "z", "r"];
var filter = {
    field: 'Category',
    value: 'ALL'
};
var options = {
    key: "Food",
    x: "Fat (g)",
    y: "Fat (g)",
    z: "Fat (g)",
    r: "CO2 footprint",
    color: "Category"
};

// Load the data.
d3.csv("../data/food.csv", function(data) {

    // Create filter selection
    var groups = _.uniqBy(data.map(function(datum) { return datum[filter.field]}));

    groups.forEach(function(filter) {
        $("#select-filter").append("<option value='" + filter + "'>" + filter + "</option>");
    });
    $("#select-filter")
        .val(filter.value)
        .on("change", function() {
            filter.value = $(this).val();
            render();
        });

    // Create axis definition

    var cols = data.columns.filter(function(col) {
        return !isNaN(data[0][col]);
    });

    customAxis.forEach(function(axis) {
        $("#control").append("<div><label>" + axis + " axis</label> <select class='select-field' id='" + axis + "'></select></div>");
        cols.forEach(function(col) {
            $("#" + axis).append("<option " + (options[axis] === col ? "selected" : "") + " value='" + col + "'>" + col + "</option");
        })
    });



    $("select.select-field").on('change', function() {
        options[$(this).attr('id')] = $(this).val();
        render();
    });
    render();

    function render() {
        $("#chart").empty();

        createBubble(data, d3.select("#chart"), options, filter, groups);
    }
});
