/*
* Distance Barplot
*/
d3.csv("data/assignment_3/distance_matrix.csv", function (distance_data) {
    console.log(distance_data);

    var margin = { top: 30, right: 10, bottom: 70, left: 60 },
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

    // List of subgroups = header of the csv files = soil condition here
    var subgroups = distance_data.columns.slice(1)

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(distance_data, function (d) { return (d.group) }).keys()

    // Add X axis
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
        .domain([0, 40000])
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

    // Another scale for subgroup position?
    var xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05])

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c', '#377eb8'])

    // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(distance_data)
        .enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + x(d.group) + ",0)"; })
        .selectAll("rect")
        .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
        .enter().append("rect")
        .attr("x", function (d) { return xSubgroup(d.key); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function (d) { return height - y(d.value); })
        .attr("fill", function (d) { return color(d.key); });

    // Legend
    svg.selectAll("mydots")
        .data(subgroups)
        .enter()
        .append("text")
        .attr("x", 120)
        .attr("y", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { return color(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
});

/*
* Time Stacked Barplot
*/
d3.csv("data/assignment_3/time_matrix.csv", function (time_data) {
    console.log(time_data);

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

    // List of subgroups = header of the csv files = soil condition here
    var subgroups = time_data.columns.slice(1)

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(time_data, function (d) { return (d.group) }).keys()

    // Add X axis
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
        .domain([0, 550000])
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

    // Another scale for subgroup position?
    var xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05])

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c', '#377eb8'])

    // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(time_data)
        .enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + x(d.group) + ",0)"; })
        .selectAll("rect")
        .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
        .enter().append("rect")
        .attr("x", function (d) { return xSubgroup(d.key); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function (d) { return height - y(d.value); })
        .attr("fill", function (d) { return color(d.key); });

    // Legend
    svg.selectAll("mydots")
        .data(subgroups)
        .enter()
        .append("text")
        .attr("x", 120)
        .attr("y", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { return color(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
});