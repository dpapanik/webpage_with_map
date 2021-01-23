var mapToken = 'dimp.lk398g1b';
var indexByNameMap = d3.map();
var nameByIndexMap = d3.map();
var systemsNames = ['citi-bike-nyc', 'santander-cycles', 'velib', 'divvy','bicimad', 'capital-bikeshare', 'blue-bikes', 'indego', 'austin', 'valenbisi', 'bicing', 'veloh', 'sevici', 'bubi', 'melbourne-bike-share','bixi-toronto' ];

d3.json("http://api.citybik.es/networks.json", function(cities){
    cities.forEach(function(d){
        d.lat = +d.lat/1000000;
        d.lng = +d.lng/1000000;
        var n=0;
        if (!indexByNameMap.has(d.name)) {
              nameByIndexMap.set(n, d.name);
              indexByNameMap.set(d.name, n++);
            }
    });
    var row = d3.select("#mini_maps").append("div").attr("class","row");
    systemsNames.forEach(function(name, i){
        if(i%3==0){
            row = d3.select("#mini_maps").append("div").attr("class","row quarter-bottom-rel");
        }
        var mapDiv = row.append("div")
            .attr("class","one-third column")
        .append("div")
            .attr("id","mini_" + name)
            .style("height", "180px")
            .style("width", "100%")
            .style("margin", "0px")
            .style("border", "1px solid gray")
            .style("display", "inline-block");
        makeMap(cities.filter(function(d){return d.name==name;})[0], mapDiv);
    });
});

function makeMap(city, mapDiv, circleR){
    circleR = circleR || 2.4;
    var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/' + mapToken +'/{z}/{x}/{y}.png', { });
     var map = L.map("mini_" + city.name, {zoomControl:false})
        .addLayer(mapboxTiles)
        .setView([city.lat, city.lng], 11);       
    map.dragging.disable();
    map.scrollWheelZoom.disable();

    d3.json(city.url, function(stations) {
        stations.forEach(function(station){
            station.lat = +station.lat/1000000;
            station.lng = +station.lng/1000000;
            var path_options;
            var inventory_level = station.bikes / (station.bikes+station.free);
            if ( inventory_level > 0.5){
             path_options = {
                radius : circleR,
                color : d3.rgb(88,206,227).darker(),
                stroke: false,
                weight : 0, 
                opacity : 1,
                fillOpacity : 0.8, 
                fillColor : d3.rgb(88,206,227) 
            };
            } else { 
                path_options = {
                    radius : circleR,
                    color : d3.rgb(88,206,227).darker(2),
                    stroke: false,
                    weight :   0, 
                    opacity : 1,
                    fillOpacity : 0.7,  
                    fillColor : d3.rgb(88,206,227).darker(2) 
                };
            }
            L.circleMarker([station.lat, station.lng], path_options).addTo(map);
        });
    });
};