/* Source for the donut chart: http://bl.ocks.org/juan-cb/1984c7f2b446fffeedde */

var svg = d3.select("body")
	.append("svg")
	.append("g")

svg.append("g")
	.attr("class", "slices");
svg.append("g")
	.attr("class", "labelName");
svg.append("g")
	.attr("class", "labelValue");
svg.append("g")
	.attr("class", "lines");

var width = 430,
    height = 225,
	radius = Math.min(width, height) / 2;

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});

var arc = d3.svg.arc()
	.outerRadius(radius * 0.8)
	.innerRadius(radius * 0.4);

var outerArc = d3.svg.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);


var div = d3.select("body").append("div").attr("class", "toolTip");

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var colorRange = d3.scale.category20();
var color = d3.scale.ordinal()
	.range(colorRange.range());

  datasetTeam = [
		{label:"Meetings", value:125},
		{label:"Research", value:57},
		{label:"Data handling", value:60},
		{label:"Website", value:31},
		{label:"Graphic design", value:16},
		{label:"Presentations", value:13},
		{label:"Video production", value:12},
		{label:"Tests", value:40},
		{label:"Coordination", value:56}
  ];

	datasetHaisheng = [
		{label:"Meetings", value:18}
	];

  datasetJoaquin = [
    {label:"Research", value:35},
    {label:"Data handling", value:15},
    {label:"Tests", value:2},
    {label:"Presentations", value:4},
    {label:"Website", value:1},
    {label:"Coordination", value:35},
    {label:"Meetings", value:18}
  ];

  datasetJori = [
    {label:"Meetings", value:15},
    {label:"Research", value:12},
    {label:"Data handling", value:10},
    {label:"Website", value:3},
    {label:"Graphic design", value:10},
    {label:"Presentations", value:4},
    {label:"Video production", value:8},
    {label:"Tests", value:24},
    {label:"Coordination", value:6}
  ];

  datasetLeung = [
    {label:"Meetings", value:17},
    {label:"Development", value:65},
    {label:"Presentations", value:2}
  ];

  datasetMans = [
    {label:"Meetings", value:14}
  ];

  datasetMartin = [
    {label:"Meetings", value:16}
  ];
  datasetThea = [
    {label:"Meetings", value:18},
    {label:"Research", value:15},
    {label:"Data handling", value:15},
    {label:"Development", value:2},
    {label:"Presentations", value:2},
    {label:"Website", value:15},
    {label:"Graphic design", value:6},
    {label:"Video production", value:4},
    {label:"Tests", value:4}
  ];
  datasetVictor = [
    {label:"Meetings", value:12},
    {label:"Development", value:50},
    {label:"Research", value:5},
    {label:"Tests", value:10},
    {label:"Presentations", value:1},
    {label:"Website", value:12},
    {label:"Coordination", value:15},
    {label:"Data handling", value:20}
  ];

change(datasetTeam);
document.getElementById("defaultOpen").click();

  /* Source for the tab navigator: https://www.w3schools.com/howto/howto_js_tabs.asp*/
  function openTeamMember(evt, teamMember) {
      // Declare all variables
      var i, tabcontent, tablinks;

      // Get all elements with class="tabcontent" and hide them
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
      }

      // Get all elements with class="tablinks" and remove the class "active"
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
          tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      // Show the current tab, and add an "active" class to the button that opened the tab
      document.getElementById(teamMember).style.display = "block";
      evt.currentTarget.className += " active";

	if (teamMember == "Team")
	{
		change(datasetTeam);
	}
	else if (teamMember == "Haisheng")
	{
		change(datasetHaisheng);
	}
	else if (teamMember == "Joaquin")
	{
		change(datasetJoaquin);
	}
	else if (teamMember == "Jori")
	{
		change(datasetJori);
	}
  else if (teamMember == "Leung")
	{
		change(datasetLeung);
	}
  else if (teamMember == "Mans")
  {
    change(datasetMans);
  }
  else if (teamMember == "Martin")
  {
    change(datasetMartin);
  }
  else if (teamMember == "Thea")
  {
    change(datasetThea);
  }
  else if (teamMember == "Victor")
  {
    change(datasetVictor);
  }
}

function change(data) {

	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), function(d){ return d.data.label });

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return color(d.data.label); })
        .attr("class", "slice");

    slice
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        })
    slice
        .on("mousemove", function(d){
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html((d.data.label)+"<br>"+(d.data.value)+"h");
        });
    slice
        .on("mouseout", function(d){
            div.style("display", "none");
        });
		slice
				.on("click", function(d){
					toggle_visibility(d.data.label);
				});

    slice.exit()
        .remove();

				function toggle_visibility(id) {
					var e = document.getElementById(id);
					if(e.style.display == 'block')
					e.style.display = 'none';
					else
					e.style.display = 'block';
				}

    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labelName").selectAll("text")
        .data(pie(data), function(d){ return d.data.label });

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return (d.data.label+": "+d.value+"h");
        });

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text
        .transition().duration(1000)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        })
        .text(function(d) {
            return (d.data.label+": "+d.value+"h");
        });


    text.exit()
        .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), function(d){ return d.data.label });

    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();
};
