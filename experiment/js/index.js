$(document).ready(function () {
    var idMap = {
        "select-x-axis": "x",
        "select-y-axis": "y",
        "select-r-axis": "r"

    };

    var category = {
        field: 'Category',
        value: 'ALL'
    };

    var options = {
        key: "Food",
        x: "Fat (g)",
        y: "Fat (g)",
        r: "CO2 footprint",
        color: "Category"
    };

    var filters = [
        {
            id: 'fat-filter',
            label: 'Fat (g)',
            field: 'Fat (g)'
        },
        {
            id: 'carbohydrates-filter',
            label: 'Carbohydrate (g)',
            field: 'Carbohydrate (g)'
        },
        {
            id: 'proteins-filter',
            label: 'Protein (g)',
            field: 'Protein (g)'
        },
        {
            id: 'calories-filter',
            label: 'Energy (kcal)',
            field: 'Energy (kcal)'
        }
    ];

// Load the data.
    d3.csv("../data/food.csv", function (data) {
        // Create filter selection
        var groups = _.uniqBy(data.map(function (datum) {
            return datum[category.field]
        }));

        var bubble = new BubbleChart(d3.select("#bubble"), category.field);

        groups.forEach(function (filter) {
            $("#select-category").append("<option value='" + filter + "'>" + filter + "</option>");
        });

        $("#select-category")
            .val(category.value)
            .on("change", function () {
                category.value = $(this).val();
                render();
            });

        // Create axis definition

        var cols = data.columns.filter(function (col) {
            return !isNaN(data[0][col]);
        });

        Object.keys(idMap).forEach(function (id) {
            var axis = idMap[id];
            cols.forEach(function (col) {
                $("#" + id).append("<option value='" + col + "'>" + col + "</option>");
            });
            $("#" + id)
                .val(options[axis])
                .on('change', function () {
                    options[axis] = $(this).val();
                    render();
                });
        });

        var multiFilter = new MultiFilter(d3.select("#filter-table"), data, filters, bubble.updateFilter);
        //createLegend(d3.select("#bubble-legend"));

        //Send the category data to the bubble legend
        var bubbleLegend = new BubbleLegend(groups, bubble.updateGroups);


        createSearch($("#search-box"), data, options.key, 'Category');
        bubble.setDB(data);
        render();

        function render() {
            console.log("render");
            // $("#bubble").empty();

            bubble.createBubble(data, options, false, groups);
        }
    });

    function loadDonut() {

    }
})