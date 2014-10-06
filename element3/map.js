
var width = 1200,
    height = 600,
    centered;

var projection = d3.geo.albersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);






var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");

var alldata={};

// d3.json("us_states_shapes.json", function(json) {
//     states.selectAll("path")
//         .data(json.features)
//         .enter().append("path")
//         .attr("d", path);
// });

d3.json("us.json", function(error, us) {
    g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .on("click", clicked);

    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path);

    // after we draw the map, we load the city_infor data to memory
    d3.csv('data/city_infor.csv', function(city_data){
        d3.csv('data/provider_infor.csv', function(provider_data){
            // group it by state
            // then subgroup it by city_id
            city_data.forEach(function(city_row){
                if(! alldata.hasOwnProperty(city_row.state)){
                    alldata[city_row.state] = {};
                }
                alldata[city_row.state]["c"+city_row.city_id] = city_row;
            });

            // add the providers' information
            provider_data.forEach(function(provider_row){
                // first locate the provider's state
                var curstate = city_data[provider_row.city_id-1].state;
                // then add the provider's infor under the state/ city
                var curcity = alldata[curstate]['c'+provider_row.city_id];
                if( ! curcity.hasOwnProperty("providers") ){
                    curcity["providers"] = {};
                }
                curcity["providers"][provider_row.provider_id] = provider_row;
            });

            // summarize the providers' information and store them as
            // properties under the city's name
            for(var state in alldata){
                for(var city in alldata[state]){
                    var curpros = alldata[state][city]["providers"];
                    var medi = 0;
                    var cover = 0;
                    var discharge = 0;
                    var total = 0;
                    for(var pro in curpros){
                        // covered_charge: "19527644"
                        // hos_name: "FAIRBANKS MEMORIAL HOSPITAL"
                        // medicare_payment: "9427460.001"
                        // provider_id: "20012"
                        // total_discharge: "526"
                        // total_payment: "10392979"
                        medi += +curpros[pro].medicare_payment;
                        cover += +curpros[pro].covered_charge;
                        discharge += +curpros[pro].total_discharge;
                        total += +curpros[pro].total_payment;
                    }
                    alldata[state][city]["total_payment"] = +total;
                    alldata[state][city]["total_discharge"] = +discharge;
                    alldata[state][city]["total_medicare"] = +medi;
                    alldata[state][city]["total_cover"] = +cover;
                }
            }
        });

        
    });

});

// ca: 6, or: 

function clicked(d) {
    var x, y, k;
    d3.selectAll("circle").remove();
    // set the scale rate
    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
        // calculate the bounds
        var bounds  = path.bounds(d);
        var hscale  = width  / (bounds[1][0] - bounds[0][0]);
        var vscale  = height / (bounds[1][1] - bounds[0][1]);
        k   = (hscale < vscale) ? hscale : vscale;
    } 
    else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
    }
    g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

    g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");

    // first we remove the other points showing in the map

    
    // then we add all the cities in the current state as circles
    // loop through the cities

    // define the circle scale

    
    var curstate = alldata[d.id];
    var circlescale = d3.scale.linear()
            .rangeRound([1.5, 15])
            .domain(
              [minObj(curstate, "total_payment"), 
                maxObj(curstate, "total_payment")]);

    for(var key in curstate){
        var curcity = curstate[key];
        var xy = projection([curcity.lon, curcity.lat]);
        var element = g.append('g')
            .attr('transform', 'translate(' + Math.round(xy[0]) + ',' + Math.round(xy[1]) + ')');
        element.append('circle')
            .attr('r', circlescale(curcity.total_payment))
            .attr("stroke", "black")
            .attr("fill", "blue")
            //.classed("city_circle", true)
            .attr('city_id', curcity.city_id)
            .attr('city_name', curcity.city_name);
            //.attr('city_name', curcity[i].)   

    }
    var elements = d3.selectAll('circle');
    var packer = sm.packer();
    packer.elements(elements).start();
    
    


    
                        
     
}

function minObj(obj, prop){
    var min = Number.MAX_VALUE;
    for(var key in obj){
        if(+obj[key][prop] < min){
            // there are some values missing?
            // anyway for now we neglect 0s
            if(+obj[key][prop] != 0)
                min = +obj[key][prop];
        }
    }
    return min;
}
function maxObj(obj, prop){
    var max = 0;
    for(var key in obj){
        if(+obj[key][prop] > max){
            max = +obj[key][prop];
        }
    }
    return max;
}

