$(document).ready(function () {
    // var idMap = {
    //     "select-r-axis": "r"
    //
    // };

    var category = {
        field: 'Category',
        value: 'ALL'
    };

    var options = {
        key: "Food",
        x: "CO2 footprint",
        y: "Energy (kcal)",
        r: "CO2 footprint",
        color: "Category"
    };
      // Scroll animation

      $(document).ready(function () {
           $('a[href^="#"]').on('click', function (e) {
               e.preventDefault();

               var target = this.hash,
                   $target = $(target);

               $('html, body').stop().animate({
                   'scrollTop': $target.offset().top - 80
               }, 900, 'swing', function () {
               });
           });
       }); 

// Load the data.
    d3.csv("../data/food.csv", function (data) {
        // Create filter selection
        var groups = _.uniqBy(data.map(function (datum) {
            return datum[category.field]
        }));

        var newColors = [
          "#a6cee3",       //Dairy
          "#b2df8a",       //Fruits and berries
          "#fb9a99",       //Sweets
          "#33a02c",       //Vegetables
          "#e31a1c",       //Meat
          "#fdbf6f",       //Grains
          "#d9d9d9",       //Oils
          "#ff7f00",       //Cheese
          "#6a3d9a",       //Root vegetables
          "#543005",       //Legumes
          "#1f78b4"       //Fish and seafood
        ];

        // groups.forEach(function (filter) {
        //     $("#select-category").append("<option value='" + filter + "'>" + filter + "</option>");
        // });
        //
        // $("#select-category")
        //     .val(category.value)
        //     .on("change", function () {
        //         category.value = $(this).val();
        //         render();
        //     });

        // Create axis definition

        var cols = data.columns.filter(function (col) {
            return !isNaN(data[0][col]);
        });
        var bubble = new BubbleChart(d3.select("#bubble"), category.field, cols, groups, newColors);

        // Object.keys(idMap).forEach(function (id) {
        //     var axis = idMap[id];
        //     cols.forEach(function (col) {
        //         $("#" + id).append("<option value='" + col + "'>" + col + "</option>");
        //     });
        //     $("#" + id)
        //         .val(options[axis])
        //         .on('change', function () {
        //             // TODO: fetch option from obj
        //             options[axis] = $(this).val();
        //             bubble.updateOptions(options);
        //         });
        // });

        var allFilters = [];
        var removeString = "fatty";
        for(var i = 0; i < cols.length; i++){
          //Dont add the stings containing "fatty"
           if(cols[i].toLowerCase().indexOf(removeString) == -1){
             var filterObj = {
               id: changeSpacesToHyphens(cols[i]),
               label: cols[i],
               field: cols[i]
             };
             allFilters.push(filterObj);
           }
        }

        var multiFilter = new MultiFilter(d3.select("#filter-table"), data, allFilters, bubble.updateFilter);
        //createLegend(d3.select("#bubble-legend"));

        //Send the category data to the bubble legend
        var bubbleLegend = new BubbleLegend(groups, bubble.updateGroups, newColors);


        createSearch($("#search-box"), data, options.key, 'Category');
        bubble.setDB(data);

        bubble.createBubble(data, options, false);

    });
    function changeSpacesToHyphens(str){
        str = str.replace(/\W+/g, '-').toLowerCase();
        return str;
    }
});
