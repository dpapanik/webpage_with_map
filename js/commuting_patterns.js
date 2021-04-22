
L.mapbox.accessToken = 'pk.eyJ1IjoiZWhlbGZyaWNoIiwiYSI6ImNra3Zhcmg5MDF1a3YycW55bmttcXA5NWEifQ.A1pr7k28x6Tf3--cUny6tA';

// Initialize Member Commute Heat Map
var member_start_map = L.mapbox.map('member_start_map')
    .setView([38.896653139857385, -77.03485808499167], 12)
    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/dark-v10'));
member_start_map
    .scrollWheelZoom.disable();

var member_end_map = L.mapbox.map('member_end_map')
    .setView([38.896653139857385, -77.03485808499167], 12)
    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/dark-v10'));
member_end_map
    .scrollWheelZoom.disable();

var mem_start_heat = L.heatLayer([], {
    maxZoom: 12,
    max: 3,
    radius: 10
}).addTo(member_start_map);

var mem_end_heat = L.heatLayer([], {
    maxZoom: 12,
    max: 3,
    radius: 10
}).addTo(member_end_map);

// Initialize Nonmember Commute Heat Map
var casual_start_map = L.mapbox.map('casual_start_map')
    .setView([38.896653139857385, -77.03485808499167], 12)
    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/dark-v10'));
casual_start_map
    .scrollWheelZoom.disable();

var casual_end_map = L.mapbox.map('casual_end_map')
    .setView([38.896653139857385, -77.03485808499167], 12)
    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/dark-v10'));
casual_end_map
    .scrollWheelZoom.disable();

var casual_start_heat = L.heatLayer([], {
    maxZoom: 12,
    max: 3,
    radius: 10
}).addTo(casual_start_map);

var casual_end_heat = L.heatLayer([], {
    maxZoom: 12,
    max: 3,
    radius: 10
}).addTo(casual_end_map);

// Function to update the maps between 
function update_heat(selectedVar) {
    if (selectedVar == 'morning') {

        d3.csv("data/assignment_3/morning_heat.csv", function (data) {
            console.log(data)

            // Clear existing Heap Map
            mem_start_heat.setLatLngs([]);
            mem_end_heat.setLatLngs([]);
            casual_start_heat.setLatLngs([]);
            casual_end_heat.setLatLngs([]);

            data.forEach(function (row) {
                // Add Member Heat Map Points
                if (row.member_casual == 'member') {
                    // start location
                    row.start_lat = +row.start_lat;
                    row.start_lng = +row.start_lng;
                    mem_start_heat.addLatLng([row.start_lat, row.start_lng]);
                    // end location
                    row.end_lat = +row.end_lat;
                    row.end_lng = +row.end_lng;
                    mem_end_heat.addLatLng([row.end_lat, row.end_lng]);
                }

                // Add Casual Heat Map Points
                if (row.member_casual == 'casual') {
                    // start location
                    row.start_lat = +row.start_lat;
                    row.start_lng = +row.start_lng;
                    casual_start_heat.addLatLng([row.start_lat, row.start_lng]);
                    // end location
                    row.end_lat = +row.end_lat;
                    row.end_lng = +row.end_lng;
                    casual_end_heat.addLatLng([row.end_lat, row.end_lng]);
                }

            });
        });
    }

    else if (selectedVar == 'evening') {

        d3.csv("data/assignment_3/evening_heat.csv", function (data) {
            console.log(data)

            // Clear existing Heap Map
            mem_start_heat.setLatLngs([]);
            mem_end_heat.setLatLngs([]);
            casual_start_heat.setLatLngs([]);
            casual_end_heat.setLatLngs([]);

            data.forEach(function (row) {
                // Add Member Heat Map Points
                if (row.member_casual == 'member') {
                    // start location
                    row.start_lat = +row.start_lat;
                    row.start_lng = +row.start_lng;
                    mem_start_heat.addLatLng([row.start_lat, row.start_lng]);
                    // end location
                    row.end_lat = +row.end_lat;
                    row.end_lng = +row.end_lng;
                    mem_end_heat.addLatLng([row.end_lat, row.end_lng]);
                }

                // Add Casual Heat Map Points
                if (row.member_casual == 'casual') {
                    // start location
                    row.start_lat = +row.start_lat;
                    row.start_lng = +row.start_lng;
                    casual_start_heat.addLatLng([row.start_lat, row.start_lng]);
                    // end location
                    row.end_lat = +row.end_lat;
                    row.end_lng = +row.end_lng;
                    casual_end_heat.addLatLng([row.end_lat, row.end_lng]);
                }

            });
        });
    }
}

update_heat('morning')
