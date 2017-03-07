/**
 * Created by martin on 2017-03-03.
 */

function BubbleLegend(categories, onLegendClick) {
    var that = this;
    var rectSide = 20;

    var selectedCategories = {};

    var itemsPerRow = 6;

    for (var i = 0; i < categories.length; i++) {
        selectedCategories[categories[i]] = true;
    }
    drawLegend(d3.select("#bubble-legend"));

//svg is the group element where the legend should be created
    function drawLegend(svg) {
        var color = d3.scaleOrdinal(d3.schemeCategory20);
        color.domain(categories);

        var width = svg.attr("width"),
            height = svg.attr("height");

        var legend = svg.append("g")
            .attr("class", "bubble-legend")
            .attr("transform", "translate(5,5)");

        //Add a color and a text for each category
        var rows = legend.selectAll("g")
            .data(categories)
            .enter()
            .append("g")
            .attr("class", "legend-row")
            .attr("transform", function (d, i) {
                var x = 200 * (i % itemsPerRow);  //Change row every fifth element
                var y = 30 * Math.floor(i / itemsPerRow);
                return "translate(" + x + "," + y + ")";
            });

        rows
            .append("rect")
            .attr("width", rectSide)
            .attr("height", rectSide)
            .attr("category", function (d) {
                return d;
            })
            .style("fill", color)
            .style("stroke", color)
            .on("click", function () {
                var rect = d3.select(this);
                var category = rect.attr("category");
                //Set the category to true if it is not selected and the opposite if selected
                selectedCategories[category] = !selectedCategories[category];
                if (selectedCategories[category]) {
                    //Set rect to selected
                    rect.attr("class", "");
                } else {
                    //Set rect to deselected
                    rect.attr("class", "disabled");
                }
                onLegendClick(selectedCategories);
                console.log("slected")
            });

        rows
            .append("text")
            .attr("transform", "translate(" + (+rectSide + 10) + ",15)")
            .attr("text-anchor", "start")
            .style("font-size", 13)
            .text(function (d) {
                return d;
            })
    }

}
