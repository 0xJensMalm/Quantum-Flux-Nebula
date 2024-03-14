var physicModes = {
  backfire: {
    numParticles: 2000,
    accMultiplier: 0.1,
    velDamping: 0.899,
    boundaryForceMultiplier: 14,
  },
  basic: {
    numParticles: 2000,
    accMultiplier: 0.1,
    velDamping: 0.999,
    boundaryForceMultiplier: 3,
  },
  EvilEye: {
    numParticles: 5000,
    accMultiplier: 1,
    velDamping: 1,
    boundaryForceMultiplier: 1,
  },
  StarBirth: {
    numParticles: 5000,
    accMultiplier: 1,
    velDamping: 0.5,
    boundaryForceMultiplier: 50,
  },
  new: {
    numParticles: 2000,
    accMultiplier: 1,
    velDamping: 0.88,
    boundaryForceMultiplier: 1,
  },
};

// Current physics mode
var physicMode = "EvilEye";

// Use the settings from the current physics mode
var numParticles = physicModes[physicMode].numParticles;
var accMultiplier = physicModes[physicMode].accMultiplier;
var velDamping = physicModes[physicMode].velDamping;
var boundaryForceMultiplier = physicModes[physicMode].boundaryForceMultiplier;

var boundaryShape = "circular"; // Other possible values could be "square", "triangle", etc.

var edgePadding = 50;
var particles = []; // Array to hold particles
var midPoint;

// Color themes (each theme contains three colors)
var colorThemes = [
  ["#FFD700", "#FF8C00", "#FF6347"], // Gold, Dark Orange, Tomato
  ["#00CED1", "#20B2AA", "#48D1CC"], // Dark Turquoise, Light Sea Green, Medium Turquoise
  ["#9370DB", "#BA55D3", "#8A2BE2"], // Medium Purple, Medium Orchid, Blue Violet
  ["#3CB371", "#2E8B57", "#66CDAA"], // Medium Sea Green, Sea Green, Medium Aquamarine
  ["#FF69B4", "#FF1493", "#C71585"], // Hot Pink, Deep Pink, Medium Violet Red
  ["#FA8072", "#E9967A", "#FFA07A"], // Salmon, Dark Salmon, Light Salmon
  ["#ADD8E6", "#87CEFA", "#B0E0E6"], // Light Blue, Light Sky Blue, Powder Blue
  ["#FFFACD", "#FAFAD2", "#FFFFE0"], // Lemon Chiffon, Light Goldenrod Yellow, Light Yellow
  ["#FFE4B5", "#FFDAB9", "#FFE4E1"], // Moccasin, Peach Puff, Misty Rose
  ["#8FBC8F", "#90EE90", "#98FB98"], // Dark Sea Green, Light Green, Pale Green
];

// Select one random color theme at the start
var selectedTheme;

// Time intervals for color changes in milliseconds and current color index within the selected theme
var colorChangeIntervals = [0, 500, 2500, 5500, 8500]; // Includes 0 for initial batch
var currentColorIndex = 0;

var maxRadius; // Maximum boundary radius

class Particle {
  constructor(color) {
    this.pos = createVector(width / 2, height / 2);
    this.vel = p5.Vector.random2D();
    this.acc = p5.Vector.random2D().mult(accMultiplier);
    this.color = color;
  }

  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.vel.mult(velDamping);
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
  maxRadius = min(width, height) / 2 - edgePadding;
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

  // Draw the boundary with a maximum size
  var boundarySize = min(pow(frameCount, 0.95), maxRadius);
  push();
  noStroke();
  noFill();

  if (boundaryShape === "circular") {
    ellipse(width / 2, height / 2, boundarySize * 2, boundarySize * 2);
  } else if (boundaryShape === "square") {
    rectMode(CENTER);
    rect(width / 2, height / 2, boundarySize * 2, boundarySize * 2);
  } else if (boundaryShape === "triangle") {
    const height = boundarySize * sqrt(3);
    triangle(
      width / 2 - boundarySize,
      height / 2 + height / 3,
      width / 2 + boundarySize,
      height / 2 + height / 3,
      width / 2,
      height / 2 - (2 * height) / 3
    );
  }

  pop();

  // Update and draw particles
  for (var i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    // Boundary interaction needs to be adjusted based on the shape
    // This is a placeholder for circular boundary interaction
    if (boundaryShape === "circular") {
      var angle = particles[i].pos.copy().sub(midPoint).heading();
      if (
        particles[i].pos.dist(midPoint) >
        boundarySize + sin(angle / 20 + frameCount / 30) / 2
      ) {
        var distToCirBound = particles[i].pos.dist(midPoint) - boundarySize;
        var pullVel = midPoint
          .copy()
          .sub(particles[i].pos)
          .limit(5)
          .normalize()
          .mult(distToCirBound * boundaryForceMultiplier);
        particles[i].vel.add(pullVel);
      }
    }
    if (boundaryShape === "square") {
      let halfSize = boundarySize; // Since boundarySize is used like a radius
      let leftEdge = width / 2 - halfSize;
      let rightEdge = width / 2 + halfSize;
      let topEdge = height / 2 - halfSize;
      let bottomEdge = height / 2 + halfSize;

      if (particles[i].pos.x < leftEdge || particles[i].pos.x > rightEdge) {
        particles[i].vel.x *= -1; // Reverse velocity in x-direction
      }
      if (particles[i].pos.y < topEdge || particles[i].pos.y > bottomEdge) {
        particles[i].vel.y *= -1; // Reverse velocity in y-direction
      }
    }
    if (boundaryShape === "triangle") {
      let p0 = createVector(
        width / 2,
        height / 2 - (boundarySize * sqrt(3)) / 2
      );
      let p1 = createVector(
        width / 2 - boundarySize,
        height / 2 + (boundarySize * sqrt(3)) / 2
      );
      let p2 = createVector(
        width / 2 + boundarySize,
        height / 2 + (boundarySize * sqrt(3)) / 2
      );

      function pointSide(p, a, b) {
        return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
      }

      let d0 = pointSide(particles[i].pos, p0, p1);
      let d1 = pointSide(particles[i].pos, p1, p2);
      let d2 = pointSide(particles[i].pos, p2, p0);

      let inside = (d0 < 0 && d1 < 0 && d2 < 0) || (d0 > 0 && d1 > 0 && d2 > 0);

      if (!inside) {
        // This is a very simplified handling where we just reverse the particle's velocity
        // A more accurate handling would depend on the specific side the particle is colliding with
        particles[i].vel.mult(-1);
      }
    }
  }
}
