/**
 * Created by martin on 2017-03-01.
 */

function MultiFilter(filterTable, data, filters, onChange) {
    var dropdown = filterTable.select("select");

    filters = filters.map(function (filter) {
        return {
            id: filter.id,
            label: filter.label,
            field: filter.field,
            min: Number.NEGATIVE_INFINITY,
            max: Number.POSITIVE_INFINITY
        };
    });

    createDropdown();

    //Function for adding the dropdown items(e.g. the filters) and making them interactive
    function createDropdown() {
        dropdown.selectAll("option")
            .data(filters, function (d) {
                return d;
            })
            .enter()
            .append("option")
            .attr("value", function (d) {
                return d.field;
            })
            .text(function (d) {
                return d.label;
            });

        dropdown.on("change", function () {
            var selectedFilter = filters.find(function (d) {
                return d.field === dropdown.node().value
            });
            if (selectedFilter.field !== "Select Filter") {
                addFilter(selectedFilter);
                //Hide the selected option from the dropdown
                dropdown.select("option[value=\"" + selectedFilter.field + "\"]")
                    .attr("disabled", "disabled");
                dropdown.property("value", "Select Filter");
            }
        });
    }

//Creates a new filter row that filters the "filter" variable
    function addFilter(filter) {

        var filterRow = filterTable
            .append("tr")
            .attr("class", "filter-row")
            .attr("id", filter.id); //Give the filter rows id that is the name of the filter

        //The text saying which variable is filtered
        filterRow
            .append("td")
            .append("text")
            .text(filter.label + ": ")
            .attr("style", "font-size: 20px");

        //Add the scale
        var scaleContainer = filterRow.append("td");
        createD3Scaler(scaleContainer, filter);
        var buttonContainer = filterRow.append("td");
        createRemoveButton(buttonContainer, filter);
    }

//Container should be a d3 selection
    function createD3Scaler(container, filter) {
        var f = function(d) {return +d[filter.field]};
        var height = 30,
            width = 200;

        var svg = container.append('svg')
            .attr("height", height)
            .attr("width", width);

        var brush = d3.brushX()
            .extent([[0, 0], [width * 0.8, height]]);

        var x = d3.scaleLinear()
            .domain([0, width * 0.8])
            .range(d3.extent(data, f));

        brush.on('start brush end', function() {
            var s = d3.event.selection;
            //Check first that the user made a selection
            if(s != null){
                var sz = s.map(x);
                console.log(sz[0] + " " + sz[1]);
                setFilter(filter, d3.min(sz), d3.max(sz))
            } else {
                setFilter(filter);
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

    function createRemoveButton(container, filter) {

        container.append("div")
            .attr("class", "cssCircle minusSign")
            .html("&#8211;")
            .on("click", function () {
                filterTable.select("#" + filter.id).remove();
                dropdown.select("option[value=\"" + filter.field + "\"]")
                    .attr("disabled", null);
                setFilter(filter);
            });
    }

    function setFilter(filter, min, max) {
        filter.min = min || Number.NEGATIVE_INFINITY;
        filter.max = max || Number.POSITIVE_INFINITY;
        onChange(filters);
    }
}