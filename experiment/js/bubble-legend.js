/**
 * Created by martin on 2017-03-03.
 */
var rectSide = 20;

var categories = [];
var selectedCategories = [];

var itemsPerRow = 6;

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
      .attr("class", "legend-row")
      .attr("transform", function (d, i) {
        var x = 200 * (i%itemsPerRow);  //Change row every fifth element
        var y = 30 * Math.floor(i/itemsPerRow);
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
        //Check if this rect is selected
        var index = selectedCategories.indexOf(category);
        if(index > -1){
          //Remove this element from selected
          selectedCategories.splice(index, 1);
          //Set rect to deselected
          rect.attr("class", "disabled");
        }else{
          //Add this element to the selected
          selectedCategories.push(category);
          //Set rect to selected
          rect.attr("class", "");
        }
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

function bubbleLegend(groups) {
  categories = groups;
  selectedCategories = categories;
  createLegend(d3.select("#bubble-legend"));
}
