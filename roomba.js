// Size of canvas. These get updated to fill the whole browser.
let width = 150;
let height = 150;

const numRoombas = 1;
const visualRange = 75;
const speed = 5;
const theta = Math.random() * 2 * Math.PI;
console.log(theta);

const radius = 30;

var roombas = [];

function initRoombas() {
  for (var i = 0; i < numRoombas; i += 1) {
    roombas[roombas.length] = {
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
  const canvas = document.getElementById("roombas");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

// Constrain a roomba to within the window. If it gets too close to an edge,
// nudge it back in and reverse its direction.
// TODO: Change logic to pause, rotate a random angle, and continue moving forward 
function keepWithinBounds(roomba) {
  const margin = (2 * radius);
  const turnFactor = 1;

  // Left side of screen
  if (roomba.x < margin) {
    roomba.dx += turnFactor;
  }
  // Right side of screen
  if (roomba.x > width - margin) {
    roomba.dx -= turnFactor;
  }
  // Top of Screen
  if (roomba.y < margin) {
    roomba.dy += turnFactor;
  }
  // Bottom of screen
  if (roomba.y > height - margin - 60) {
    roomba.dy -= turnFactor;
  }
}

// Speed will naturally vary in flocking behavior, but real animals can't go
// arbitrarily fast.
function limitSpeed(roomba) {
  const speedLimit = 5;

  const speed = Math.sqrt(roomba.dx * roomba.dx + roomba.dy * roomba.dy);
  if (speed > speedLimit) {
    roomba.dx = (roomba.dx / speed) * speedLimit;
    roomba.dy = (roomba.dy / speed) * speedLimit;
  }
}

const DRAW_TRAIL = true;

function drawRoomba(ctx, roomba) {
  if (DRAW_TRAIL) {
    ctx.strokeStyle = "#558cf466";
    ctx.beginPath();
    ctx.moveTo(roomba.history[0][0], roomba.history[0][1]);
    for (const point of roomba.history) {
      ctx.lineTo(point[0], point[1]);
    }
    ctx.lineWidth = 2 * radius;
    ctx.stroke();
  }

  const angle = Math.atan2(roomba.dy, roomba.dx);
  ctx.translate(roomba.x, roomba.y);
  ctx.rotate(angle);
  ctx.translate(-roomba.x, -roomba.y);
  ctx.fillStyle = "#558cf4";
  ctx.beginPath();
  ctx.arc(roomba.x, roomba.y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  ctx.moveTo(roomba.x + (radius/2), roomba.y);
  ctx.lineTo(roomba.x, roomba.y - (radius/5));
  ctx.lineTo(roomba.x, roomba.y + (radius/5));
  ctx.lineTo(roomba.x + (radius/2), roomba.y);
  ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);


}

// Main animation loop
function animationLoop() {
  // Update each roomba
  for (let roomba of roombas) {
    // Update the velocities according to each rule
    // flyTowardsCenter(roomba);
    // avoidOthers(roomba);
    // matchVelocity(roomba);
    // limitSpeed(roomba);
    keepWithinBounds(roomba);

    // Update the position based on the current velocity
    roomba.x += roomba.dx;
    roomba.y += roomba.dy;
    roomba.history.push([roomba.x, roomba.y])
    // TODO: removing this line enables the trail to indicate which spots the roomba has passed over. However, it is incredibly inefficient, and causes lag long term. Determine a better way.
    // roomba.history = roomba.history.slice(-100);
  }

  // Clear the canvas and redraw all the roombas in their current positions
  const ctx = document.getElementById("roombas").getContext("2d");
  ctx.clearRect(0, 0, width, height);
  for (let roomba of roombas) {
    drawRoomba(ctx, roomba);
  }

  // Schedule the next frame
  window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
  // Make sure the canvas always fills the whole window
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();

  // Randomly distribute the roombas to start
  initRoombas();

  // Schedule the main animation loop
  window.requestAnimationFrame(animationLoop);
};
