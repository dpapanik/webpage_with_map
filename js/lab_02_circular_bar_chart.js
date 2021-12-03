

let data;
var stations;
var scale, margin, layoutRadius1;

function preload() {
  let url ="http://api.citybik.es/v2/networks/citi-bike-nyc";
  data = loadJSON(url);
}

var maxbikes = 0, 
  maxslots = 0, 
  maxbikeslots = 0;

// var data;

function setup() {
  createCanvas(1640,960);
  background(255,215,0);
  strokeCap(SQUARE);
  noLoop(); 
  margin = 30;
  layoutRadius1 = 0.5 * displayHeight - margin;
  stations = data.network.stations;

  stations.forEach(function(d){
    maxbikes = Math.max(d.free_bikes, maxbikes);
    maxslots = Math.max(d.empty_slots, maxslots);
    maxbikeslots = Math.max(d.free_bikes + d.empty_slots, maxbikes);
  });
  scale = margin/(maxbikeslots);
  var step = (2 * PI * layoutRadius1)/stations.length;

  stations.forEach(function(d, i){
    var bikes = d.free_bikes;
    var slots = d.empty_slots;

    var x_0 = displayWidth/2 + layoutRadius1 * sin(i * 2 * PI/stations.length);
    var y_0 = displayHeight/2 + layoutRadius1 * cos(i * 2 * PI/stations.length);
    var x_1 = displayWidth/2 + (layoutRadius1+scale*bikes) * sin(i * 2 * PI/stations.length);
    var y_1 = displayHeight/2 + (layoutRadius1+scale*bikes) * cos(i * 2 * PI/stations.length);
    var x_2 = displayWidth/2 + (layoutRadius1+scale*(bikes+slots)) * sin(i * 2 * PI/stations.length);
    var y_2 = displayHeight/2 + (layoutRadius1+scale*(bikes+slots)) * cos(i * 2 * PI/stations.length);
    var x_3 = displayWidth/2 + (layoutRadius1+scale*(maxbikeslots)) * sin(i * 2 * PI/stations.length);
    var y_3 = displayHeight/2 + (layoutRadius1+scale*(maxbikeslots)) * cos(i * 2 * PI/stations.length);

    strokeWeight(0.9*step);
    stroke(0);
    line(x_0, y_0, x_1, y_1);

  });

}

function draw() {
  // background(255,215,0);
}


