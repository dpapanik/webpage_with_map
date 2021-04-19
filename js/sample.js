/*
    * Distance Barplot
    */
d3.csv("data/distance_matrix.csv", function (distance_data) {
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 10, bottom: 70, left: 50 },
        width = 860 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#distance_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // X axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(distance_data.map(function (d) { return d.group; }))
        .padding(0.3);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "myaxis")
        .call(d3.axisBottom(x));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width - 325)
        .attr("y", height + margin.top + 10)
        .style('fill', 'white')
        .text("Time of the day [h]");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 6000])
        .range([height, 0]);
    svg.append("g")
        .attr("class", "myaxis")
        .call(d3.axisLeft(y));

    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", - margin.left + 11)
        .attr("x", - margin.top - 10)
        .style('fill', 'white')
        .text("Total distance of bike rides [km]");

    // A function that create / update the plot for a given variable:
    function update(data) {
        var u = svg.selectAll("rect")
            .data(data)

        u
            .enter()
            .append("rect")
            .merge(u)
            .transition()
            .duration(1000)
            .attr("x", function (d) { return x(d.group); })
            .attr("y", function (d) { return y(d.value); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", function (d) {
                // return "rgba(0.5, 1, " + (y(d.value) * .5) + ")";
                return "rgba(" + (y(d.value) * .7) + ", 1, 1)";
            });
    }

    // Initialize the plot with the first dataset
    update(distance_data)
});

/*
* Time Barplot
*/
d3.csv("data/time_matrix.csv", function (time_data) {
    console.log(time_data);
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 10, bottom: 70, left: 60 },
        width = 860 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#time_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // X axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(time_data.map(function (d) { return d.group; }))
        .padding(0.3);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "myaxis")
        .call(d3.axisBottom(x));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width - 325)
        .attr("y", height + margin.top + 10)
        .style('fill', 'white')
        .text("Time of the day [h]");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 80000])
        .range([height, 0]);
    svg.append("g")
        .attr("class", "myaxis")
        .call(d3.axisLeft(y));

    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", - margin.left + 12)
        .attr("x", - margin.top - 10)
        .style('fill', 'white')
        .text("Total duration of the ride [min]")

    // A function that create / update the plot for a given variable:
    function update(data) {
        var u = svg.selectAll("rect")
            .data(data)

        u
            .enter()
            .append("rect")
            .merge(u)
            .transition()
            .duration(1000)
            .attr("x", function (d) { return x(d.group); })
            .attr("y", function (d) { return y(d.value); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", function (d) {
                return "rgba(0.5, 1, " + (y(d.value) * 1.2) + ")";
            });
    }

    // Initialize the plot with the first dataset
    update(time_data)
});