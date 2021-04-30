var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight + 50);

// Append an SVG group
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
        d3.max(data, d => d[chosenXAxis]) * 1.1
      ])
      .range([0, width]);
  
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.9,
        d3.max(data, d => d[chosenYAxis]) * 1.1
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// functions used for updating circles group with a transition to a new circles for x
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
  return circlesGroup;
}

// new circles for y
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]))
  return circlesGroup;
}
// Updating text location
function renderXText(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]))

  return circlesGroup;
}

function renderYText(circlesGroup, newYScale, chosenYAxis) {

circlesGroup.transition()
  .duration(1000)
  .attr("dy", d => newYScale(d[chosenYAxis])+5)

return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === 'poverty') {
    xlabel = "Poverty:";
  }
  else if (chosenXAxis === 'age') {
    xlabel = "Age:";
  }
  else if (chosenXAxis === 'income'){
      xlabel = "Household income:"
  }

  if (chosenYAxis === 'healthcare'){
      ylabel = "Health:"
  }
  else if (chosenYAxis === 'obesity'){
      ylabel = "Obesity:"
  }
  else if (chosenYAxis === 'smokes'){
      ylabel = "Smokes:"
  }

  var toolTip = d3.tip()
    .attr("class", "toolTip")
    .offset([120, -60])
    .style("color", "white")
    .style("background", "black")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .html(function(d) {
        return (`${d.state} (${d.abbr})<br>${ylabel}${d[chosenYAxis]}<br>${xlabel}${d[chosenXAxis]}`)
  });

  circlesGroup.call(toolTip);

  circlesGroup

    // mouseover event - show tooltip
      .on("mouseover", function(data) {
      toolTip.show(data, this);
      })

    // on mouseout event - hide tooltip
      .on("mouseout", function(data) {
      toolTip.hide(data);
      })
  return circlesGroup;
};

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
    
  if (err) throw err;

  // parse data
  data.forEach(d => {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.healthcare = +d.healthcare;
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);
  
  // Create y scale function
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  
  // append x axis
  var xAxis = chartGroup.append("g")
  .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
  // append y axis
  var yAxis = chartGroup.append("g")
      .call(leftAxis);

   // append initial circles
   var circlesGroup = chartGroup.selectAll("circle")
   .data(data)
   .enter()
   .append("g");

  var circles = circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .classed('stateCircle', true);

  // append text inside circles
  var circlesText = circlesGroup.append("text")
    .text(d => d.abbr)
    .attr("dx", d => xLinearScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d[chosenYAxis])+5) // to center the text in the circles
    .classed('stateText', true);

  // Create group for three x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height})`);

  var PovertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var AgeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var IncomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

// Create group for three y-axis labels
var ylabelsGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)")

var ObeseLabel = ylabelsGroup.append("text")
  .attr("y", -80)
  .attr("x", -(height/2))
  .attr("dy", "1em")
  // value to grab for event listener
  .attr("value", "obesity") 
  .classed("inactive", true)
  .text("Obese (%)");

var SmokesLabel = ylabelsGroup.append("text")
  .attr("y", -60)
  .attr("x", -(height/2))
  .attr("dy", "1em")
  // value to grab for event listener
  .attr("value", "smokes") 
  .classed("inactive", true)
  .text("Smokes (%)");

var HealthLabel = ylabelsGroup.append("text")
  .attr("y", -40)
  .attr("x", -(height/2))
  .attr("dy", "1em")
  // value to grab for event listener
  .attr("value", "healthcare") 
  .classed("active", true)
  .text("Lacks Healthcare (%)");

// updateToolTip function above csv import
circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

