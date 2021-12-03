
class Boid {
  constructor(){
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2,4));
    this.acceleration = createVector();
    this.perceptionRadius = 100;
    this.maxForce = 0.06;
    this.maxSpeed = 1.4;
    // this.maxForce = 0.2;
    // this.maxSpeed = 4;
  }


  align(boids){
    let steering = createVector();
    let total = 0;
    for (var i = 0; i < boids.length; i++){
      let d = dist(
        this.position.x, 
        this.position.y, 
        boids[i].position.x, 
        boids[i].position.y
        );
      if (boids[i] != this && d < this.perceptionRadius){
        steering.add(boids[i].velocity); // get the average velocity
        total++;
      }
    }
    if (total > 0){
      steering.div(total); // normalize
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }


  cohesion(boids){
    let steering = createVector();
    let total = 0;
    for (var i = 0; i < boids.length; i++){
      let d = dist(
        this.position.x, 
        this.position.y, 
        boids[i].position.x, 
        boids[i].position.y
        );
      if (boids[i] != this && d < this.perceptionRadius){
        steering.add(boids[i].position); // get the average position
        total++;
      }
    }
    if (total > 0){
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(boids){
    let steering = createVector();
    let total = 0;
    for (var i = 0; i < boids.length; i++){
      let d = dist(
        this.position.x, 
        this.position.y, 
        boids[i].position.x, 
        boids[i].position.y
        );
      if (boids[i] != this && d < this.perceptionRadius){
        let diff = p5.Vector.sub(this.position, boids[i].position); // subtract two vectors
        diff.div(d); // divide by distance (or multiply by 1/d)
        steering.add(diff);
        total++;
      }
    }
    if (total > 0){
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids){
    let alignment = this.align(boids); // get forces
    let cohesion = this.cohesion(boids); // get forces
    let separation = this.separation(boids); // get forces

    alignment.mult(sliderAlignment.value());
    cohesion.mult(sliderCohesion.value());
    separation.mult(sliderSeparation.value());

    this.acceleration.add(alignment); // add forces
    this.acceleration.add(cohesion); // add forces
    this.acceleration.add(separation); // add forces
  }

  update(){
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.acceleration.mult(0); // reset

    this.maxSpeed = sliderMaxSpeed.value();
    this.maxForce = sliderMaxForce.value();
    this.perceptionRadius = sliderPerceptionRadius.value();
  }

  show(){
    strokeWeight(18);
    stroke(0,100);
    // point(this.position.x,this.position.y);
    let theta = this.velocity.heading() + radians(90);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    image(bird, -9,-8, 18, 9);
    pop();
  }
}
