var maleHLEMargin = {top: 20, right: 20, bottom: 50, left: 50},
    mWidth = 500 - maleHLEMargin.left - maleHLEMargin.right,
    mHeight = 350 - maleHLEMargin.top - maleHLEMargin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, mWidth], .05);

var y = d3.scale.linear().range([mHeight, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);
	
var maleHLE = d3.select("#maleHLE")
    .append("svg")
    .attr("width", mWidth + maleHLEMargin.left + maleHLEMargin.right)
    .attr("height", mHeight + maleHLEMargin.top + maleHLEMargin.bottom)
    .attr("id","maleHLEChart")
    .attr("viewBox",'0,0,500,350')
    .attr("preserveAspectRatio", "xMaxYMid")
    .append("g")
    .attr("transform", "translate(" + maleHLEMargin.left + "," + maleHLEMargin.top + ")");
    
var maleHLEChart = $("#maleHLEChart"),
    maleHLEAspect = maleHLEChart.width() / maleHLEChart.height(),
    maleHLEContainer = maleHLEChart.parent();
    
$(window).on("resize", function() {
    var targetWidth = maleHLEContainer.width();
    maleHLEChart.attr("width", targetWidth);
    maleHLEChart.attr("height", Math.round(targetWidth / maleHLEAspect));
}).trigger("resize");

d3.csv("/vendor/inequality/maleHealthyLifeExpectancy.csv", function(error, dataset) {
    
    //pull the data out one row at a time. The + is used to format the chosen vales to a numeric format
    dataset.forEach(function(d) {
        d.IEIDeciles = +d.IEIDeciles;
        d.HLE = +d.HLE;
    });
    
    x.domain(dataset.map(function(d) { return d.IEIDeciles; }));
    y.domain([0, 80]);
    
    maleHLE.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + mHeight + ")")
      .call(xAxis)
      .append("text")
      //.attr("transform", "rotate(-90)")
      .attr("y", 35)
      .attr("x", 65)
      //.attr("dx", "43.71em")
      .style("text-anchor", "end")
      .text("Most Deprived");
    
    maleHLE.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + mHeight + ")")
      .call(xAxis)
      .append("text")
      //.attr("transform", "rotate(-90)")
      .attr("y", 35)
      .attr("x", 430)
      //.attr("dx", "43.71em")
      .style("text-anchor", "end")
      .text("Least Deprived");
    
    maleHLE.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      //.attr("dy", "-3.71em")
      .style("text-anchor", "end")
      .text("Male Healthy Life Expectancy");
    
    maleHLE.selectAll(".bar")
      .data(dataset)
    .enter().append("rect")
      .attr("class", "bar")
      //.style("fill", "steelblue")
      .attr("x", function(d) { return x(d.IEIDeciles); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.HLE); })
      .attr("height", function(d) { return mHeight - y(d.HLE); });
});
    

                            
                            
                            