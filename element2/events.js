var namespace2 = namespace2 || {};
var resetcolor;
var onchange2;
var resize_bubble;
namespace2.color = d3.scale.ordinal()
            .domain(["West", "Midwest", "South", "Northeast"])
            // .range(["#EDC951","#EB6841","#CC333F","#00A0B0"]);
            .range(["#FFB86C", "#2D90FF", "#4038CC","#5B5899","CC550F"]);

var statedata;
namespace2.main = function(){
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
    var color=this.color;
    var pagewidth = 340;
    var distheight = 250;
    var barwidth=10;
    //var margin = {top: 30, right: 40, bottom: 50, left: 50};

    var margin = {top:45,bottom:30,left:80,right:25};//{top:45,bottom:25,left:80,right:25};
    var width = pagewidth ,
        height = distheight ;
    var radius = 175;
    var distribution;
    var tooltip = d3.select("#popup2");
    // var donuttip = d3.select("#donuttip");
    

    d3.csv("data/state_sum_2.csv",function(data){
        var i=0;
        state_names = [];
        data.forEach(function(d){
            state_names.push(d.State);
            d.id =  i++;
        });
        mydata = data;
        statedata = data;


        // the distr graph
        distribution = d3.select("#ele2").append("svg")
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
            .ticks(1)
            .tickFormat(function(d) { return ""; })//state_names[d]

        var distaxispos = distheight - margin.bottom;

        distribution.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + distaxispos + ")")
            .call(distxaxis)
            .selectAll("text")  
                .style("text-anchor", "end")
                .attr('font-size', '8px')
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                    return "rotate(-65)" 
                    });
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


        // add default x-axis and y-axis
        distribution.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height)
            .text("States");

        distribution.append("text")
            .attr("class", "y label")
            .attr("y", 10)
            .attr("dy", ".75em")
            .text("Total Payments");
        // add default bubble label
        // won't need it any more
        // distribution.append("text")
        //     .attr("class", "fix label")
        //     .attr("text-anchor", "middle")
        //     .attr("x", width*0.75)
        //     .attr("y", margin.top)
        //     .text("Bubble size:");
        // distribution.append("text")
        //     .attr("class", "b label")
        //     .attr("text-anchor", "middle")
        //     .attr("x", width*0.75)
        //     .attr("y", margin.top+18)
        //     .text("Total Discharge");


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
                tooltip.select("#title_state").text("State");
                tooltip.select("#popstate").text(d.State);
                tooltip.select("#title_region").text("Region");
                tooltip.select("#popregion").text(d.Region);


                tooltip.select("#title_tp").text("Total Payments");
                tooltip.select("#poptp").text(numeral(d.Total_Payments).format('$0,0'));
                tooltip.select("#title_td").text("Total Discharge");
                tooltip.select("#poptd").text(
                    numeral(d.Total_Discharge).format('0,0'));
                tooltip.select("#title_tpd").text("Total Payments Per Discharge");
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
                namespace2.call(d.State);
                call3(d.State);
            });

        distribution.selectAll("circle").transition().duration(1000)
            .attr("r",function(d){
              var tmp =  radscale(d.Total_Discharge);
              return tmp});
        

    });
    resize_bubble = function (type){
        radscale = d3.scale.linear()
                .rangeRound([distrad.min,distrad.max])
                .domain(
                  [d3.min(mydata,function(d){return +d[type]}),d3.max(mydata,function(d){return +d[type]})]);
        distribution.selectAll("circle").transition().duration(1000)
            .attr("r", function(d){
              return radscale(d[type]);}
            );
        // change the bubble label
        // won't need it any more
        // distribution.select(".b.label")
        //     .text(type.replace(/_/g,' '));
    }
    // function chang_cur(){
    //         onchange2(this.value);
    // }
    onchange2 = function(sel){ 
        var axis = 'y';
        var lab = sel;
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
                d3.min(mydata,function(d){return +d.Total_Payments}),
                d3.max(mydata,function(d){return +d.Total_Payments})]);
            distribution.selectAll("circle").transition().duration(1000)
                .attr(atr,function(d){return scale(+d.Total_Payments)+mar});
        }else if(lab =="td"){
            scale.domain([
                d3.min(mydata,function(d){return +d.Total_Discharge}),
                d3.max(mydata,function(d){return +d.Total_Discharge})]);
            distribution.selectAll("circle").transition().duration(1000)
                .attr(atr,function(d){return scale(+d.Total_Discharge)+mar});
        }else if(lab == "tpd"){
            scale.domain([
                d3.min(mydata,function(d){return +d.Total_Payments_per_Discharge}),
                d3.max(mydata,function(d){return +d.Total_Payments_per_Discharge})]);
            distribution.selectAll("circle").transition().duration(1000)
                .attr(atr,function(d){return scale(+d.Total_Payments_per_Discharge)+mar});
        }
        distribution.select("g.y.axis").transition().duration(1000).call(distyaxis);
        var str;
        switch(lab){
            case 'tp':
                str = "Total Payments";
                break;
            case 'td':
                str = 'Total Discharge';
                break;
            default:
                str = 'Payments per Discharge';
        }
        distribution.select(".y.label")
            .text(str);
    }
    resetcolor = function(){
        var distribution = d3.select("#ele2");
        distribution.selectAll("circle")
            //.transition()
            //.duration(200)
            .style("fill",function(d){
                return color(d.Region)})
            .style("fill-opacity",0.3);
    }

}

namespace2.call = function(sid){
    // define communication method. handle msg from element1
    var color = this.color;
    d3.select("#popup").style("visibility", "hidden");
    var distribution = d3.select("#ele2");
    distribution.selectAll("circle")
            .style("stroke-width",0);
        
    distribution.selectAll("circle").transition().duration(200)

    .style("fill-opacity",function(d){
        if(d.State!=sid)
            return 0.1;
        else
            return 1;
    });
    var tmp;
    for(var i=0; i<=statedata.length-1; i++){
        if(statedata[i].State==sid){
            tmp=statedata[i];
            break;
        }

    }
    d3.select("#d_state").text(sid);
    d3.select("#d_region").text(tmp.Region);
    d3.select("#d_tp").text(numeral(tmp.Total_Payments).format('$0,0'));
    d3.select("#d_td").text(numeral(tmp.Total_Discharge).format('0,0'));
    d3.select("#d_tpd").text(numeral(tmp.Total_Payments_per_Discharge).format('$0,0'));
    
}
with(namespace2){
    main();   
}

