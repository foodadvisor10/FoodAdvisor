/**
 * Created by marti on 2017-03-01.
 */

var filters = [
  "Select Filter",
  "Fat",
  "Carbohydrates",
  "Proteins",
  "Calories"
];
//var to keep track of the ids of the filters
var nrOfCreatedFilters = 0;
var scalerWidth = 100;
//Set button listener
function addFilterButtonListener() {
  var button = $("#add-filter-button");
  button.on("click", createNewFilter);
}

//Function for adding the dropdown items(e.g. the filters) and making them interactive
function addOptionsToFilterDropdown() {

  var dropdown = d3.select("#filter-dropdown");

  dropdown.selectAll("option")
    .data(filters)
    .enter()
    .append("option")
      .attr("value", function (d) {
        return d;
      })
      .text(function (d) {
        return d;
      });

  dropdown.on("change", function () {
        var selectedFilter = $("#filter-dropdown").val();
        if(selectedFilter != "Select Filter"){
          createNewFilter(selectedFilter);
        }
      });
}

//Creates a new filter row that filters the "filter" variable
function createNewFilter(filter) {

  var filterId = "filter-nr-" + ++nrOfCreatedFilters;
  var filterRow = d3.select("#filter-table")
    .append("tr")
    .attr("class", "filter-row")
    .attr("id", filterId); //Give the filter rows an unique id

  //The text saying which variable is filtered
  filterRow
    .append("td")
    .append("text")
      .text(filter + ": ")
        .attr("style", "font-size: 20px");

  //Add the scale
  var scaleContainer = filterRow.append("td");
  createD3Scaler(scaleContainer, filter);
  var buttonContainer = filterRow.append("td");
  createRemoveButton(buttonContainer, filterId);
}

//Container should be a d3 selection
function createD3Scaler(container, category){

  var height = 30,
    width = 120;

  var svg = container.append('svg')
    .attr("height", height)
    .attr("width", width);

  var brush = d3.brushX()
    .extent([[0, 0], [width*0.8, height]]);

  var x = d3.scaleLinear()
    .domain([0, width*0.8])
    .range([0, 100]);

  brush.on('end', function() {
    //Check first that the user made a selection
    if(d3.event.selection != null){
      //Lower bound of the filter
      var min = d3.event.selection[0];
      //Upper bound of the filter
      var max = d3.event.selection[1];
      //Set the filter
      setLimits(x(min), x(max));
    }
  });

  var g = svg.append('g')
    .attr("class", "brush")
    .attr("transform", "translate(10, 2)")
    .call(brush);

  g.selectAll('.overlay')
    .attr("style", "fill: #4b9e9e");
  g.selectAll('.selection')
    .attr("style", "fill: #78c5c5");
  g.selectAll('.handle')
    .attr("style", "fill: #276c86");

}

function createRemoveButton(container, filterId) {

  container.append("div")
    .attr("class", "cssCircle minusSign")
    .html("&#8211;")
    .on("click", function () {
      d3.select("#" + filterId).remove();
    });

  //TODO: Add click listener
}
//Container should be a jQuery selection
function jQueryRangeScaler(container) {

 // var row = $(".filterRow").append("<div>");

  container.append("<div>")
    .attr("class", "range-slider");

  container.find(".range-slider").slider({
    range: true,
    min: 0,
    max: 100,
    values: [ 0, 100 ],
    slide: function( event, ui ) {
      var begin = d3.min([ui.values[0], 100]);
      var end = d3.max([ui.values[1], 0]);
      console.log("begin:", begin, "end:", end);

    }
  });

}

//Set the limits of the filter
function setLimits(min, max) {
  //console.log("Min: " + min + " Max: " + max);
}