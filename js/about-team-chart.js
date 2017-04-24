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
	{label:"Data handling", value:91},
	{label:"Research", value:79},
	{label:"Graphic design", value:22},
	{label:"Presentations", value:14},
	{label:"Video production", value:27},
	{label:"Development", value:184},
	{label:"Website", value:40},
	{label:"Tests", value:69},
	{label:"Coordination", value:71},
	{label:"Meetings", value:130}
];

datasetHaisheng = [
	{label:"Meetings", value:18},
	{label:"Development", value:6},
	{label:"Data handling", value:21},
	{label:"Research", value:12},
	{label:"Testing", value:25},
	{label:"Coordination", value:11}
];

datasetJoaquin = [
	{label:"Research", value:30},
	{label:"Website", value:5},
	{label:"Data handling", value:15},
	{label:"Development", value:10},
	{label:"Presentations", value:4},
	{label:"Coordination", value:20},
	{label:"Meetings", value:18},
	{label:"Tests", value:2}
];

datasetJori = [
	{label:"Meetings", value:20},
	{label:"Research", value:14},
	{label:"Data handling", value:10},
	{label:"Website", value:7},
	{label:"Graphic design", value:16},
	{label:"Presentations", value:4},
	{label:"Video production", value:8},
	{label:"Tests", value:24},
	{label:"Coordination", value:10}
];

datasetLeung = [
	{label:"Meetings", value:17},
	{label:"Development", value:65},
	{label:"Presentations", value:2}
];

datasetMans = [
	{label:"Data handling", value:10},
	{label:"Video production", value:15},
	{label:"Meetings", value:14},
	{label:"Development", value:5},
	{label:"Research", value:5},
	{label:"Tests", value:1}
];

datasetMartin = [

	{label:"Research", value:5},
	{label:"Website", value:5},
	{label:"Presentations", value:1},
	{label:"Tests", value:3},
	{label:"Development", value:50},
	{label:"Meetings", value:16}
];
datasetThea = [

	{label:"Data handling", value:15},
	{label:"Development", value:2},
	{label:"Presentations", value:2},
	{label:"Graphic design", value:6},
	{label:"Video production", value:4},
	{label:"Tests", value:4},
	{label:"Website", value:15},
	{label:"Meetings", value:18},
	{label:"Research", value:15}
];
datasetVictor = [
	{label:"Data handling", value:20},
	{label:"Development", value:50},
	{label:"Research", value:5},
	{label:"Tests", value:10},
	{label:"Presentations", value:1},
	{label:"Website", value:12},
	{label:"Coordination", value:15},
	{label:"Meetings", value:12}
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

	/* The following places a picture inside the donut chart */
	var imgurl = './about-team-files/' + teamMember + '-fruit.jpg'

	svg.selectAll("defs").remove();

	var defs = svg.append("defs").attr("id", "imgdefs")

	var picture = defs.append("pattern")
	.attr("id", "picture")
	.attr("height", 1)
	.attr("width", 1)
	.attr("x", "0")
	.attr("y", "0")
	picture.selectAll("*").remove();
	picture.append("image")
	.attr("x", -15)
	.attr("y", -15)
	.attr("height", 120)
	.attr("width", 120)
	.attr("xlink:href", imgurl)
	svg.selectAll("circle").remove();
	svg.append("circle")
	.attr("r", 45)
	.attr("cy", 0)
	.attr("cx", 0)
	.attr("fill", "url(#picture)")
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

	// The following code is commented because the number of hours is now hiden.
	/*slice
	.on("mousemove", function(d){
		div.style("left", d3.event.pageX+10+"px");
		div.style("top", d3.event.pageY-25+"px");
		div.style("display", "inline-block");
		div.html((d.data.label)+"<br>"+(d.data.value)+"h");
	});
	slice
	.on("mouseout", function(d){
		div.style("display", "none");
	});*/
	slice.exit()
	.remove();

	/* ------- TEXT LABELS -------*/

	var text = svg.select(".labelName").selectAll("text")
	.data(pie(data), function(d){ return d.data.label });

	text.enter()
	.append("text")
	.attr("dy", ".35em")
	.text(function(d) {
		// The number of hours is no longer shown.
		return (d.data.label/*+": "+d.value+"h"*/);
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
		return (d.data.label/*+": "+d.value+"h"*/);
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
