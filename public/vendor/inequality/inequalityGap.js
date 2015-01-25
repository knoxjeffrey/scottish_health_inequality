var gapMargin = {top: 20, right: 70, bottom: 70, left: 50},
    gapWidth = 960 - gapMargin.left - gapMargin.right,
    gapHeight = 500 - gapMargin.top - gapMargin.bottom;

//will return the date that falls to the left of the mouse cursor - called in the mousemove function
var bisectDate = d3.bisector(function(d) { return d.Year; }).left;

var gapX = d3.scale.linear()
    .range([70, gapWidth]);

var gapY = d3.scale.linear()
    .range([gapHeight, 0]);

var gapXAxis = d3.svg.axis()
    .scale(gapX)
    .orient("bottom")
    .tickFormat(d3.format("d"));

var gapYAxis = d3.svg.axis()
    .scale(gapY)
    .orient("left");

//cardinal spline to smooth out the line but still go through points
var gapLine = d3.svg.area()
    .interpolate("cardinal")
    .x(function(d) { return gapX(d.Year); })
    .y(function(d) { return gapY(d.mostDeprived); });

//y0 is the bottom line and y1 the top - gapArea will fill in this space. Note - can do it this way because leastDeprived is always below most in this example
var gapArea = d3.svg.area()
    .interpolate("cardinal")
    .x(function(d) { return gapX(d.Year); })
    .y0(function(d) { return gapY(d.leastDeprived); })
    .y1(function(d) { return gapY(d.mostDeprived); });

var gapSvg = d3.select("#inequalityGap").append("svg")
    .attr("width", gapWidth + gapMargin.left + gapMargin.right)
    .attr("height", gapHeight + gapMargin.top + gapMargin.bottom)
    .attr("id","inequalityGapSVG")
    .attr("viewBox",'0,0,960,500')
    .attr("preserveAspectRatio", "none")
    .append("g")
    .attr("transform", "translate(" + gapMargin.left + "," + gapMargin.top + ")");

var inequalityGapSVG = $("#inequalityGapSVG"),
    iGAspect = inequalityGapSVG.width() / inequalityGapSVG.height(),
    iGContainer = inequalityGapSVG.parent();
    
$(window).on("resize", function() {
    var targetWidth = iGContainer.width();
    inequalityGapSVG.attr("width", targetWidth);
    inequalityGapSVG.attr("height", Math.round(targetWidth / iGAspect));
}).trigger("resize");

//variable used to store the index position in the nested data when selecting from the legend
var gapSelection = 0;
//variable used to store the key from the nested data when selecting from the legend
var tagSelection;
//variable holds all the data when selecting from the legend
var storeValues;

