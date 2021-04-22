// Land Use Map
var land_use_map = L.mapbox.map('land_use_map')
        .setView([38.896653139857385, -77.03485808499167], 12)
        .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/dark-v10'));
      land_use_map
        .scrollWheelZoom.disable();

d3.json('data/assignment_3/land_use_boundary.geojson', function (error, land_use_json) {
    console.log(land_use_json)
    L.geoJson(land_use_json, {
        style: function (feature) {
            switch (feature.properties.Zoning) {
                case 'Commercial':
                    return {
                        color: "rgb(255, 0, 0)"
                    };
                case 'Mix Used':
                    return {
                        color: "rgb(26, 255, 255)"
                    };
                case 'National Mall':
                    return {
                        color: "rgb(0, 255, 0)"
                    };
                case 'Open Air':
                    return {
                        color: "rgb(255, 0, 255)"
                    };
                case 'Residential':
                    return {
                        color: "rgb(255, 255, 0)"
                    };
            }
        }
    }).addTo(land_use_map);
})

// Member Chord Graph Between Land use Areas
d3.text("data/assignment_3/member_cluster_matrix.csv", function (data) {
    var matrix = d3.csvParseRows(data).map(function (row) {
        return row.map(function (value) {
            return +value;
        });
    });
    console.log(matrix[0][0])
    var svg = d3.select("#member_chord")
        .append("svg")
        .attr("width", 440)
        .attr("height", 440)
        .append("g")
        .attr("transform", "translate(220,220)")

    // create a matrix

    // 5 groups, so create a vector of 5 colors
    var colors = ["rgb(255, 0, 0)", "rgb(26, 255, 255)", "rgb(0, 255, 0)",
        "rgb(255, 0, 255)", "rgb(255, 255, 0)"]

    // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    var res = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        (matrix)

    // add the groups on the outer part of the circle
    svg
        .datum(res)
        .append("g")
        .selectAll("g")
        .data(function (d) { return d.groups; })
        .enter()
        .append("g")
        .append("path")
        .style("fill", function (d, i) { return colors[i] })
        .style("stroke", "black")
        .attr("d", d3.arc()
            .innerRadius(200)
            .outerRadius(210)
        )

    // Add the links between groups
    svg
        .datum(res)
        .append("g")
        .selectAll("path")
        .data(function (d) { return d; })
        .enter()
        .append("path")
        .attr("d", d3.ribbon()
            .radius(200)
        )
        .style("fill", function (d) { return (colors[d.source.index]) }) // colors depend on the source group. Change to target otherwise.
        .style("stroke", "#8c8c8c");
});


// Member Chord Graph Between Land use Areas
d3.text("data/assignment_3/casual_cluster_matrix.csv", function (data) {
    var matrix = d3.csvParseRows(data).map(function (row) {
        return row.map(function (value) {
            return +value;
        });
    });
    console.log(matrix[0][0])
    var svg = d3.select("#casual_chord")
        .append("svg")
        .attr("width", 440)
        .attr("height", 440)
        .append("g")
        .attr("transform", "translate(220,220)")

    // create a matrix

    // 5 groups, so create a vector of 5 colors
    var colors = ["rgb(255, 0, 0)", "rgb(26, 255, 255)", "rgb(0, 255, 0)",
        "rgb(255, 0, 255)", "rgb(255, 255, 0)"]

    // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    var res = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        (matrix)

    // add the groups on the outer part of the circle
    svg
        .datum(res)
        .append("g")
        .selectAll("g")
        .data(function (d) { return d.groups; })
        .enter()
        .append("g")
        .append("path")
        .style("fill", function (d, i) { return colors[i] })
        .style("stroke", "black")
        .attr("d", d3.arc()
            .innerRadius(200)
            .outerRadius(210)
        )

    // Add the links between groups
    svg
        .datum(res)
        .append("g")
        .selectAll("path")
        .data(function (d) { return d; })
        .enter()
        .append("path")
        .attr("d", d3.ribbon()
            .radius(200)
        )
        .style("fill", function (d) { return (colors[d.source.index]) }) // colors depend on the source group. Change to target otherwise.
        .style("stroke", "#8c8c8c");
});