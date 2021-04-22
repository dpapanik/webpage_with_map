/* <button onclick="update('var1')">Membership</button>
      <button onclick="update('var2')">Non-Membership</button> */

// set the dimensions and margins of the graph
var margin = { top: 30, right: 10, bottom: 70, left: 50 },
    width = 860 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Initialize the X axis
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);
var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")

// Add X axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width - 325)
    .attr("y", height + margin.top + 10)
    .style('fill', 'white')
    .text("Time of the day [h]");

// Initialize the Y axis
var y = d3.scaleLinear()
    .range([height, 0]);
var yAxis = svg.append("g")
    .attr("class", "myYaxis")

// Y axis label:
var yAxisLabel = svg.append("text")
    .attr("class", "text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", - margin.left + 11)
    .attr("x", - margin.top - 10)
    .style('fill', 'white')
    .text("Total distance of bike rides [km]");

/* svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", - margin.left + 11)
    .attr("x", - margin.top - 10)
    .style('fill', 'white')
    .text("Total distance of bike rides [km]"); */


// A function that create / update the plot for a given variable:
function update(selectedVar) {

    if (selectedVar == "var1") {

        // Parse the Data
        d3.csv("data/distance_matrix.csv", function (data) {
            console.log(data)
            // X axis
            x.domain(data.map(function (d) { return d.group; }))
            xAxis.transition().duration(1000).call(d3.axisBottom(x))

            // Add Y axis
            y.domain([0, d3.max(data, function (d) { return +d[selectedVar] })]);
            yAxis.transition().duration(1000).call(d3.axisLeft(y));

            // variable u: map data to existing bars
            var u = svg.selectAll("rect")
                .data(data)

            // update bars
            u
                .enter()
                .append("rect")
                .merge(u)
                .transition()
                .duration(1000)
                .attr("x", function (d) { return x(d.group); })
                .attr("y", function (d) { return y(d[selectedVar]); })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return height - y(d[selectedVar]); })
                .attr("fill", "#69b3a2")

                svg.select('.text')
                .text("Total distance of bike rides [km]")
        })
    }

    else if (selectedVar == "var2") {
        // Parse the Data
        d3.csv("data/distance_matrix.csv", function (data) {
            console.log(data)
            // X axis
            x.domain(data.map(function (d) { return d.group; }))
            xAxis.transition().duration(1000).call(d3.axisBottom(x))

            // Add Y axis
            y.domain([0, d3.max(data, function (d) { return +d[selectedVar] })]);
            yAxis.transition().duration(1000).call(d3.axisLeft(y));

            // variable u: map data to existing bars
            var u = svg.selectAll("rect")
                .data(data)

            // update bars
            u
                .enter()
                .append("rect")
                .merge(u)
                .transition()
                .duration(1000)
                .attr("x", function (d) { return x(d.group); })
                .attr("y", function (d) { return y(d[selectedVar]); })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return height - y(d[selectedVar]); })
                .attr("fill", "#69b3a2")

            svg.select('.text')
                .text("Total duration of the ride [min]")
        })
    }

}

// Initialize plot
update('var1')