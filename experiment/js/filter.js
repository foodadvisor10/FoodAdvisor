/**
 * Created by marti on 2017-03-01.
 */

var filters = [
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

//Function for adding a new filter
function createNewFilter(){

  var dropdown = d3.select("#filter-table")
    .append("tr").attr("id", "filterRow")
    .append("td")
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
    createScaler();
  })
}

//Function for creating the scaler when a filter is selected
function createScaler() {
  //Add the scaler
  var x = d3.scaleLinear()
    .domain([0, 100])   //TODO: Change this to the max and min values of the filter selected
    .range([0, scalerWidth]);

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

  slider.call(d3.drag()
    .on("start", function() {
      dispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
      d3.event.sourceEvent.preventDefault();
    })
    .on("drag", function() {
      dispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
    }));

  dispatch.on("sliderChange.slider", function(value) {
    sliderHandle.style("left", x(value) + "px")
  });

}