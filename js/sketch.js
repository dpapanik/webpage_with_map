// Dimitris Papanikolaou
// Example on Agent based simulation 
// Boids
// Nov 2021

const flock = [];

let nBoids =100;
let bird, sky;
let sliderAlignment;
let sliderCohesion;
let sliderSeparation;

function preload(){
  // sky = loadImage('img/sky.jpg');
  bird = loadImage('img/bird.png');
}

function setup() {
  var div = document.getElementById("sketch-holder");
  // var canvas = createCanvas(div.offsetWidth, 500);
  var canvas = createCanvas(windowWidth, 600);
  // Move the canvas so it is inside our <div id="sketch-holder">.
  canvas.parent('sketch-holder');

  sliderAlignment = createSlider(0, 5, 1, 0.1).parent(document.getElementById("sliderAlignment")).addClass('slider');
  sliderCohesion = createSlider(0, 5, 1, 0.1).parent(document.getElementById("sliderCohesion")).addClass('slider');
  sliderSeparation = createSlider(0, 5, 1, 0.1).parent(document.getElementById("sliderSeparation")).addClass('slider');

  sliderMaxSpeed = createSlider(0.5, 5, 1.4, 0.1).parent(document.getElementById("sliderMaxSpeed")).addClass('slider');
  sliderMaxForce = createSlider(0, 0.5, 0.06, 0.01).parent(document.getElementById("sliderMaxForce")).addClass('slider');
  sliderPerceptionRadius = createSlider(10, 300, 100, 1).parent(document.getElementById("sliderPerceptionRadius")).addClass('slider');

  for (let i = 0; i < nBoids; i++){
    flock.push(new Boid());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, 600);
}


function draw() {
    // background(255,80, 0);
    // image(sky, 0,0, windowWidth, windowHeight);
    clear();


  for (let boid of flock){
    boid.flock(flock);
    boid.update();
    boid.show();

    if (boid.position.x > width) {
      boid.position.x = 0;
    } else if (boid.position.x < 0) {
      boid.position.x = width;
    }
    if (boid.position.y > height) {
      boid.position.y = 0;
    } else if (boid.position.y < 0) {
      boid.position.y = height;
    }

  }

}
