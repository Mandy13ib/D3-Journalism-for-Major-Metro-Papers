// create the first axis variable poverty and healthcare
var selectedXAxis = "poverty";
var selectedYAxis = "healthcare";

// function to update the change in xscale
function xScale(data, selectedXAxis, chartWidth) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[selectedXAxis]) * .8,
        d3.max(data, d => d[selectedXAxis]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}

// function to update the change in xaxis
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function to update the change in yscale
function yScale(data, selectedYAxis, chartHeight) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[selectedYAxis]) * .8,
        d3.max(data, d => d[selectedYAxis]) * 1.1])
        .range([chartHeight, 0]);
    return yLinearScale;
}

//  function to update the change in yaxis
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// Updateing marker circles
function renderCircles(circlesGroup, newXScale, newYScale, selectedXAxis, selectedYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[selectedXAxis]))
        .attr("cy", d => newYScale(d[selectedYAxis]));
    return circlesGroup;
}

// setting up the text in the circle markers 
function renderText(circlesTextGroup, newXScale, newYScale, selectedXAxis, selectedYAxis) {
    circlesTextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[selectedXAxis]))
        .attr("y", d => newYScale(d[selectedYAxis]));
    return circlesTextGroup;
}

// circle tool tooltip - loop for the change function
function updateToolTip(selectedXAxis, selectedYAxis, circlesGroup, textGroup) {
    //  conditionals for the x axis
    if (selectedXAxis === "poverty") {
        var xlabel = "Poverty";
    } else if (selectedXAxis === "income") {
        var xlabel = "Median Income";
    } else {
        var xlabel = "Age"
    }

    //  conditionals for the y axis
    if (selectedYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare";
    } else if (selectedYAxis === "smokes") {
        var ylabel = "Smokers"
    } else {
        var ylabel = "Obesity"
    }

    // tooltips for the x axis functions
    var toolTip = d3.tip()
        .offset([120, -60])
        .attr("class", "d3-tip")
        .html(function (d) {
            //  y tips as percentage
            if (selectedXAxis === "age") { 
                return (`${d.state}<hr>${xlabel} ${d[selectedXAxis]}<br>${ylabel}${d[selectedYAxis]}%`)
           // income in $ x axis
            } else if (selectedXAxis !== "poverty" && selectedXAxis !== "age") {
                return (`${d.state}<hr>${xlabel}$${d[selectedXAxis]}<br>${ylabel}${d[selectedYAxis]}%`)
            //  poverty as % x axis
            } else { 
                return (`${d.state}<hr>${xlabel}${d[selectedXAxis]}%<br>${ylabel}${d[selectedYAxis]}%`)
            }
        });

    circlesGroup.call(toolTip)

    // setting up functions display for the mouseover events
    circlesGroup
        .on("mouseover", function (data) {
            toolTip.show(data, this)
        })
        .on("mouseout", function (data) {
            toolTip.hide(data)
        })
    textGroup
        .on("mouseover", function (data) {
            toolTip.show(data, this)
        })
        .on("mouseout", function (data) {
            toolTip.hide(data)
        })
    return circlesGroup
}

function makeResponsive() {

    //setting up the div by the id
    var svgArea = d3.select("#scatter").select("svg");
    //clear the empty svg and removing them
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    //setting up the svg parameters
    var svgHeight = window.innerHeight / 1.5;
    var svgWidth = window.innerWidth / 1.5;
    var margin = { top: 50, right: 50, bottom: 80, left: 100 };

    //  chart area
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;
    
    // Create an SVG wrapper and append the SVG group that will hold chart and then set margins
    var svg = d3
     .select("#scatter")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")   // append svg group(g) 
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // append svg group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    d3.csv("assets/data/data.csv").then(function (demoData, err) {
        if (err) throw err;

        //  parse data
        demoData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = data.obesity;
        });
        // create the linear scales
        var xLinearScale = xScale(demoData, selectedXAxis, chartWidth);
        var yLinearScale = yScale(demoData, selectedYAxis, chartHeight);

        // initial the axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        //  append the x axis
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        //  append the y axis
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        //  data for the circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(demoData);

        // bind the data
        var elemEnter = circlesGroup.enter();

        // create the circles
        var circle = elemEnter.append("circle")
            .attr("cx", d => xLinearScale(d[selectedXAxis]))
            .attr("cy", d => yLinearScale(d[selectedYAxis]))
            .attr("r", 15)
            .classed("stateCircle", true);

        // add the circle text
        var circleText = elemEnter.append("text")
            .attr("x", d => xLinearScale(d[selectedXAxis]))
            .attr("y", d => yLinearScale(d[selectedYAxis]))
            .attr("dy", ".35em")
            .text(d => d.abbr)
            .classed("stateText", true);

        // update the tooltip
        var circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circle, circleText);

        // add all the labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") //event listenter
            .classed("active", true)
            .text("In Poverty %");
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // listener
            .attr("inactive", true)
            .text("Age Median")
        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // listener
            .classed("inactive", true)
            .text("Household Income Median")
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare %");
        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 20 - margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes %");
        var obeseLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese %");

        // x listener
        xLabelsGroup.selectAll("text")
            .on("click", function () {
               
                // get the selected label
                selectedXAxis = d3.select(this).attr("value");
                // update the scale
                xLinearScale = xScale(demoData, selectedXAxis, chartWidth);
                // render the axis
                xAxis = renderXAxes(xLinearScale, xAxis)
                
                // move between the selections with a loop
                if (selectedXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (selectedXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis)
                circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circle, circleText)
                circleText = renderText(circleText, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis)
            })
        yLabelsGroup.selectAll("text")
        .on("click", function () {
        // get the y label
        selectedYAxis = d3.select(this).attr("value");
        // update the scale
        yLinearScale = yScale(demoData, selectedYAxis, chartHeight);
        //  update the axis
        yAxis = renderYAxes(yLinearScale, yAxis);
    // move between the selections
    if (selectedYAxis === "healthcare") {
       healthcareLabel
        .classed("active", true)
        .classed("inactive", false)
      smokesLabel
        .classed("acitve", false)
        .classed("inactive", true)
      obeseLabel
        .classed("active", false)
        .classed("inactive", true)
    } else if (selectedYAxis === "smokes") {
      healthcareLabel
        .classed("active", false)
        .classed("inactive", true)
      smokesLabel
        .classed("acitve", true)
        .classed("inactive", false)
      obeseLabel
        .classed("active", false)
        .classed("inactive", true)
        } else {
      healthcareLabel
        .classed("active", false)
        .classed("inactive", true)
    smokesLabel
        .classed("acitve", false)
        .classed("inactive", true)
    obeseLabel
        .classed("active", true)
        .classed("inactive", false)
     }
    circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis);
    circleText = renderText(circleText, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis);
    circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circle, circleText);
    });

    }).catch(function (err) {
        console.log(err);
    });
}
makeResponsive();
d3.select(window).on("resize", makeResponsive);