var currentlySelectedPieChart = 'Apples';
var firstLoad = true;
//1 == macro
//2 == micro
var currentlySelectedSizing = 2;
var currentFood;

var colorsize = {   "Potassium (mg)" : "#5061fb",
                    "Phosphorus (mg)" : "#DD1133",
                    "Fat (g)" : "#FFFF3C",
                    "Carbohydrate (g)" : "#996633",
                    "Magnesium (mg)" : "#ff66cc",
                    "Water (g)" : "#0099ff",
                    "Protein (g)" : "#ff5050",
                    "Fibre (g)" : "#663300",
                    "Sodium (mg)" : "#FFFFE0",  //Color very feint. 
                    "Zinc (mg)" : "#778899",
                    "Sugar total (g)" : "#FFEFD5",
                    "Sucrose (g)" : "#2E8B57",
                    "Disaccharides (g)" : "#FA8072",
                    "Vitamin B-6 (mg)" : "#00FF7F",
                    "Iron (mg)" : "#FF4500",
                    "Sum of polyunsaturated fatty acids (g)" : "#ff944d",
                    "Sum of monounsaturated fatty acids (g)" : "#ff751a",
                    "Sum of saturated fatty acids (g)" : " #e65c00",
                    "Monosaccharides (g)" : "#00cc66",
                    "Salt (g)" : "#DDA0DD",
                    "Cholesterol (mg)" : "#EEE8AA",
                    "Vitamin K (µg)" : "#CD853F",
                    "Iodide (µg)" : "#B0E0E6",
                    "Vitamin E (mg)" : "#800080",
                    "Vitamin D (µg)" : "#fb7921",
                    "Selenium (µg)" : "#cc6699",
                    "Vitamin C (mg)" : "#ffcc00",
                    "Vitamin B-12 (µg)" : "#66ffff",
                    "Wholegrain total (g)" : "#FC2543"
                    };

