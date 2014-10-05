
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


});

function clicked(d) {
    var x, y, k;

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

    // now we add all the cities in this state as circles

     // add all the city infor below
    // test first
    var xy = projection([-118.44,34.07]);
                        
    var element = g.append('g')
        .attr('transform', 'translate(' + Math.round(xy[0]) + ',' + Math.round(xy[1]) + ')')

    element.append('circle')
        .attr('r', 3);    
}

