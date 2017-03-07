/**
 * Created by martin on 2017-03-03.
 */
var rectSide = 20;

var categories = [];

var itemsPerRow = 4;

//svg is the group element where the legend should be created
function createLegend(svg) {

  var color = d3.scaleOrdinal(d3.schemeCategory20);
  color.domain(categories);

  var width = svg.attr("width"),
      height = svg.attr("height");

  var legend = svg.append("g")
    .attr("class", "bubble-legend");

  //Add a color and a text for each category
  var rows = legend.selectAll("g")
    .data(categories)
    .enter()
    .append("g")
      .attr("transform", function (d, i) {
        var x = 200 * (i%itemsPerRow);  //Change row every fifth element
        var y = 30 * Math.floor(i/itemsPerRow);
        return "translate(" + x + "," + y + ")";
      });

  rows
    .append("rect")
      .attr("width", rectSide)
      .attr("height", rectSide)
      .style("fill", color);

  rows
    .append("text")
    .attr("transform", "translate(" + (+rectSide + 10) + ",15)")
    .attr("text-anchor", "start")
    .style("font-size", 13)
    .text(function (d) {
      return d;
    })
}

function bubbleLegend(groups) {
  categories = groups;
  createLegend(d3.select("#bubble-legend"));
}
