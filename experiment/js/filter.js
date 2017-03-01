/**
 * Created by marti on 2017-03-01.
 */

var filters = [
  "Fat",
  "Carbohydrates",
  "Proteins",
  "Calories"
];
//Set button listener
function addFilterButtonListener() {
  var button = $("#filter-button");
  button.on("click", createNewFilter);
}

//Function for adding a new filter
function createNewFilter(){

  var dropdown = d3.select("#filter-table")
    .append("tr")
    .append("td")
    .append("select").attr("class", "filterList");

  //Append the options to the dropdown
  var options = dropdown.selectAll("option")
    .data(filters)
    .enter()
    .append("option")
      .attr("value", function (d) {
        return d;
      })
      .text(function (d) {
        return d;
      });
}