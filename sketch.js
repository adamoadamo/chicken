let chickenColor = '#FFFFFF'; // White
let beakColor = '#F4A500'; // Orange
let eyeOpen = true; // State for the eye (open/closed)
let headTurnAngle = 0; // Head rotation angle
let turnTimer = 0; // Timer for head turn
let turnInterval; // Random interval for head turning
let turnDirection = 0; // Direction of the head (left/right/neutral)
let blinkTimer = 0; // Timer for blinking
let blinkInterval; // Random interval for blinking
let chickenX = 400; // Center of 800x800 canvas
let chickenY = 400; // Center of 800x800 canvas
let moveSpeed = 6;  // Slightly faster movement speed

function setup() {
  createCanvas(800, 800);
  noSmooth();
  noStroke();
  frameRate(30);

  // Initialize blink and turn intervals
  blinkInterval = random(60, 180);
  turnInterval = random(120, 240);
}

function draw() {
  background('#3CB371'); // Green background
  
  // Handle WASD movement
  if (keyIsDown(87)) { // W key
    chickenY -= moveSpeed;
  }
  if (keyIsDown(83)) { // S key
    chickenY += moveSpeed;
  }
  if (keyIsDown(65)) { // A key
    chickenX -= moveSpeed;
  }
  if (keyIsDown(68)) { // D key
    chickenX += moveSpeed;
  }

  // Draw the chicken at its current position
  drawChicken(chickenX, chickenY);

  // Blinking logic
  blinkTimer++;
  if (blinkTimer >= blinkInterval) {
    eyeOpen = !eyeOpen;
    blinkTimer = 0;
    blinkInterval = random(60, 180);
  }

  // Head turning logic
  turnTimer++;
  if (turnTimer >= turnInterval) {
    turnDirection = floor(random(-1, 2));
    turnTimer = 0;
    turnInterval = random(120, 240);
  }

  // Update head rotation angle
  headTurnAngle = turnDirection * 10;
}

function drawChicken(x, y) {
  fill(chickenColor);

  // Body (doubled in size)
  rect(x - 25, y - 50, 50, 50); // Main body
  rect(x - 38, y - 38, 25, 25); // Left wing
  rect(x + 12, y - 38, 25, 25); // Right wing

  // Head
  push();
  translate(x, y - 50); // Move to top of body
  rotate(radians(headTurnAngle));
  rect(-12.5, -25, 25, 25); // Head

  // Eye
  fill(0);
  if (eyeOpen) {
    rect(-7.5, -17.5, 5, 5);
  } else {
    rect(-7.5, -12.5, 5, 2.5);
  }

  // Beak
  fill(beakColor);
  rect(0, -17.5, 12.5, 7.5);
  pop();

  // Legs
  fill(0);
  rect(x - 17.5, y, 7.5, 12.5);
  rect(x + 10, y, 7.5, 12.5);
}

function keyPressed() {
  // This empty function ensures p5.js is listening for keyboard events
  return false; // Prevents default browser behaviors
}
