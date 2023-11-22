// Size of canvas. These get updated to fill the whole browser.
let width = 150;
let height = 150;

const numBoids = 1;
const visualRange = 75;
const speed = 5;
const theta = Math.random() * 2 * Math.PI;
console.log(theta);

const radius = 30;

var boids = [];

function initBoids() {
  for (var i = 0; i < numBoids; i += 1) {
    boids[boids.length] = {
      x: Math.random() * width,
      y: Math.random() * height,
      // TODO: Get the roomba to start at a random angle
      // theta: Math.random() * 2 * Math.PI,
      dx: speed * Math.cos(theta),
      dy: speed * Math.sin(theta),
      history: [],
    };
  }
}

// Called initially and whenever the window resizes to update the canvas
// size and width/height variables.
function sizeCanvas() {
  const canvas = document.getElementById("boids");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

// Constrain a boid to within the window. If it gets too close to an edge,
// nudge it back in and reverse its direction.
// TODO: Change logic to pause, rotate a random angle, and continue moving forward 
function keepWithinBounds(boid) {
  const margin = (2 * radius);
  const turnFactor = 1;

  // Left side of screen
  if (boid.x < margin) {
    boid.dx += turnFactor;
  }
  // Right side of screen
  if (boid.x > width - margin) {
    boid.dx -= turnFactor;
  }
  // Top of Screen
  if (boid.y < margin) {
    boid.dy += turnFactor;
  }
  // Bottom of screen
  if (boid.y > height - margin - 60) {
    boid.dy -= turnFactor;
  }
}

// Speed will naturally vary in flocking behavior, but real animals can't go
// arbitrarily fast.
function limitSpeed(boid) {
  const speedLimit = 5;

  const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
  if (speed > speedLimit) {
    boid.dx = (boid.dx / speed) * speedLimit;
    boid.dy = (boid.dy / speed) * speedLimit;
  }
}

const DRAW_TRAIL = true;

function drawBoid(ctx, boid) {
  if (DRAW_TRAIL) {
    ctx.strokeStyle = "#558cf466";
    ctx.beginPath();
    ctx.moveTo(boid.history[0][0], boid.history[0][1]);
    for (const point of boid.history) {
      ctx.lineTo(point[0], point[1]);
    }
    ctx.lineWidth = 2 * radius;
    ctx.stroke();
  }

  const angle = Math.atan2(boid.dy, boid.dx);
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);
  ctx.translate(-boid.x, -boid.y);
  ctx.fillStyle = "#558cf4";
  ctx.beginPath();
  ctx.arc(boid.x, boid.y, radius, 0, 2 * Math.PI);
  ctx.fill();
  // TODO: add triangle to indicate which way is forward
  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  ctx.moveTo(boid.x + (radius/2), boid.y);
  ctx.lineTo(boid.x, boid.y - (radius/5));
  ctx.lineTo(boid.x, boid.y + (radius/5));
  ctx.lineTo(boid.x + (radius/2), boid.y);
  ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);


}

// Main animation loop
function animationLoop() {
  // Update each boid
  for (let boid of boids) {
    // Update the velocities according to each rule
    // flyTowardsCenter(boid);
    // avoidOthers(boid);
    // matchVelocity(boid);
    // limitSpeed(boid);
    keepWithinBounds(boid);

    // Update the position based on the current velocity
    boid.x += boid.dx;
    boid.y += boid.dy;
    boid.history.push([boid.x, boid.y])
    // TODO: removing this line enables the trail to indicate which spots the roomba has passed over. However, it is incredibly inefficient, and causes lag long term. Determine a better way.
    // boid.history = boid.history.slice(-100);
  }

  // Clear the canvas and redraw all the boids in their current positions
  const ctx = document.getElementById("boids").getContext("2d");
  ctx.clearRect(0, 0, width, height);
  for (let boid of boids) {
    drawBoid(ctx, boid);
  }

  // Schedule the next frame
  window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
  // Make sure the canvas always fills the whole window
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();

  // Randomly distribute the boids to start
  initBoids();

  // Schedule the main animation loop
  window.requestAnimationFrame(animationLoop);
};
