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

var scalerWidth = 100;
//Set button listener
function addFilterButtonListener() {
  var button = $("#add-filter-button");
  button.on("click", createNewFilter);
}

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

function createNewFilter(filter) {

  var filterRow = d3.select("#filter-table")
    .append("tr")
    .attr("class", "filter-row");

  //The text saying which variable is filtered
  filterRow
    .append("td")
    .append("text")
      .text(filter + ": ")
        .attr("style", "font-size: 20px");

  //Add the scale
  var scaleContainer = filterRow.append("td");
  createD3Scaler(scaleContainer, filter);

}

//Function for adding a new filter
function addNewFilter(){

  var row = d3.select("#filter-table")
    .append("tr").attr("class", "filterRow");

  var row2 = $(".filterRow");

  var dropdown = row.append("td")
    .append("select").attr("class", "filterList");

  //Append the options to the dropdown
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
    //TODO: Set selected filter
  });

  //createScaler();
  createD3Scaler(row);
  //jQueryRangeScaler(row.node());
}

//Function for creating the scaler when a filter is selected
function createScaler() {
  //Add the scaler
  var x = d3.scaleLinear()
    .domain([0, 100])   //TODO: Change this to the max and min values of the filter selected
    .range([0, scalerWidth])
    .clamp(true);

  var dispatch = d3.dispatch("sliderChange");

  var slider = d3.select("#filterRow").append("div")
    .attr("class", "slider")
    .style("width", scalerWidth + "px");

  var sliderTray = slider.append("div")
    .attr("class", "slider-tray");

  var sliderHandle = slider.append("div")
    .attr("class", "slider-handle");

  sliderHandle.append("div")
    .attr("class", "slider-handle-icon");

  dispatch.on("sliderChange.slider", function(value) {
    sliderHandle.style("left", x(value) + "px")
  });

  slider.call(d3.drag()
    .on("start", function() {
      dispatch.call("sliderChange", this, x.invert(d3.mouse(sliderTray.node())[0]));

      //dispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
      d3.event.sourceEvent.preventDefault();
    })
    .on("drag", function() {
      dispatch.call("sliderChange", this, x.invert(d3.mouse(sliderTray.node())[0]));
      //dispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
    }));


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
    //Lower bound of the filter
    var min = d3.event.selection[0];
    //Upper bound of the filter
    var max = d3.event.selection[1];
    //Set the filter
    setLimits(x(min), x(max));
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
//Set the limits of the filter
function setLimits(min, max) {
  //console.log("Min: " + min + " Max: " + max);
}