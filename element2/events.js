
//alert("test!");
var mydata;
var rolleddate;
var rolledcam;
var rolledlens;
var distxscale ;
var distyscale;
var distxaxis;
var distyaxis;
var radscale;
var distrad = {max:50/2,min:5/2};
var color;
var pagewidth = 500;
var distheight = 260;
var barwidth=10;
var margin = {top:45,bottom:25,left:80,right:25};//{top:45,bottom:25,left:80,right:25};
var radius = 175;
var distribution;


var tooltip = d3.select("#popup");
// var donuttip = d3.select("#donuttip");


color=d3.scale.ordinal()
        .domain(["West", "MidWest", "South", "NorthEast", "Pacific"])
        // .range(["#EDC951","#EB6841","#CC333F","#00A0B0"]);
        .range(["#4038CC","#5B5899","#2D90FF","#FFB86C", "CC550F"]);

d3.csv("state_sum_2.csv",function(data){
    var i=0;
    data.forEach(function(d){
        // d.date=new Date(d.DateTimeOriginal.split(":").slice(0,2).join("-"));
        d.id =  i++;
    });
    mydata = data;


    // the distr graph
    distribution = d3.select("#distribution").append("svg")
        .attr("width",pagewidth)
        .attr("height",distheight);

    distxscale = d3.scale.linear()
        .range([0,pagewidth-margin.left-margin.right])
        .domain([0,d3.max(data,function(d){return +d.id})]);

    distyscale = d3.scale.linear()
        .range([distheight-margin.top-margin.bottom,0])
        .domain(
          [d3.min(data,function(d){return +d.Total_Payments}),
            d3.max(data,function(d){return +d.Total_Payments})]
            );
            
        
    radscale = d3.scale.linear()
            .rangeRound([distrad.min,distrad.max])
            .domain(
              [d3.min(data,function(d){return +d.Total_Discharge}),d3.max(data,function(d){return +d.Total_Discharge})]);

    distxaxis = d3.svg.axis()
        .scale(distxscale)
        .orient("bottom")
        .ticks(5);

    var distaxispos = distheight - margin.bottom;
    distribution.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + distaxispos + ")")
        .call(distxaxis);
        
    distyaxis = d3.svg.axis()
        .scale(distyscale)
        .orient("left")
        .ticks(5);

    //var distyxispos = pagewidth - margin.left;
    distribution.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(distyaxis);

    part = data;

    distribution.selectAll("circle").data(part).enter()
        .append("circle")
        .attr("cx",function(d){ 
          var tmp = distxscale(d.id) + margin.left;
          return tmp})
        .attr("cy",function(d){ 
          var tmp =  distyscale(d.Total_Payments) + margin.top;
          return tmp})
        .attr("r",0)
        .style("fill-opacity",0.3)
        .style("fill",function(d){
          return color(d.Region)}) //d.Model
        .on("mouseover", function(){
            tooltip.style("visibility", "visible"); 
            d3.select(this)
                .style("stroke","#CC333F")
                .style("stroke-width","2");
            })
        .on("mousemove", function(d){
            tooltip.style("top", (d3.event.pageY -100)+"px")
                .style("left",(d3.event.pageX+10)+"px");
            tooltip.select("#popstate").text(d.State);
            tooltip.select("#popregion").text(d.Region);
            tooltip.select("#poptp").text(numeral(d.Total_Payments).format('$0,0'));
            tooltip.select("#poptd").text(
                numeral(d.Total_Discharge).format('0,0'));
            tooltip.select("#poptpd").text(
                numeral(d.Total_Payments_per_Discharge).format('$0,0')
                );
            })
        .on("mouseout", function(){
            tooltip.style("visibility", "hidden");
            distribution.selectAll("circle")
                .style("stroke-width",0);
        })
        .on("click", function(d){
            tooltip.style("visibility", "hidden");
            distribution.selectAll("circle")
                .style("stroke-width",0);
            // color change here
            var cur_id = d.id;

            distribution.selectAll("circle").transition().duration(200)
            .style("fill",function(d){
                var tmp = d.id;
                if(tmp!=cur_id)
                    return "#555555";
                else
                    return color(d.Region);
              })
            .style("fill-opacity",function(d){
                var tmp = d.id;
                if(tmp!=cur_id)
                    return 0.3;
                else
                    return 0.8;
            });

        });

    distribution.selectAll("circle").transition().duration(1000)
        .attr("r",function(d){
          var tmp =  radscale(d.Total_Discharge);
          return tmp});
    
    d3.selectAll("input").on("change",chang_cur);
    
    function chang_cur(){
        change(this.value);
    }
    function change(sel){ 
        var axis = sel.substr(0,1);
        var lab = sel.substr(1,sel.length-1);
        var atr;
        var mar;
        if(axis=="r"){
            scale = radscale;
            // axis = distxaxis;
            atr = "r";
            mar = 0;
        }else if(axis=="y"){
            scale = distyscale;
            axis = distyaxis;
            atr = "cy";
            mar = margin.top;
        }else if(axis=="c"){
            scale = color;
            atr = "fill";
        }
        if(lab=="tp"){
            scale.domain([
                d3.min(data,function(d){return +d.Total_Payments}),
                d3.max(data,function(d){return +d.Total_Payments})]);
            distribution.selectAll("circle").transition().duration(1000)
                .attr(atr,function(d){return scale(+d.Total_Payments)+mar});
        }else if(lab =="td"){
            scale.domain([
                d3.min(data,function(d){return +d.Total_Discharge}),
                d3.max(data,function(d){return +d.Total_Discharge})]);
            distribution.selectAll("circle").transition().duration(1000)
                .attr(atr,function(d){return scale(+d.Total_Discharge)+mar});
        }else if(lab == "tpd"){
            scale.domain([
                d3.min(data,function(d){return +d.Total_Payments_per_Discharge}),
                d3.max(data,function(d){return +d.Total_Payments_per_Discharge})]);
            distribution.selectAll("circle").transition().duration(1000)
                .attr(atr,function(d){return scale(+d.Total_Payments_per_Discharge)+mar});
        }
        distribution.select("g.y.axis").transition().duration(1000).call(distyaxis);
    }
});

function resetcolor(){
    distribution.selectAll("circle").transition().duration(1000)
        .style("fill",function(d){
            return color(d.Region)})
        .style("fill-opacity",0.3);

}
