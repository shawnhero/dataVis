e1();
var onchange1;

var get_state_color;
function e1(){
	var width = 320,
	    height = 350;


	var projection = d3.geo.albersUsa()
	    .scale(2000/5)
	    .translate([width / 2, height / (2/0.8)]);

	var path = d3.geo.path()
	    .projection(projection);
	var svg = d3.select("#ele1").append("svg")
	    .attr("width", width)
	    .attr("height", height);

	svg.append("rect")
	    .attr("class", "background")
	    .attr("width", width)
	    .attr("height", height);

	var g = svg.append("g");


	var sampleData ={};	/* Sample random data. */	

	var datas ={};
	d3.csv("data/state_sum_2.csv", function(data) {
		data.forEach(function(d) {
	        datas[d.State] = {
	            Total_Payments: d.Total_Payments, 
	            Total_Discharge: d.Total_Discharge,
	            Total_Payments_per_Discharge: d.Total_Payments_per_Discharge 
	        };
	    });
	    // now we begin to draw the map
	    d3.json("data/us.json", function(error, us) {
		    g.append("g")
		        .attr("id", "states")
		        .selectAll("path")
		        .data(topojson.feature(us, us.objects.states).features)
		        .enter().append("path")
		        .attr("d", path)
		        .classed('states', true)
		        .on("mouseover", mouseOver).on("mouseout", mouseOut)
		        .on("click",function(d){call_23(d.id);})
		        .attr("fill", "white");

		    g.append("path")
		        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
		        .attr("id", "state-borders")
	        	.attr("d", path);
	        onchange1('tp');
		});
	});
	onchange1 = function(val){
		// modify the color meaning
		var str = "Total_Payments";
		if(val=='td') str = "Total_Discharge" ;
		else if(val=='tpd') str = "Total_Payments_per_Discharge";
		var dataArray = [];
	    for(var key in datas) {
	        dataArray.push(+ datas[key][str]);
	    }
	    var max_val = d3.max(dataArray);
	    var min_val = d3.min(dataArray);
	    
	    // now we change the color value
	    for(var key in datas){
	    	var val = datas[key][str];
	    	datas[key].color = d3.interpolate("#ffffcc", "#800026")((val-min_val)/(max_val-min_val));
	    }
	    d3.selectAll('.states').transition().duration(1000)
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

	}
	get_state_color = function(sid){
		return datas[sid].color;
	}
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
			"<tr><td>Payments</td><td>"+numeral(d.Total_Payments/1000000).format('$0,0')+"M"+"</td></tr>"+
			"<tr><td>Discharge</td><td>"+numeral(d.Total_Discharge).format('0,0')+"</td></tr>"+
			"<tr><td>Payments/Discharge</td><td>"+numeral(d.Total_Payments_per_Discharge).format('$0,0')+"</td></tr>"+
			"</table>";
	}
}


