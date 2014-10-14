var namespace3 = namespace3 || {};

var call3;


namespace3.main = function(){
    // var centered = this.centered;
    // var width = this.width;
    // var height = this.height;
    // var projection = this.projection;
    // var path = this.path;
    // var packer = this.packer;
    var centered;
    var width = 1200;
    var height = 400;
    var centered = null;
    var projection = d3.geo.albersUsa()
        .scale(800)
        .translate([width / 2, height / 2]);
    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#ele3").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);
        //.on("click", clicked);

    var g = svg.append("g");

    var alldata= {};

    // d3.json("us_states_shapes.json", function(json) {
    //     states.selectAll("path")
    //         .data(json.features)
    //         .enter().append("path")
    //         .attr("d", path);
    // });

    // to preserve the current sid
    var cursid;
    d3.json("../data/us.json", function(error, us) {
        g.append("g")
            .attr("id", "states3")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .on("click", function(d){
                call3(cursid, val_option);
            });

        g.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("id", "state-borders")
            .attr("d", path);

        g.append("g")
            .attr("id", "metros");

        // after we draw the map, we load the city_infor data to memory
        d3.csv('data/city_infor.csv', function(city_data){
            d3.csv('data/provider_infor.csv', function(provider_data){
                // group it by state
                // then subgroup it by city_id
                city_data.forEach(function(city_row){
                    if(! alldata.hasOwnProperty(city_row.state)){
                        alldata[city_row.state] = {};
                    }
                    alldata[city_row.state][+city_row.city_id] = city_row;
                });

                // add the providers' information
                provider_data.forEach(function(provider_row){
                    // add tpd
                    provider_row["total_payment_per_discharge"] = 
                        provider_row["total_payment"]/
                        provider_row["total_discharge"];
                    // first locate the provider's state
                    var curstate = city_data[provider_row.city_id-1].state;
                    // then add the provider's infor under the state/ city
                    var curcity = alldata[curstate][+provider_row.city_id];
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
                        var tpd = 0;
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
                        alldata[state][city]["total_payment_per_discharge"] = (+total)/(+discharge);
                        alldata[state][city]["total_medicare"] = +medi;
                        alldata[state][city]["total_cover"] = +cover;
                    }
                }

                // sort all the city's infor and store the result 
                // in an array (as the state's property)
                for(var state in alldata){
                    allcity_id = [];
                    for(var city in alldata[state]){
                        allcity_id.push(+city);
                    }
                    allcity_id.sort(function(a, b){
                        return alldata[state][b]["total_payment"] -
                            alldata[state][a]["total_payment"]
                    });
                    alldata[state]["payment_order_city_id"] = allcity_id;
                }
            });

            
        });

    });


    function city_mouseover(that){
        var tooltip3 = d3.select("#popup");
        var this_state = that.id.substring(6);
        var this_city = that.classList[2].substring(8);
        var tmp = alldata[this_state]['c'+this_city];
        tooltip3.style("visibility", "visible"); 
        d3.select(that)
            .classed("select", true);


        tooltip3.style("top", (d3.event.pageY -130)+"px")
            .style("left",(d3.event.pageX+20)+"px");
        tooltip3.select("#popstate").text(this_state);
        tooltip3.select("#popcity").text(alldata[this_state][this_city]['city_name']);
        tooltip3.select("#poptp").text(numeral(alldata[this_state][this_city]['total_payment']).format('$0,0'));
        tooltip3.select("#poptd").text(numeral(alldata[this_state][this_city]['total_discharge']).format('0,0'));
        tooltip3.select("#poptpd").text(numeral(alldata[this_state][this_city]['total_payment']/
        alldata[this_state][this_city]['total_discharge']).format('$0,0')
        );

    }
    function city_mouseout(that){
        d3.select(that)
            .classed("select", false);
                    // delete the tooltip
        d3.select("#popup").style("visibility", "hidden");

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
    call3 = function(sid, val){
        var str = 'total_payment';
        if(val=='td') str = 'total_discharge';
        else if(val=='tpd') str="total_payment_per_discharge";
        if(sid=="") sid=cursid;


        // get the data related to the current sid
        // I think this way looks stupid, but haven't figured out 
        // a more elegant way to do this
        var d = null;
        var tmp = d3.selectAll("#states3")[0][0].childNodes;
        for (var i = 0; i <= 50; i++) {
            if(tmp[i].__data__.id==sid){
                d = tmp[i].__data__;
                break;
            }
        }

        cursid = sid;
        var x, y, k;
        var centered;
        
        // set the scale rate    
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = sid;
        // calculate the bounds
        var bounds  = path.bounds(d);
        var hscale  = width  / (bounds[1][0] - bounds[0][0]);
        var vscale  = height / (bounds[1][1] - bounds[0][1]);
        k   = (hscale < vscale) ? hscale : vscale;
        // control k not to be too big
        k = (k>18)?18:k;
        
        g.selectAll("path")
          .classed("active", centered && function(d) { return d.id === centered; });

        g.transition()
          .duration(750)
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k*0.9 + ")translate(" + -x + "," + -y + ")")
          .style("stroke-width", 1.5 / k + "px");

        // first we remove the other points showing in the map
        d3.selectAll(".metro").remove();
        //d3.selectAll("text").remove();


        // then we add all the cities in the current state as circles
        try{
            var curstate = alldata[sid];
        }
        catch(error){
            console.log(error);
            return;
        }

        var msize = {'min':4, 'max':20};
        var circlescale = d3.scale.linear()
                // .range([10*Math.exp(-k/14),40*Math.exp(-k/14)])//([3-k/10, 12-k/10])
                .range([Math.pow(msize['min'], 2), Math.pow(msize['max'], 2)])
                // start from 0, to ensure the circle is linear in size
                .domain(
                  [0, maxObj(curstate, str)]);


        var flag = true;
        var tooltip3 = d3.select("#popup");
        var provider_tooltip = d3.select("#provider_popup");

        // only display the first few cities

        //for(var key in curstate)
        curstate["payment_order_city_id"].slice(0,15).forEach(function(cid){

            var curcity = curstate[cid];
            // define the radius
            var r = circlescale(curcity[str]);
            // first sqrt the r to make the circle proportional to the number
            r = Math.sqrt(r);
            // then divide by the scale rate
            r = r/Math.sqrt(k*0.9);
            var xy = projection([curcity.lon, curcity.lat]);
            var element = d3.select('#metros').append('g')
                .attr('transform', 'translate(' + Math.round(xy[0]) + ',' + Math.round(xy[1]) + ')')
                .attr("id", 'metro_'+d.id)
                .attr('r', r)
                .attr("class", "metro primary "+"city_id_"+curcity.city_id)
                // mark the transform information
                .classed('pos_'+ Math.round(xy[0])+'_'+ Math.round(xy[1]), true)
                // city: mouse over
                .on("mouseover", function(){
                   city_mouseover(this);
                })
                // city: mouse out
                .on("mouseout", function(){
                    city_mouseout(this);
                })
                .on("click", function(){
                    var this_state = this.id.substring(6);
                    var this_city = this.classList[2].substring(8);
                    var this_pos = this.classList[3].split('_');
                    // delete the tooltip
                    tooltip3.style("visibility", "hidden");
                    // remove all other cities
                    d3.selectAll('.metro').remove();

                    // 
                    var this_r = 16/Math.sqrt(k*0.9);
                    // add the current city(with a bigger radius)
                    var element = d3.select('#metros').append('g')
                                    .attr('transform', 'translate(' + this_pos[1] + ',' + this_pos[2] + ')')
                                    .attr("id", 'metro_'+this_state)
                                    .attr('r', this_r)
                                    .attr("class", "metro primary "+"city_id_"+this_city)
                                    .classed("still", true)
                                    .on('mouseover',function(){city_mouseover(this)})
                                    .on('mouseout', function(){city_mouseout(this)});
                    element.append('circle')
                        .attr('r', this_r);
                    element.append('text')
                        .attr('y', this_r*2)
                        .text(alldata[this_state][this_city]['city_name'])
                        //.attr("font-family", "sans-serif")
                        .attr("font-size", this_r*0.8);
                        
                    
                    // add providers' information here
                    var allpros = alldata[this_state][this_city]["providers"];
                    var pro_scale = d3.scale.linear()
                        .range([Math.pow(msize['min'], 2), Math.pow(this_r, 2)])
                        .domain(
                          [0, maxObj(allpros, str)]);

                    var xx =0;
                    var yy = 0;
                    var radius = 1;
                    var step = 0;
                    var cor_xy = {'x0y0':0};
                    for(var key in allpros){
                        var this_pro = allpros[key];
                        // city_id: "269"
                        // covered_charge: "321900212"
                        // hos_name: "VIA CHRISTI HOSPITALS WICHITA INC"
                        // medicare_payment: "69604786"
                        // provider_id: "170122"
                        // total_discharge: "8376"
                        // total_payment: "81335784"
                        
                        // generate [-radius, rarius]
                        // first generate [0, 2*radius]
                        // define the radius
                        while(cor_xy.hasOwnProperty('x'+xx+'y'+yy)){
                            xx = Math.round(10000*Math.random())%(2*radius+1) - radius;
                            yy = Math.round(10000*Math.random())%(2*radius+1) - radius;
                        }
                        cor_xy['x'+xx+'y'+yy] = 0;
                        step ++;
                        if(step%6==0) radius++;
                     
                        var pro_xy = projection([alldata[this_state][this_city].lon, alldata[this_state][this_city].lat]);
                        var tx = Math.round(pro_xy[0]+xx);
                        var ty = Math.round(pro_xy[1]+yy);
                        
                        var pro_r = pro_scale(this_pro[str]);
                        pro_r = Math.sqrt(pro_r);
                        var pro_percent = numeral( 
                            this_pro[str] / alldata[this_state][this_city][str]
                            ).format('%0');
                        // skip 0%
                        if(pro_percent=="0%"){
                            continue;
                        }
                        
                        var pro_element = d3.select('#metros').append('g')
                            .attr('transform', 'translate(' + tx + ',' +  ty + ')')
                            .attr("id", 'pros_'+this_city)
                            .attr('r', pro_r)
                            .attr("class", "metro providers "+this_state+'_'+this_city+'_'+key)
                            .on("mouseover", function(){
                                // get the infor like this
                                // 0: "CA"
                                // 1: "41"
                                // 2: "50599"
                                var this_infor = this.classList[2].split('_');
                                // get the hospital infor like this
                                // city_id: "41"
                                // covered_charge: "325526474"
                                // hos_name: "SUTTER GENERAL HOSPITAL"
                                // medicare_payment: "60831076"
                                // provider_id: "50108"
                                // total_discharge: "4418"
                                // total_payment: "66642563"
                                var this_provider = alldata[this_infor[0]][this_infor[1]]['providers'][this_infor[2]];
                                
                                
                                provider_tooltip.style("visibility", "visible"); 
                                d3.select(this)
                                    .classed("select", true);
                                    
                                provider_tooltip.style("top", (d3.event.pageY -130)+"px")
                                        .style("left",(d3.event.pageX+20)+"px");
                                provider_tooltip.select("#popcity")
                                    .text(
                                        alldata[this_infor[0]][this_infor[1]]['city_name']
                                        );
                                provider_tooltip.select("#pop_pro_name").text(this_provider['hos_name']);
                                provider_tooltip.select("#poptd").text(numeral(this_provider['total_discharge']).format('0,0')
                                    );
                                provider_tooltip.select("#poptp").text(numeral(this_provider['total_payment']).format('$0,0')
                                    );
                                
                            })
                            .on("mouseout", function(){
                                d3.select(this)
                                    .classed("select", false);
                                // delete the tooltip
                                provider_tooltip.style("visibility", "hidden");
                            });
                        pro_element.append('circle')
                            .attr('r', pro_r);
                        pro_element.append('text')
                            .attr('y', pro_r/2)
                            .text(pro_percent)
                            //.attr("font-family", "sans-serif")
                            .attr("font-size", pro_r*0.8);
                    }
                    var animation_pros = d3.selectAll('#pros_'+this_city)[0];
                    var animation_curcity = d3.selectAll('#metro_'+this_state).filter('.city_id_'+this_city)[0][0];
                    animation_pros.push(animation_curcity);
                        // if there are not too many elements, do the animation
                    var this_packer = sm.packer();
                    this_packer.elements(animation_pros).start();

                   
                });

            element.append('circle')
                .attr('r', r);
            element.append('text')
                .attr('y', function(){
                    var tmp = r;
                    var max_font = 2;
                    if(tmp<1) return 0.5;
                    if(tmp>max_font) return max_font/2;
                    return tmp/2;

                })
                .text(curcity.city_name)
                .attr("font-family", "sans-serif")
                .attr("font-size", function(){
                    var tmp = r;
                    var max_font = 2;
                    if(tmp<1) return 1;
                    if(tmp>max_font) return max_font;
                    return tmp;

                });

        });
        var cities = d3.selectAll('#metro_'+d.id)[0];
        var city_packer = sm.packer();
        city_packer.elements(cities).start();
    }
}
with(namespace3){
    main();
}