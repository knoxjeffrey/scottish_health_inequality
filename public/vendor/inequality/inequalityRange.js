var iRMargin = {top: 40, right: 420, bottom: 0, left: 20},
	iRWidth = 900 - iRMargin.right - iRMargin.left,
	iRHeight = 500 - iRMargin.top - iRMargin.bottom;

var iRColor = d3.scale.category10().domain(d3.range(0,10));

var iRSVG = d3.select("#inequality").append("svg")
	.attr("width", iRWidth + iRMargin.left + iRMargin.right)
	.attr("height", iRHeight + iRMargin.top + iRMargin.bottom)
	.style("margin-left", iRMargin.left + "px")
	.attr("id","inequalitySVG")
    	.attr("viewBox",'0,0,900,500')
    	.attr("preserveAspectRatio", "none")
	.append("g")
	.attr("transform", "translate(" + iRMargin.left + "," + iRMargin.top + ")");
	
var inequalitySVG = $("#inequalitySVG"),
    iRAspect = inequalitySVG.width() / inequalitySVG.height(),
    iRContainer = inequalitySVG.parent();
    
$(window).on("resize", function() {
    var targetWidth = iRContainer.width();
    inequalitySVG.attr("width", targetWidth);
    inequalitySVG.attr("height", Math.round(targetWidth / iRAspect));
}).trigger("resize");
	

d3.csv("/vendor/inequality/inequalityRange.csv", function(data) {
    
    data.forEach(function(d) {
        d.absoluteRange = +d.absoluteRange;
        d.position = +d.position;
    });
    
    var iRX = d3.scale.linear()
        .domain([d3.min(data, function(d) { return d.absoluteRange; }), d3.max(data, function(d) { return d.absoluteRange; })])
        .range([0, iRWidth]);
    
    var iRXScale = d3.scale.linear()
        .domain([-50,500])
        .range([0, iRWidth]);
    
    var iRYScale = d3.scale.linear()
        //.domain([-50,500])
        .range([0, iRHeight]);

    var iRXAxis = d3.svg.axis()
                    .scale(iRXScale)
                    .orient("top");
    
    var iRYAxis = d3.svg.axis()
                    .scale(iRYScale)
                    .orient("left")
                    .ticks(0);
    
	iRSVG.append("g")
		.attr("class", "iRAxis")
		.attr("transform", "translate(0," + 0 + ")")
		.call(iRXAxis);
    
    iRSVG.append("g")
		.attr("class", "iRAxis")
		.attr("transform", "translate(42," + 0 + ")")
        .style("stroke-dasharray", ("4, 4"))
		.call(iRYAxis);

    var iRG = iRSVG.append("g");

    iRG.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", function(d) { return iRXScale(d.absoluteRange); })
        .attr("cy", function(d) { return d.position*30+20; })   
        .attr("r", 8 )
        .style("fill", function(d) { return iRColor(d.group); });

    iRG.selectAll("text")
        .data(data)
        .enter().append("text")
        .attr("x",iRWidth+20)
        .attr("y", function(d) { return d.position*30+24; })
        .attr("class","iRTypeAxis")
        .text(function(d) { return d.inequalityType; })
        .style("fill", function(d) { return iRColor(d.group); })
        .style("cursor", "pointer")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
    
    iRG.append("g")
            .attr("class", "iRAxis")
            .call(iRXAxis)
            .append("text")
            .attr("x", 340)
            .attr("y", -30)
            //.attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Rate per 100,000 population: Absolute Range");
    
    function mouseover(d) {
        iRG.append("circle")
            .attr("d", d3.select(this).attr("d"))
            .attr("id", "circleSelection")
            .attr("cx", iRXScale(d.absoluteRange))
            .attr("cy", d.position*30+20)   
            .attr("r", 12 )
            .style("fill", iRColor(d.group));
        
        d3.select(this).classed("active", true );
	}

	function mouseout(d) {
		d3.select("#circleSelection").remove();
        d3.select(this).classed("active", false );
	}
});
                            
                            