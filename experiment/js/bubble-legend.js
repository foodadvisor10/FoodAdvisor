/**
 * Created by martin on 2017-03-03.
 */

function BubbleLegend(categories, onLegendClick) {
  var rectSide = 20;
  var legendRowWidth = 150;
  var legendRowHeight = 30;
  //Add an "all" category
  categories.push("ALL");

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
        var x = legendRowWidth * (i % itemsPerRow);  //Change row every fifth element
        var y = legendRowHeight * Math.floor(i / itemsPerRow);
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
        //Handle the case of "ALL" separately
        if(category == "ALL"){
          //If it was disabled then set all categories to true
          var selected = (rect.attr("class") == "disabled");
          for(var i = 0; i < categories.length; i++){
            selectedCategories[categories[i]] = selected;
          }
          //Set the "class" attribute for the rect elements
          legend.selectAll("rect")
            .attr("class", function () {
              return selected ? "" : "disabled";
            });
        }else {
          //Set the category to true if it is not selected and the opposite if selected
          selectedCategories[category] = !selectedCategories[category];
          if (selectedCategories[category]) {
            //Set rect to selected
            rect.attr("class", "");
          } else {
            //Set rect to deselected
            rect.attr("class", "disabled");
          }
        }
        onLegendClick(selectedCategories);
      });

    rows
      .append("text")
      .attr("transform", "translate(" + (+rectSide + 10) + ",15)")
      .attr("text-anchor", "start")
      .style("font-size", 13)
      .text(function (d) {
        return d;
      });

    createSelectButtons();
  }

  function createSelectButtons() {
    var selectButton = d3.select("#select-all-container")
      .append("div")
      .append("button")
      .attr("id", "select-button")
      .html("Select All")
      .on("click", selectAllCategories);

    var deselectButton = d3.select("#select-all-container")
      .append("div")
      .append("button")
      .attr("id", "deselect-button")
      .html("Deselect All")
      .on("click", deselectAllCategories);
  }

  function selectAllCategories() {

  }

  function deselectAllCategories() {

  }

}
