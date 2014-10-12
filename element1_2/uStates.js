
var width = 600,
    height = 400;


var projection = d3.geo.albersUsa()
    .scale(2000/3)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);



var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");


var sampleData ={};	/* Sample random data. */	

var datas ={};
d3.csv("state_sum.csv", function(data) {
	data.forEach(function(d) {
        datas[d.State] = {
            Total_Payments: d.Total_Payments, 
            Total_Discharge: d.Total_Discharge,
            Total_Payments_per_Discharge: d.Total_Payments_per_Discharge 
        };
    });

    var dataArray = new Array;
    for(var key in datas) {
        dataArray.push(+ datas[key].Total_Payments);
    }
    var max_val = d3.max(dataArray);
    var min_val = d3.min(dataArray);

    // now we add color
    for(var key in datas){
    	var val = datas[key].Total_Payments;
    	datas[key].color = d3.interpolate("#ffffcc", "#800026")((val-min_val)/(max_val-min_val));
    }
    // now we begin to draw the map
    d3.json("us.json", function(error, us) {
	    g.append("g")
	        .attr("id", "states")
	        .selectAll("path")
	        .data(topojson.feature(us, us.objects.states).features)
	        .enter().append("path")
	        .attr("d", path)
	        .on("mouseover", mouseOver).on("mouseout", mouseOut)
	        .attr("fill", function(){
	        	var curstate = this.__data__.id;
	        	try{
					var i = datas[curstate].color;
				}
				catch(err){
					return "black";
				}
				return datas[curstate].color;
	        });

	    g.append("path")
	        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
	        .attr("id", "state-borders")
        	.attr("d", path);
	});
});

function mouseOver(d){
	d3.select("#tooltip").transition().duration(200).style("opacity", .9);      
	
	d3.select("#tooltip").html(tooltipHtml(d.id, datas[d.id]))  
		.style("left", (d3.event.pageX) + "px")     
		.style("top", (d3.event.pageY - 28) + "px");
}

function mouseOut(){
	d3.select("#tooltip").transition().duration(500).style("opacity", 0);
}

function tooltipHtml(n, d){	/* function to create html content string in tooltip div. */
	return "<h4>"+n+"</h4><table>"+
		"<tr><td>Total_Payments</td><td>"+(d.Total_Payments)+"</td></tr>"+
		"<tr><td>Total_Discharge</td><td>"+(d.Total_Discharge)+"</td></tr>"+
		"<tr><td>Total_Payments_per_Discharge</td><td>"+(d.Total_Payments_per_Discharge)+"</td></tr>"+
		"</table>";
}
