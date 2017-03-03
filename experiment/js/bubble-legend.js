/**
 * Created by martin on 2017-03-03.
 */
var rectSide = 20;

var categories = [
  "Meat",
  "Vegetables",
  "Dairy"
];



//svg is the group element where the legend should be created
function createLegend(svg) {
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  color.domain(categories);

  console.log(color.range());
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
        var x = 100 * i;
        var y = 0;
        return "translate(" + x + "," + y + ")";
      })

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

