var bMargin = {top: 20, right: 150, bottom: 30, left: 40},
    bWidth = 500 - bMargin.left - bMargin.right,
    bHeight = 350 - bMargin.top - bMargin.bottom;

var mBarX = d3.scale.ordinal()
            .rangeRoundBands([0, bWidth-30], .2);

var mBarY = d3.scale.linear()
            .range([bHeight, 0]);

var mBarXAxis = d3.svg.axis()
                .scale(mBarX)
                .orient("bottom");

var mBarYAxis = d3.svg.axis()
                .scale(mBarY)
                .orient("left")
                .ticks(10);

var mBarColor = d3.scale.category10().domain(d3.range(0,10));

var legendColors = [ ["Male Life Expectancy", mBarColor(1)],
               ["Male Healthy Life Expectancy", mBarColor(0)] ];
				
var mBarComp = d3.select("#mBarComp")
    .append("svg")
    .attr("width", bWidth + bMargin.left + bMargin.right)
    .attr("height", bHeight + bMargin.top + bMargin.bottom)
    .attr("id","mBarChart")
    .attr("viewBox",'0,0,500,350')
    .attr("preserveAspectRatio", "xMidYMid")
    .append("g")
    .attr("transform", "translate(" + bMargin.left + "," + bMargin.top + ")");
    
var mBarChart = $("#mBarChart"),
    mBarAspect = mBarChart.width() / mBarChart.height(),
    mBarContainer = mBarChart.parent();
    
$(window).on("resize", function() {
    var targetWidth = mBarContainer.width();
    mBarChart.attr("width", targetWidth);
    mBarChart.attr("height", Math.round(targetWidth / mBarAspect));
}).trigger("resize");

d3.csv("/vendor/inequality/MaleBarComparison.csv", function(error, data) {
 
    data.forEach(function(d) {
        d.YearsTotal = +d.YearsTotal;
    });

    mBarX.domain(data.map(function(d) { return d.Deciles; }));
    mBarY.domain([0, d3.max(data, function(d) { return d.YearsTotal; })]);

    mBarComp.append("g")
            .attr("class", "x axis2")
            .attr("transform", "translate(0," + bHeight + ")")
            .call(mBarXAxis);

    mBarComp.append("g")
            .attr("class", "y axis2")
            .call(mBarYAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Age");

    mBarComp.selectAll(".mBar")
            .data(data)
            .enter().append("rect")
            .attr("class", "mBar")
            .style("fill", function(d,i) { var barColor = (i==0 || i==1) ? mBarColor(1) :  mBarColor(0); return barColor; })
            .attr("x", function(d,i) { var barStart = (i==0 || i==1) ? mBarX(d.Deciles)-5 :  mBarX(d.Deciles); return barStart; })
            .attr("width", function(d,i) { var barWidth = (i==0 || i==1) ? mBarX.rangeBand()+10 :  mBarX.rangeBand(); return barWidth; })
            .attr("y", function(d) { return mBarY(d.YearsTotal); })
            .attr("height", function(d) { return bHeight - mBarY(d.YearsTotal); });
    
    var legend = mBarComp.append("g")
		.attr("class", "mBarLegend")
		.attr("height", 100)
		.attr("width", 100)
		.attr('transform', 'translate(50,10)');
    
    var legendRect = legend.selectAll('rect').data(legendColors);

    legendRect.enter()
        .append("rect")
        .attr("x", bWidth - 65)
        .attr("width", 10)
        .attr("height", 10);

    legendRect
        .attr("y", function(d, i) {
            return i * 20;
        })
        .style("fill", function(d) {
            return d[1];
        });

    var legendText = legend.selectAll('text').data(legendColors);

    legendText.enter()
        .append("text")
        .attr("x", bWidth - 52);

    legendText
        .attr("y", function(d, i) {
            return i * 20 + 9;
        })
        .text(function(d) {
            return d[0];
        });
    
});
                            
                            
                            