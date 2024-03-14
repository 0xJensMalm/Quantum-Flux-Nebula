// Global configuration variables
var numParticles = 5000;
var accMultiplier = 0.1;
var velDamping = 0.999;
var boundaryForceMultiplier = 3;
var particles = []; // Array to hold particles
var midPoint;

// Color themes (each theme contains three colors)
var colorThemes = [
  ["#FFD700", "#FF8C00", "#FF6347"], // Gold, Dark Orange, Tomato
  ["#00CED1", "#20B2AA", "#48D1CC"], // Dark Turquoise, Light Sea Green, Medium Turquoise
  ["#9370DB", "#BA55D3", "#8A2BE2"], // Medium Purple, Medium Orchid, Blue Violet
  ["#3CB371", "#2E8B57", "#66CDAA"], // Medium Sea Green, Sea Green, Medium Aquamarine
];

// Select one random color theme at the start
var selectedTheme;

// Time intervals for color changes in milliseconds and current color index within the selected theme
var colorChangeIntervals = [0, 500, 2500, 5500, 8500]; // Includes 0 for initial batch
var currentColorIndex = 0;

class Particle {
  constructor(color) {
    this.pos = createVector(width / 2, height / 2);
    this.vel = p5.Vector.random2D();
    this.acc = p5.Vector.random2D().mult(accMultiplier);
    this.color = color;
  }

  update() {
    this.pos.add(this.vel);
    // Check for collision with the left or right walls
    if (this.pos.x <= 0 || this.pos.x >= width) {
      this.vel.x *= -1; // Reverse x velocity
      this.pos.x = constrain(this.pos.x, 0, width); // Keep particle within bounds
    }
    // Check for collision with the top or bottom walls
    if (this.pos.y <= 0 || this.pos.y >= height) {
      this.vel.y *= -1; // Reverse y velocity
      this.pos.y = constrain(this.pos.y, 0, height); // Keep particle within bounds
    }
  }

  draw() {
    push();
    fill(this.color);
    noStroke();
    translate(this.pos.x, this.pos.y);
    ellipse(0, 0, 2, 2);
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  midPoint = createVector(width / 2, height / 2);
  selectedTheme = random(colorThemes);
}

function draw() {
  background(0, 10);

  // Determine if it's time to change color within the selected theme
  if (
    currentColorIndex < colorChangeIntervals.length - 1 &&
    millis() > colorChangeIntervals[currentColorIndex + 1]
  ) {
    currentColorIndex++;
  }

  // Create particles in batches with the current color from the selected theme
  while (
    particles.length <
    (currentColorIndex + 1) * (numParticles / colorChangeIntervals.length)
  ) {
    var newColor = selectedTheme[currentColorIndex % selectedTheme.length];
    particles.push(new Particle(newColor));
  }

  // Draw the boundary
  var r = pow(frameCount, 0.95);
  push();
  stroke(255, 10);
  noFill();
  ellipse(width / 2, height / 2, r * 2, r * 2);
  pop();

  // Update and draw particles
  for (var i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    // Reverse speed if it exceeds the boundary
    var angle = particles[i].pos.copy().sub(midPoint).heading();
    if (
      particles[i].pos.dist(midPoint) >
      r + sin(angle / 20 + frameCount / 30) / 2
    ) {
      var distToCirBound = particles[i].pos.dist(midPoint) - r;
      var pullVel = midPoint
        .copy()
        .sub(particles[i].pos)
        .limit(5)
        .normalize()
        .mult(distToCirBound * boundaryForceMultiplier);
      particles[i].vel.add(pullVel);
    }
  }
}
