var healthWidth = 500,
    healthHeight = 600,
    centered,
    alreadyZoomed = false;

//setup the tooltip - need to set direction for this other wise the tooltip will attach to the xy coords of the body rather than the detailBox
var tip = d3.tip()
      .attr('class', 'd3-tip')
      .style("position", "absolute")
      .direction('se')
      //.offset([0, 0])
      .html(function(d) { return "<p>" + d.properties.PCON13NM + "</p><br><p>" + d.properties.generalGoodHealthRate + "%</p>"; });
	
var healthSvg = d3.select("#health")
    .append("svg")
    .attr("width", healthWidth)
    .attr("height", healthHeight)
    .attr("overflow", "hidden")
    .attr("id","healthMap")
    .attr("viewBox",'0,0,500,600')
    .attr("preserveAspectRatio", "none");
    
var healthMap = $("#healthMap"),
    healthMapAspect = healthMap.width() / healthMap.height(),
    healthMapContainer = healthMap.parent();
    
$(window).on("resize", function() {
    var targetWidth = healthMapContainer.width();
    healthMap.attr("width", targetWidth);
    healthMap.attr("height", Math.round(targetWidth / healthMapAspect));
}).trigger("resize"); 

//add a rect around the svg
healthSvg.append("rect")
    .attr("class", "background")
    .attr("width", healthWidth)
    .attr("height", healthHeight)
    .on("click", clicked);
    
healthSvg.call(tip);

//identify the svg and append a group element
var g = healthSvg.append("g");

//this will be invisible but is used to attach the tooltip to rather than appearing over the boundary of the chosen constituency
var detailBox = healthSvg.append('rect')
      .attr('width', 0)
      .attr('height', 0)
      .attr('x', 10)
      .attr('y', 10)
      .attr('class', 'detailBox')
      .style("position", "absolute");

var legend;

//this array will hold the generalGoodHealthRate figures
var healthArray = new Array();

//this array will hold the legend figures to make the color evenly spaced
var legendArray = new Array();

//projection is used to project the 3D glode onto a 2D surface. Mercator is a built in D3 projection
var projection = d3.geo.mercator()
        .center([-4, 58])
        .scale(2800)
        //.parallels([10,30])
        .translate([healthWidth / 2, healthHeight / 2]);

//this will tell the path generator to reference my custom projection
var path = d3.geo.path()
    .projection(projection);

d3.json("/vendor/inequality/paraconstit.json", function(error, scotland) {
    if (error) return console.error(error);

    for (var i=0; i<scotland.objects.scotland.geometries.length; i++) {

            //convert generalGoodHealthRate values to floats
            var dataValue = parseFloat(scotland.objects.scotland.geometries[i].properties.generalGoodHealthRate);

            //add the values to the healthyArray
            healthArray.push(dataValue);

            //changes the string values to the float values
            scotland.objects.scotland.geometries[i].properties.generalGoodHealthRate = dataValue;
    }

    //get the max and min values in the array
    var maxHealth = Math.max.apply(Math, healthArray);
    var minHealth = Math.min.apply(Math, healthArray);

    //quantize sets a linear scale using the colors in range and applies them to the range of values in domain. Domain is input values and range is the output  mapped from the domain
    var color = d3.scale.quantize()
        .domain([minHealth,maxHealth])
        .range(["rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)"]);

    var subunits = topojson.feature(scotland, scotland.objects.scotland).features;

    g.selectAll("path")
        .data(subunits)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "#fff")
        .attr("stroke-width", "0.2px")
        .style("fill", function(d) {
            var value = d.properties.generalGoodHealthRate;

            if (value) {
                return color(value);
            } else {
                return "red";
            }
        })
        .style("cursor", "pointer")
        //.attr("class", "boundary")
        .on("click", clicked)
        .on("mouseover", mapMouseover)
        .on("mouseout", mapMouseout)
        .on("touchstart", doNothing)
        .on("touchend", clicked);

    for (var j=minHealth; j<=maxHealth+((maxHealth-minHealth)/7); j+=((maxHealth-minHealth)/7)) {
        legendArray.push(j.toFixed(1));
    }

    // A position encoding for the key only.
    var x = d3.scale.linear()
        .domain([minHealth,maxHealth])
        .range([0, 200]);

    //setup the xAxis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(25)
        .tickValues(color.domain())
        .tickFormat(d3.format(".1"))
        .ticks(2);

    //append a new xAxis group element to the svg and move it across and down
    legend = g.append("g")
                .attr("class", "key")
                .attr("transform", "translate(20,40)");

    legend.selectAll("rect")
        .data(color.range().map(function(d, i) {
          return {
            x0: i ? x(legendArray[i - 1]) : x.range()[0],
            x1: i < legendArray.length ? x(legendArray[i]) : x.range()[1],
            z: d
          };
        }))
        .enter().append("rect")
        .attr("height", 20)
        .attr("x", function(d) { return d.x0; })
        .attr("width", function(d) { return d.x1 - d.x0; })
        .style("fill", function(d) { return d.z; });

    legend.call(xAxis).append("text")
        .attr("class", "caption")
        .attr("y", -12)
        .text("General Good Health Rate %");

});

//stop touch presses being registered - only want touchend
function doNothing() {
	d3.event.preventDefault();
}

function clicked(d) {
    var x, y, k;

    if (d && centered !== d) {
        var centroid = path.centroid(d);

        var constit = d.properties.PCON13NM
        var percentValue = d.properties.generalGoodHealthRate;


        x = centroid[0];
        y = centroid[1];
        k = 2.5;
        visible = 0;
        centered = d;

        if (alreadyZoomed){
            d3.select("#arcSelection").remove();
            tip.hide(d);
        }

        g.append("path")
          .attr("d", d3.select(this).attr("d"))
          .attr("id", "arcSelection")
          .style("fill", "none")
          .style("stroke", "orange")
          .style("stroke-width", 1);

        function startPause()
        {
          //do some things
          setTimeout(continueExecution, 500) //wait ten seconds before continuing
        }

        function continueExecution()
        {
            //finish doing things after the pause
            tip.show(d, detailBox.node());
        }
        
        startPause();
        
        alreadyZoomed = true;
        
    } else {
        x = healthWidth / 2;
        y = healthHeight / 2;
        k = 1;
        visible = 1;
        centered = null;
        alreadyZoomed = false;

        d3.select("#arcSelection").remove();
        tip.hide(d);
    }

    g.transition()
        .delay(150)
        .duration(750)
        .attr("transform", "translate(" + healthWidth / 2 + "," + healthHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");

    if (visible == 0) {
        legend.transition()
            .duration(300)
            .style("opacity", visible);
    } else {
        legend.transition()
            .delay(750)
            .duration(300)
            .style("opacity", visible);
    }

}

function mapMouseover(d) {
        g.append("path")
          .attr("d", d3.select(this).attr("d"))
          .attr("id", "hoverArcSelection")
          .style("fill", "none")
          .style("stroke", "orange")
          .style("stroke-width", 1);
}

function mapMouseout(d) {
    d3.select("#hoverArcSelection").remove();
}
                            
                            
                            
                            