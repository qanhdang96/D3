const svgWidth = 950;
const svgHeight = 450; 

const chartMargin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - chartMargin.left - chartMargin.right;
const height = svgHeight - chartMargin.top - chartMargin.bottom;

//create an svg wrapper 
const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//append an svg group 
const chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

//initial params 
let chosenXAxis = "poverty";
let chosenYAxis = "obesity";

function xScale(data, chosenXAxis) {
  let xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(data, chosenYAxis) {

  let yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

function renderXAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    const leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }



function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
 
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


function renderLabels(abbrGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
   
    abbrGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));
      .attr("y", d => newYScale(d[chosenYAxis]) + 5);
  
    return abbrGroup;
  }

//updating circles with tooltip 
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  let Xlabel = "";
  let Ylabel = "";

  if (chosenXAxis === "poverty") {
    var Xlabel = "Poverty(%):";
  }
  if (chosenXAxis === "age") {
    var Xlabel = "Age(Median):";
  }
  if (chosenXAxis === "income"){
    var Xlabel = "Household Income (Median):";
  }

  if (chosenYAxis === "healthcare") {
    var Ylabel= "Healthcare(%):";
  }
  if (chosenYAxis === "smokes") {
    var Ylabel = "Smokes(%):";
  }
  if (chosenYAxis === "obesity") {
    var Ylabel = "Obesity:";
  }


  const toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${Xlabel} ${d[chosenXAxis]}<br>${Ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup
      .on("mouseover", toolTip.show)
      .on("mouseout",  toolTip.hide);

  return circlesGroup;
}

//retrieve data from csv 
(async function(){
    const data = await d3.csv("assets/data/data.csv");

    // parse data
    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });
    console.log(data)
 
    let xLinearScale = xScale(data, chosenXAxis);

    let yLinearScale = yScale(data, chosenYAxis);
    
//create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

//append X axis 
    let xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

//append Y axis 
    let yAxis = chartGroup.append("g")
      .call(leftAxis);

    let circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 15)
      .classed("stateCircle", true);
    
    let abbrGroup =  chartGroup.selectAll('#stateText')
      .data(data)
      .enter()
      .append("text")
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d.income)+5)
      .attr("font-size", (width * 0.001) + "em")
      .text(d => d.abbr)
      .classed("stateText", true);


  const labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  const ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");
   
    const HealthcareLabel = ylabelsGroup.append("text")
    .attr("value", "healthcare") 
    .classed("inactive", true)
    .text("Lacks Healthcare (%)")
    .attr("x", 0)
    .attr("y", 60);

    const ObesityLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") 
    .classed("inactive", true)
    .text("Obese (%)");

    const SmokesLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") 
    .classed("inactive", true)
    .text("Smokes (%)");
  
    const AgeLabel = labelsGroup.append("text")
    .attr("value", "age") 
    .classed("active", true)
    .text("Age (Median)")
    .attr("x", 0)
    .attr("y", 40);

    const IncomeLabel = labelsGroup.append("text")
    .attr("value", "income") 
    .classed("active", true)
    .text("Household Income (Median)")
    .attr("x", 0)
    .attr("y", 60);
    
    const PovertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") 
    .classed("active", true)
    .text("In Poverty (%)");

  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  labelsGroup.selectAll("text")
    .on("click", function() {
      const value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;

        xLinearScale = xScale(data, chosenXAxis);

        xAxis = renderAxes(xLinearScale, xAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        abbrGroup = renderLabels(abbrGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        if (chosenXAxis === "poverty") {
          PovertyLabel
            .classed("active", true)
            .classed("inactive", false);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){ 
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", true)
            .classed("inactive", false);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
   
    ylabelsGroup.selectAll("text")
    .on("click", function() {
      const value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        chosenYAxis = value;

        yLinearScale = yScale(data, chosenYAxis);
        yAxis = renderYAxes(yLinearScale, yAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        abbrGroup = renderLabels(abbrGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        if (chosenYAxis === "healthcare") {
            HealthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            SmokesLabel
              .classed("active", false)
              .classed("inactive", true);
            ObesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes"){ 
            HealthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            SmokesLabel
              .classed("active", true)
              .classed("inactive", false);
            ObesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            HealthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            SmokesLabel
              .classed("active", false)
              .classed("inactive", true);
            ObesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
      }
    });
})()