d3.csv("/vendor/inequality/inequalityGap.csv",gapType, function(error, data) {
    
    //extent is equivalent of using min and max functions
    gapX.domain(d3.extent(data, function(d) { return d.Year; }));
    gapY.domain([0,900]);
    
    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {return d.symbol;})
        .entries(data);

    // set the colour scale
    var gapColor = d3.scale.category10();   

    // spacing for the legend
    var legendSpace = gapWidth/dataNest.length; 
    
    // Loop through each symbol / key
    dataNest.forEach(function(d,i) { 
    
        //following code is to change area color and text depending on whether the gap has narrowed from start date to end date
        var startDifference = d.values[0].mostDeprived- d.values[0].leastDeprived;
        var endDifference = d.values[13].mostDeprived- d.values[13].leastDeprived;
        var percentageChange = -(((startDifference-endDifference)/startDifference)*100);
        
        var changetextPosition = (d.values[13].mostDeprived + d.values[13].leastDeprived)/2;
        
        //The .replace calls the regular expression action on our key. \s is the regex for “whitespace”, and g is the “global” flag, meaning match ALL \s (whitespaces). The + allows for any contiguous string of space characters to being replaced with the empty string ('')
        if (startDifference >= endDifference) {
            gapSvg.append("path")
                .attr("class", "gapArea less")
                .attr("id", 'area'+d.key.replace(/\s+/g, '')) // assign ID
                .attr("d", gapArea(d.values));
            
            gapSvg.append("text")
                .attr("transform", "translate(" + gapX(d.values[12].Year) + "," + gapY(changetextPosition) + ")")
                .style("fill", "white")
                .style("font-size", "14px")
                .attr("class", "gapAxis")
                .attr("id", 'percentage'+d.key.replace(/\s+/g, ''))
                .attr("dy", ".35em")
                .text(percentageChange.toFixed(2) + "%");
        } else {
            gapSvg.append("path")
                .attr("class", "gapArea greater")
                .attr("id", 'area'+d.key.replace(/\s+/g, '')) // assign ID
                .attr("d", gapArea(d.values));
            
            gapSvg.append("text")
                .attr("transform", "translate(" + gapX(d.values[12].Year) + "," + gapY(changetextPosition) + ")")
                .style("fill", "white")
                .style("font-size", "14px")
                .attr("class", "gapAxis")
                .attr("id", 'percentage'+d.key.replace(/\s+/g, ''))
                .attr("dy", ".35em")
                .text("+" + percentageChange.toFixed(2) + "%");
        }
        
        //add label to top line
        gapSvg.append("text")
            .attr("transform", "translate(" + (gapWidth+3) + "," + gapY(d.values[13].mostDeprived) + ")")
            .attr("dy", ".35em")
            .attr("class", "gapAxis")
            .attr("id", 'most'+d.key.replace(/\s+/g, '')) // assign ID
            .text("Most Deprived");
        
        //add label to bottom line
        gapSvg.append("text")
            .attr("transform", "translate(" + (gapWidth+3) + "," + gapY(d.values[13].leastDeprived) + ")")
            .attr("dy", ".35em")
            .attr("class", "gapAxis")
            .attr("id", 'least'+d.key.replace(/\s+/g, '')) // assign ID
            .text("Least Deprived");
        
        //add a title
        gapSvg.append("text")
            .attr("transform", "translate(" + ((gapWidth/2)+70) + "," + 10 + ")")
            .attr("dy", ".35em")
            .attr("class", "gapLegend")
            .style("fill", function() { return d.color = gapColor(d.key); })
            .attr("id", 'title'+d.key.replace(/\s+/g, '')) // assign ID
            .text(d.values[0].Factor);
        
        //hide all of the data apart from the first data in the nest
        if (i !=0 )  {
            d3.select("#area"+d.key.replace(/\s+/g, ''))
                    .style("opacity", 0); 
                d3.select("#percentage"+d.key.replace(/\s+/g, ''))
                    .style("opacity", 0);
                d3.select("#most"+d.key.replace(/\s+/g, ''))
                    .style("opacity", 0);
                d3.select("#least"+d.key.replace(/\s+/g, ''))
                    .style("opacity", 0);
                d3.select("#title"+d.key.replace(/\s+/g, ''))
                    .style("opacity", 0);
        } else {
            //store details from the first item in the nest
            tagSelection = d.key.replace(/\s+/g, '');
            storeValues = d.values;
        }
            

        // Add the Legend
        gapSvg.append("text")
            .attr("x", (legendSpace/2)+i*legendSpace)  // space legend
            .attr("y", gapHeight + gapMargin.bottom - 10)
            .attr("class", "gapLegend")    // style the legend
            .style("fill", function() { return d.color = gapColor(d.key); })
            .style("cursor", "pointer")
            .on("click", function(){
            
                if(i=gapSelection) {
                    //do nothing if selecting index that is already displayed
                } else {
                    //hide the previous data in the index
                    d3.select("#area"+tagSelection)
                        .transition().duration(100)
                        .style("opacity", 0); 
                    d3.select("#percentage"+tagSelection)
                        .transition().duration(100)
                        .style("opacity", 0);
                    d3.select("#most"+tagSelection)
                        .transition().duration(100)
                        .style("opacity", 0);
                    d3.select("#least"+tagSelection)
                        .transition().duration(100)
                        .style("opacity", 0);
                    d3.select("#title"+tagSelection)
                        .transition().duration(100)
                        .style("opacity", 0);
                    
                    //make the selected data visible
                    d3.select("#area"+d.key.replace(/\s+/g, ''))
                        .transition().duration(100)
                        .style("opacity", 1); 
                    d3.select("#percentage"+d.key.replace(/\s+/g, ''))
                        .transition().duration(100)
                        .style("opacity", 1);
                    d3.select("#most"+d.key.replace(/\s+/g, ''))
                        .transition().duration(100)
                        .style("opacity", 1);
                    d3.select("#least"+d.key.replace(/\s+/g, ''))
                        .transition().duration(100)
                        .style("opacity", 1);
                    d3.select("#title"+d.key.replace(/\s+/g, ''))
                        .transition().duration(100)
                        .style("opacity", 1);
                    
                    //store the newly selected index
                    gapSelection = i;
                    //store the newly selectedkey
                    tagSelection = d.key.replace(/\s+/g, '');
                    //store the newly selected values
                    storeValues = d.values;
                }
                        
            })  
            .text(d.key); 
        
        //this overlay will display the percentage difference on mouseover
        var focus = gapSvg.append("g")
              .style("fill", "white")
              .style("font-size", "14px")
              .attr("class", "gapAxis")
              .style("display", "none");

        focus.append("text")
            .attr("dy", ".35em");
        
        //this overlay will place a rectangle around the relevant year on mouseover
        var focusYearHighlight = gapSvg.append("g")
              .style("fill", "none")
              .style("stroke", "#999")
              .style("font-size", "14px")
              .attr("class", "gapAxis")
              .style("display", "none");
        
        focusYearHighlight.append("rect")
            .attr("width", "50px")
            .attr("height", "30px");
        
        //overlay an invisible rect over the graph that can take mouse events
        var gapOverlay = gapSvg.append("rect")
            .attr("class", "gapOverlay")
            .attr("width", gapWidth)
            .attr("height", gapHeight)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("touchend", funcDelay)
            .on("mousemove", mousemove)
            .on("touchmove", mousemove)
            .on("touchstart", nobehaviour);
        
        //needed a delay because on touch devices mouseout was completing before mousemove and causing display issues - need to keep order or touchstart, touchmove, touchend
        function funcDelay () {
        	setTimeout(mouseout, 200);
        }
        
        //stop touch presses being registered - only want touchmove events
        function nobehaviour() {
            d3.event.preventDefault();
        }
        

        //show the focus events as defined above and hide the percentage tag
        function mouseover() {
            //by setting the display style to null the default value for display is enacted and this is inline which allows the elements to be rendered as normal. Not sure why inline shouldnt be used but Mike Bostock did it this way in his example
            focus.style("display", null);
            focusYearHighlight.style("display", null);
            d3.select("#percentage"+tagSelection)
                    .style("opacity", 0);
        }
        
        //resets the graph to how it was before a mouseover - needed a bit more code to correct the color
        function mouseout() {
            var tempStartDifference = storeValues[0].mostDeprived- storeValues[0].leastDeprived;
            var tempEndDifference = storeValues[13].mostDeprived- storeValues[13].leastDeprived;

            if (tempStartDifference >= tempEndDifference) {
                d3.select("#area"+tagSelection)
                    .transition().duration(100)
                    .attr("class", "gapArea less");
            } else {
                d3.select("#area"+tagSelection)
                    .transition().duration(100)
                    .attr("class", "gapArea greater");
            }

            focus.style("display", "none");
            focusYearHighlight.style("display", "none");
            d3.select("#percentage"+tagSelection)
                    .style("opacity", 1);
        }

        function mousemove() {
            //following four lines help handle events on a touch screen. PreventDefault stop the whole screen from scrolling when sliding finger on graph and the others are the equivalent statements from mouseover because obviously there cant be mouseover behaviour on touch screen.
            d3.event.preventDefault();
            focus.style("display", null);
            focusYearHighlight.style("display", null);
            d3.select("#percentage"+tagSelection)
                    .transition().duration(100)
                    .style("opacity", 0);
            
            //return the x position of the mouse -  note array position 1 is the y position. Then inverts the process of converting a domain to a range in order to get the date. Nice!
            var x0 = gapX.invert(d3.mouse(this)[0]),
            //take our storevalues array and the date corresponding to the position of or mouse cursor and returns the index number of the storevalues array which has a date that is higher than the cursor position
            i = bisectDate(storeValues, x0, 1),
            //d0 is the combination of date and info that is in the storevalues array at the index to the left of the cursor and d1 is the combination of date and info that is in the storevalues array at the index to the right of the cursor. In other words we now have two variables that know the info and date above and below the date that corresponds to the position of the cursor.
            d0 = storeValues[i - 1],
            d1 = storeValues[i],
            //declares a new array d that is represents the date and info combination that is closest to the cursor
            d = x0 - d0.Year > d1.Year - x0 ? d1 : d0;

            var tempStartDifference = storeValues[0].mostDeprived- storeValues[0].leastDeprived;
            var tempEndDifference = d.mostDeprived- d.leastDeprived;
            var tempPercentageChange = -(((tempStartDifference-tempEndDifference)/tempStartDifference)*100);
            var tempChangeTextPosition = (d.mostDeprived + d.leastDeprived)/2;

            focusYearHighlight.attr("transform", "translate(" + (gapX(d.Year)-25) + "," + gapHeight + ")");
            
            //obviously don't want to show any info if over the initial date because it's a zero change
            if (d.Year != 1998) {
                focus.attr("transform", "translate(" + (gapX(d.Year)-(gapWidth/7)+61) + "," + gapY(tempChangeTextPosition) + ")");

                if (tempStartDifference >= tempEndDifference) {
                    d3.select("#area"+tagSelection)
                        .transition().duration(100)
                        .attr("class", "gapArea less");

                    focus.select("text").text(tempPercentageChange.toFixed(2) + "%");
                } else {
                    d3.select("#area"+tagSelection)
                        .transition().duration(100)
                        .attr("class", "gapArea greater");

                    focus.select("text").text("+" + tempPercentageChange.toFixed(2) + "%"); 
                }
            } else {
                focus.select("text").text(""); 
            }

        }
        
    });
    
  gapSvg.append("g")
      .attr("class", "gapX gapAxis")
      .attr("transform", "translate(0," + gapHeight + ")")
      .call(gapXAxis);

    gapSvg.append("g")
      .attr("class", "gapY gapAxis")
      .call(gapYAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Rate per 100,000 population");  
 
});

function gapType(d) {
        d.Year = +d.Year;  
        d.mostDeprived = +d.mostDeprived;
        d.leastDeprived = +d.leastDeprived;
        
        return d;
}
                            
                            