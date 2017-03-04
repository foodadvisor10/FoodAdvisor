$(document).ready(function () {
    var idMap = {
        "select-x-axis": "x",
        "select-y-axis": "y",
        "select-filter": "z",
        "select-r-axis": "r"

    };

    var filter = {
        field: 'Category',
        value: 'ALL'
    };
    var options = {
        key: "Food",
        x: "Fat (g)",
        y: "Fat (g)",
        z: "Fat (g)",
        r: "CO2 footprint",
        color: "Category"
    };

// Load the data.
    d3.csv("../data/food.csv", function (data) {
        // Create filter selection
        var groups = _.uniqBy(data.map(function (datum) {
            return datum[filter.field]
        }));

        //Send the category data to the bubble legend
        bubbleLegend(groups);

        var bubble = new BubbleChart(d3.select("#bubble"));

        groups.forEach(function (filter) {
            $("#select-category").append("<option value='" + filter + "'>" + filter + "</option>");
        });

        $("#select-category")
            .val(filter.value)
            .on("change", function () {
                filter.value = $(this).val();
                render();
            });

        // Create axis definition

        var cols = data.columns.filter(function (col) {
            return !isNaN(data[0][col]);
        });

        Object.keys(idMap).forEach(function (id) {
            var axis = idMap[id];
            cols.forEach(function (col) {
                $("#" + id).append("<option value='" + col + "'>" + col + "</option");
            });
            $("#" + id)
                .val(options[axis])
                .on('change', function () {
                    options[axis] = $(this).val();
                    render();
                });
        });

        addOptionsToFilterDropdown();
        //createLegend(d3.select("#bubble-legend"));

        createSearch($("#search-box"), data, options.key, 'Category');
        render();

        function render() {
            console.log("render");
            // $("#bubble").empty();

            bubble.createBubble(data, options, filter, groups);
        }
    });

    function loadDonut() {

    }
})