// var currentFood = "";
function pieChart(a) {
    //This is for initial load food. i.e our rice. 
    if (a == null){
        a = {"Energy (kcal)":"364.6"};
    }

    if(currentlySelectedPieChart == 'Heavy cream fat 40%'){
        currentlySelectedPieChart = 'hc';
    }
    currentFood = a;

    $("#chart").find("svg").remove();
    (function (d3) {
        'use strict';

        var width = 440 *0.7;
        var height = 840 *.7;
        var radius = Math.min(width, 420) / 3;
        var donutWidth = 39;//75;
        var legendRectSize = 18;
        var legendSpacing = 3;

        var marginPie = { top: 20 + radius, left: 20 + radius};


        var color = d3.scaleOrdinal(d3.schemeCategory20);
        var svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        if(!firstLoad){
            svg.attr('opacity', 0)
        }
        firstLoad = false;
        var donut = svg.append('g')
            // .style('margin-left', '500px');
            //.attr('transform', 'translate(0, 0)');
            .attr('transform', 'translate(' + (marginPie.left) +
            ',' + (marginPie.top) + ')');
        var arc = d3.arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);

        var pie = d3.pie()
            .value(function (d) {
                return d.count;
            })
            .sort(null);

        var tooltip = d3/*.select('body')*/.select("#chart")
            .append('div')
            .attr('class', 'tooltip');

        tooltip.append('div')
            .attr('class', 'label');

        tooltip.append('div')
            .attr('class', 'count');

        tooltip.append('div')
            .attr('class', 'percent');

        // THis function will be used in future when we differ from Macro file and Micro file.
        // Or we just redo the system and use JSON objects and yeah.. dynamically update.             
       d3.csv('../data/food/'+currentlySelectedSizing+'/' + currentlySelectedPieChart + "_" + currentlySelectedSizing + '.csv', function (error, dataset) {
        // d3.csv('../data/food/' + currentlySelectedPieChart + '.csv', function (error, dataset) {

            //console.log(dataset);
            if (error) {
                document.getElementById("titlehead").innerHTML = "This is not supposed to happen! No data was found for this food.";
            } else {
                if(currentlySelectedSizing == 2){
                    document.getElementById("titlehead").innerHTML = "<form><input type=\"radio\" name=\"chart_style\" value=\"macro\" onclick=\"updateChart(2)\" checked> Macro <input type=\"radio\" name=\"chart_style\" value=\"micro\" onclick=\"updateChart(1)\"> Micro \n</form>";
                } else {
                    document.getElementById("titlehead").innerHTML = "<form><input type=\"radio\" name=\"chart_style\" value=\"macro\" onclick=\"updateChart(2)\"> Macro <input type=\"radio\" name=\"chart_style\" value=\"micro\" onclick=\"updateChart(1)\" checked> Micro \n</form>";
                }
                dataset.forEach(function (d) {
                    d.count = +d.count;
                    d.enabled = true;
                })
                dataset = dataset.filter(function (d) {
                    return d.count !== 0;
                }).sort(function (a, b) {
                    return b.count - a.count;
                });

                if(currentlySelectedPieChart == "hc"){
                    currentlySelectedPieChart = "Heavy cream fat 40%";
                }

                var textsize = "20px"                
                if(currentlySelectedPieChart.length > 14){
                    textsize = "12px";
                }
                if (currentlySelectedPieChart.length > 22){
                    textsize ="9.5px";
                }
                    // console.log(currentlySelectedPieChart.length);

                donut.append("text")
                    .style("text-anchor", "middle")
                    .style("font-size", textsize)
                    .attr("dy", "0em")
                    .text(currentlySelectedPieChart);

                donut.append("text")
                    .style("text-anchor", "middle")
                    .style("font-size", "15px")
                    .attr("dy", "1em")
                    .text(a["Energy (kcal)"] + " (kcal)")

                //return;

                var path = donut.selectAll('path')
                    .data(pie(dataset))
                    .enter()
                    .append('path')
                    .attr('d', arc)
                    .attr('fill', function (d, i) {
                        color(d.data.label)
                        return colorsize[d.data.label];
                        // return color(d.data.label);
                    })
                    .each(function (d) {
                        this._current = d;
                    });

                path.on('mouseover', function (d) {
                    var total = d3.sum(dataset.map(function (d) {
                        return (d.enabled) ? d.count : 0;
                    }));
                    var percent = Math.round(1000 * d.data.count / total) / 10;
                    var measurement = d.data.label.substring(d.data.label.indexOf("("),d.data.label.length);
                    tooltip.select('.label').html(d.data.label.substring(0, d.data.label.indexOf("(")).trim());
                    tooltip.select('.count').html(d.data.count + " " + measurement);
                    tooltip.select('.percent').html(percent + '%');
                    tooltip.style('display', 'block');
                    // tooltip.style('position', 'absolute');
                });

                path.on('mouseout', function () {
                    tooltip.style('display', 'none');
                });

                // Mouse over funciton
                path.on('mousemove', function (d) {
                    var coords = d3.mouse(svg.node());
                    tooltip
                     .style('top', (coords[1] - 40) + 'px')
                     .style('left', (coords[0] + 10) + 'px');
                });
                var legend = donut.selectAll('.legend')
                    .data(color.domain())
                    .enter()
                    .append('g')
                    // .style('overflow', 'auto')
                    .attr('class', 'legend')
                    // .attr('transform', 'translate(500,500)')
                    // .style('float', 'left')
                    // .attr('width', 100)
                    // .style('width', 100)
                    .attr('transform', function (d, i) {
                        var height = legendRectSize + legendSpacing;
                        var offset = height * dataset.length / 2;
                        var horz = -2 * legendRectSize + 220;
                        var vert = i * height - offset + 30;
                        return 'translate(' + horz + ',' + vert + ')';
                    });

                legend.append('rect')
                    .attr('width', legendRectSize)
                    .attr('height', legendRectSize)
                    .style('fill', function(d){return colorsize[d];})  
                    .style('stroke', function(d){return colorsize[d];})

                    // .style('text-align' , 'center')
                    .on('click', function (label) {
                        var rect = d3.select(this);
                        var enabled = true;
                        var totalEnabled = d3.sum(dataset.map(function (d) {
                            return (d.enabled) ? 1 : 0;
                        }));

                        if (rect.attr('class') === 'disabled') {
                            rect.attr('class', '');
                        } else {
                            if (totalEnabled < 2) return;
                            rect.attr('class', 'disabled');
                            enabled = false;
                        }

                        pie.value(function (d) {
                            if (d.label === label) d.enabled = enabled;
                            return (d.enabled) ? d.count : 0;
                        });

                        path = path.data(pie(dataset));

                        path.transition()
                            .duration(750)
                            .attrTween('d', function (d) {
                                var interpolate = d3.interpolate(this._current, d);
                                this._current = interpolate(0);
                                return function (t) {
                                    return arc(interpolate(t));
                                };
                            });
                    });
                legend.append('text')
                    .attr('x', legendRectSize + legendSpacing)
                    .attr('y', legendRectSize - legendSpacing)
                    // .style('z-index', 100)
                    // .style('width', 1)
                    // .style('overflow','auto')
                    .text(function (d) {
                        return d;
                    });
            }
        });
    })(window.d3);
}

function updateChart(chart){
    currentlySelectedSizing = chart;
    $("#chart svg").attr("id","chart_transition");
    window.setTimeout(updateChart2,250);

}
function updateChart2(){
    // document.getElementByClass().innerHTML = "";
    pieChart(currentFood);
    $("#chart svg").attr("id","chart_fadein");

}




