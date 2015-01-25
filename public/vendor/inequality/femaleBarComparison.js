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

var femaleLegendColors = [ ["Female Life Expectancy", mBarColor(1)],
               ["Female Healthy Life Expectancy", mBarColor(0)] ];

var fBarComp = d3.select("#fBarComp")
    .append("svg")
    .attr("width", bWidth + bMargin.left + bMargin.right)
    .attr("height", bHeight + bMargin.top + bMargin.bottom)
    .attr("id","fBarChart")
    .attr("viewBox",'0,0,500,350')
    .attr("preserveAspectRatio", "xMidYMid")
    .append("g")
    .attr("transform", "translate(" + bMargin.left + "," + bMargin.top + ")");
    
var fBarChart = $("#fBarChart"),
    fBarAspect = fBarChart.width() / fBarChart.height(),
    fBarContainer = fBarChart.parent();
    
$(window).on("resize", function() {
    var targetWidth = fBarContainer.width();
    fBarChart.attr("width", targetWidth);
    fBarChart.attr("height", Math.round(targetWidth / fBarAspect));
}).trigger("resize");

d3.csv("/vendor/inequality/FemaleBarComparison.csv", function(error, data) {
 
    data.forEach(function(d) {
        d.YearsTotal = +d.YearsTotal;
    });

    mBarX.domain(data.map(function(d) { return d.Deciles; }));
    mBarY.domain([0, d3.max(data, function(d) { return d.YearsTotal; })]);

    fBarComp.append("g")
            .attr("class", "x axis2")
            .attr("transform", "translate(0," + bHeight + ")")
            .call(mBarXAxis);

    fBarComp.append("g")
            .attr("class", "y axis2")
            .call(mBarYAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Age");

    fBarComp.selectAll(".mBar")
            .data(data)
            .enter().append("rect")
            .attr("class", "mBar")
            .style("fill", function(d,i) { var barColor = (i==0 || i==1) ? mBarColor(1) :  mBarColor(0); return barColor; })
            .attr("x", function(d,i) { var barStart = (i==0 || i==1) ? mBarX(d.Deciles)-5 :  mBarX(d.Deciles); return barStart; })
            .attr("width", function(d,i) { var barWidth = (i==0 || i==1) ? mBarX.rangeBand()+10 :  mBarX.rangeBand(); return barWidth; })
            .attr("y", function(d) { return mBarY(d.YearsTotal); })
            .attr("height", function(d) { return bHeight - mBarY(d.YearsTotal); });
    
    var fLegend = fBarComp.append("g")
		.attr("class", "mBarLegend")
		.attr("height", 100)
		.attr("width", 100)
		.attr('transform', 'translate(50,10)');
    
    var fLegendRect = fLegend.selectAll('rect').data(femaleLegendColors);

    fLegendRect.enter()
        .append("rect")
        .attr("x", bWidth - 65)
        .attr("width", 10)
        .attr("height", 10);

    fLegendRect
        .attr("y", function(d, i) {
            return i * 20;
        })
        .style("fill", function(d) {
            return d[1];
        });

    var fLegendText = fLegend.selectAll('text').data(femaleLegendColors);

    fLegendText.enter()
        .append("text")
        .attr("x", bWidth - 52);

    fLegendText
        .attr("y", function(d, i) {
            return i * 20 + 9;
        })
        .text(function(d) {
            return d[0];
        });
    
});
                            
                            
                            