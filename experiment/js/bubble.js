function createBubble(el) {
    // Axis definition
    var keyField = "Food",
        xField = "Fat (g)",
        yField = "Fat (g)",
        radiusField = "CO2 footprint",
        colorField = "Category";

    // Various accessors that specify the four dimensions of data to visualize.
    function x(d) { return +d[xField]; }
    function y(d) { return +d[yField]; }
    function radius(d) { return +d[radiusField]; }
    function color(d) { return d[colorField]; }
    function key(d) { return d[keyField]; }



    // Chart dimensions.
    var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
        width = 960 - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Load the data.
    d3.csv("../data/food.csv", function(data) {
        // Various scales. These domains make assumptions of data, naturally.
        var xScale = d3.scaleLinear().domain(d3.extent(data, x)).range([0, width]),
            yScale = d3.scaleLinear().domain(d3.extent(data, y)).range([height, 0]),
            radiusScale = d3.scaleSqrt().domain(d3.extent(data, radius)).range([0, 40]),
            colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // The x & y axes.
        var xAxis = d3.axisBottom(xScale),//.scale(xScale).ticks(12, d3.format(",d")),
            yAxis = d3.axisLeft(yScale)//.orient("left");

        // Create the SVG container and set the origin.
        var svg = el.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Define the div for the tooltip
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Dashed data reading
        var hLine = svg.append("line")
                .style("stroke-dasharray", "3, 3")
                .attr("class", "h-line")
                .style("stroke", "gray"),
            vLine = svg.append("line")
                .style("stroke-dasharray", "3, 3")
                .attr("class", "v-line")
                .style("stroke", "gray"),
            xText = svg.append('text')
                .style('font-weight', 'bold'),
            yText = svg.append('text')
                .style('font-weight', 'bold');

        // Add the x-axis.
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the y-axis.
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        // Add an x-axis label.
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height - 6)
            .text(xField);

        // Add a y-axis label.
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text(yField);

        // Add a dot per nation. Initialize the data at 1800, and set the colors.
        var dot = svg.append("g")
            .attr("class", "dots")
            .selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .style("fill", function(d) { return colorScale(color(d)); })
            .on("mouseenter", highlightDot)
            .on("mousemove", moveTooltip)
            .on("mouseleave", unhighlightDot)
            .call(position)
            .sort(order);

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
                .style("left", (d3.event.pageX) + "px")
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
            dot .attr("cx", function(d) { return xScale(x(d)); })
                .attr("cy", function(d) { return yScale(y(d)); })
                .attr("r", function(d) { return radiusScale(radius(d)); });
        }

        // Defines a sort order so that the smallest dots are drawn on top.
        function order(a, b) {
            return radius(b) - radius(a);
        }
    });
}
createBubble(d3.select("#chart"));