//Set up chart
var svgWidth = 960;
var svgHeight = 500;
//Setting up margins
var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 50
};
//Setting up the width and height
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper and append the SVG group that will hold chart and then set margins
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Import the datat. Set the data to numerical values 
d3.csv("assets/data/data.csv").then(function(CensusData) {
  CensusData.forEach(function(data) {
    data.age = +data.age;
    data.smokes = +data.smokes;
  });
// console.log(data);

  //Create domain and range of scale you are looking for both x and y
  const xScale = d3.scaleLinear()
    .domain(d3.extent(CensusData, d => d.age))
    .range([0, width])
    //makes the intersection of axes crisp
    .nice(); 

  const yScale = d3.scaleLinear()
    .domain([6,d3.max(CensusData, d => d.smokes)])
    .range([height, 0])
    .nice();
  
  //create axis for x and y
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);


//append axis to the chartGroup
  chartGroup.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);
  chartGroup.append("g").call(yAxis);

//set up what you are plotting on the  scatter plot
chartGroup.selectAll("circle")
.data(CensusData)
.enter()
.append("circle")
.attr("cx", d=>xScale(d.age))
.attr("cy", d=>yScale(d.smokes))
.attr("r", "10")
.attr("stroke-width", "1")
.classed("stateCircle", true)
.attr("opacity", 0.75);

//add texts to each datapoint 
chartGroup.append("g")
  .selectAll('text')
  .data(CensusData)
  .enter()
  .append("text")
  .text(d=>d.abbr)
  .attr("x",d=>xScale(d.age))
  .attr("y",d=>yScale(d.smokes))
  .classed(".stateText", true)
  .attr("font-family", "sans-serif")
  .attr("text-anchor", "middle")
  .attr("fill", "white")
  .attr("font-size", "10px")
  .style("font-weight", "bold")
  .attr("alignment-baseline", "central");
  
  //add axis titles in the chart group
  chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 13})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "black")
        .style("font-weight", "bold")
        .text("Median Age");

        chartGroup.append("text")
        .attr("y", 0 - ((margin.left / 2) + 2))
        .attr("x", 0 - (height / 2))
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "black")
        .style("font-weight", "bold")
        .attr("transform", "rotate(-90)")
        .text("Smokers (%)");
}).catch(function(error) {
  console.log(error);
});