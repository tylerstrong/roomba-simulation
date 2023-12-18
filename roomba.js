// Size of canvas. These get updated to fill the whole browser.
let width = 150;
let height = 150;

function getRandomInt(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function getRandomFloat(min, max) {
  var tolerance = 0.0001;
  min += tolerance;
  max -= tolerance;
  return (Math.random() * (max - min) + min);
}

const numRoombas = 1;
// const visualRange = 75;
const speed = 5;
const theta = Math.random() * 2 * Math.PI;

const radius = 30;
const diameter = 2 * radius;

var roombas = [];
var newTheta;

function initRoombas() {
  for (var i = 0; i < numRoombas; i += 1) {
    roombas[roombas.length] = {
      // TODO: Fix spawn point issue where sometimes roomba spawns near the edge, causing it to glitch
      x: getRandomInt(diameter, width - diameter),
      y: getRandomInt(diameter, height - diameter),
      // TODO: Get the roomba to start at a random angle
      theta: theta,
      dx: speed * Math.cos(theta),
      dy: speed * Math.sin(theta),
      speed: Math.sqrt(this.dx**2 + this.dy**2),
      history: [],
    };
  }
}

// Called initially and whenever the window resizes to update the canvas
// size and width/height variables.
function sizeCanvas() {
  const canvas = document.getElementById("roomba");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

// Constrain a roomba to within the window. If it gets too close to an edge,
// nudge it back in and reverse its direction.
// TODO: Address issue where window size is changed and roomba is way outside the new boundaries
function keepWithinBounds(roomba) {
  const margin = diameter;

  function getNewVelocity(min, max) {
    const n = 60; // number of frames
    newTheta = newTheta ? newTheta : getRandomFloat(min, max); // If newTheta already exists, don't update it
    // Check last n points in roomba history. If the roomba hasn't been moving for n frames, get it moving again
    if (roomba.history.slice(-n).every((point) => point[0] === roomba.x && point[1] === roomba.y)) {
      roomba.dx = speed * Math.cos(newTheta);
      roomba.dy = speed * Math.sin(newTheta);
      newTheta = undefined; // reset newTheta so that it can be used again later
    } else {
      roomba.dx = 0;
      roomba.dy = 0;
    }
  }

  // Left side of screen
  if (roomba.x < margin) {
    getNewVelocity(-Math.PI/2, Math.PI/2);
  }
  // Right side of screen
  if (roomba.x > width - margin) {
    getNewVelocity(Math.PI/2, 3 * Math.PI/2);
  }
  // Top of Screen
  if (roomba.y < margin) {
    getNewVelocity(0, Math.PI);
  }
  // Bottom of screen
  if (roomba.y > height - margin) {
    getNewVelocity(Math.PI, 2 * Math.PI);
  }
}

function drawRoomba(ctx, roomba) {
  // TODO: Fix sharp trail edges when roomba changes velocity
  // Create trail representing roomba's history
  ctx.strokeStyle = "#558cf466";
  ctx.beginPath();
  ctx.moveTo(roomba.history[0][0], roomba.history[0][1]);
  for (const point of roomba.history) {
    ctx.lineTo(point[0], point[1]);
  }
  ctx.lineWidth = diameter;
  ctx.lineCap = "round";
  ctx.stroke();
  
  let angle = roomba.theta;
  
  // Create blue circle representing roomba
  ctx.translate(roomba.x, roomba.y);
  ctx.rotate(angle);
  ctx.translate(-roomba.x, -roomba.y);
  ctx.fillStyle = "#558cf4";
  ctx.beginPath();
  ctx.arc(roomba.x, roomba.y, radius, 0, 2 * Math.PI);
  ctx.fill();

  // Create red triangle indicating roomba orientation
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(roomba.x + (radius/2), roomba.y);
  ctx.lineTo(roomba.x, roomba.y - (radius/5));
  ctx.lineTo(roomba.x, roomba.y + (radius/5));
  ctx.lineTo(roomba.x + (radius/2), roomba.y);
  ctx.fill();

  // This line locks the orientation in place. Removing it rotates the canvas from the roombas perspective
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Main animation loop
function animationLoop() {
  // Update each roomba
  for (let roomba of roombas) {
    // Update the velocities according to each rule
    keepWithinBounds(roomba);

    // Update the position based on the current velocity
    roomba.x += roomba.dx;
    roomba.y += roomba.dy;
    roomba.speed = Math.abs(Math.sqrt(roomba.dx**2 + roomba.dy**2));
    roomba.theta = (roomba.dy === 0 && roomba.dx === 0) ? newTheta : Math.atan2(roomba.dy, roomba.dx);
    roomba.history.push([roomba.x, roomba.y]);
    // TODO: removing this line enables the trail to indicate which spots the roomba has passed over. However, it is incredibly inefficient, and causes lag long term. Determine a better way.
    // roomba.history = roomba.history.slice(-100);
  }

  // Clear the canvas and redraw all the roombas in their current positions
  const ctx = document.getElementById("roomba").getContext("2d");
  ctx.globalCompositeOperation = "source-over";
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
