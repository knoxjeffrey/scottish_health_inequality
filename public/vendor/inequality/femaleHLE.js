var femaleHLEMargin = {top: 20, right: 20, bottom: 50, left: 50},
    fWidth = 500 - femaleHLEMargin.left - femaleHLEMargin.right,
    fHeight = 350 - femaleHLEMargin.top - femaleHLEMargin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, fWidth], .05);
 
var y = d3.scale.linear().range([fHeight, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

var femaleHLE = d3.select("#femaleHLE")
    .append("svg")
    .attr("width", fWidth + femaleHLEMargin.left + femaleHLEMargin.right)
    .attr("height", fHeight + femaleHLEMargin.top + femaleHLEMargin.bottom)
    .attr("id","femaleHLEChart")
    .attr("viewBox",'0,0,500,350')
    .attr("preserveAspectRatio", "xMaxYMid")
    .append("g")
    .attr("transform", "translate(" + femaleHLEMargin.left + "," + femaleHLEMargin.top + ")");
    
var femaleHLEChart = $("#femaleHLEChart"),
    femaleHLEAspect = femaleHLEChart.width() / femaleHLEChart.height(),
    femaleHLEContainer = femaleHLEChart.parent();
    
$(window).on("resize", function() {
    var targetWidth = femaleHLEContainer.width();
    femaleHLEChart.attr("width", targetWidth);
    femaleHLEChart.attr("height", Math.round(targetWidth / femaleHLEAspect));
}).trigger("resize");

d3.csv("/vendor/inequality/femaleHealthyLifeExpectancy.csv", function(error, dataset) {
    
    //pull the data out one row at a time. The + is used to format the chosen vales to a numeric format
    dataset.forEach(function(d) {
        d.IEIDeciles = +d.IEIDeciles;
        d.HLE = +d.HLE;
    });
    
    x.domain(dataset.map(function(d) { return d.IEIDeciles; }));
    y.domain([0, 80]);
    
    femaleHLE.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + fHeight + ")")
      .call(xAxis)
      .append("text")
      //.attr("transform", "rotate(-90)")
      .attr("y", 35)
      .attr("x", 65)
      //.attr("dx", "43.71em")
      .style("text-anchor", "end")
      .text("Most Deprived");
    
    femaleHLE.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + fHeight + ")")
      .call(xAxis)
      .append("text")
      //.attr("transform", "rotate(-90)")
      .attr("y", 35)
      .attr("x", 430)
      //.attr("dx", "43.71em")
      .style("text-anchor", "end")
      .text("Least Deprived");
    
    femaleHLE.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      //.attr("dy", "-3.71em")
      .style("text-anchor", "end")
      .text("Female Healthy Life Expectancy");
    
    femaleHLE.selectAll(".bar")
      .data(dataset)
    .enter().append("rect")
      .attr("class", "bar")
      //.style("fill", "steelblue")
      .attr("x", function(d) { return x(d.IEIDeciles); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.HLE); })
      .attr("height", function(d) { return fHeight - y(d.HLE); });
});
                            