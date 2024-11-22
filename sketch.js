let chickenColor = '#FFFFFF'; // White
let beakColor = '#F4A500'; // Orange
let eyeOpen = true; // State for the eye (open/closed)
let headTurnAngle = 0; // Head rotation angle
let turnTimer = 0; // Timer for head turn
let turnInterval; // Random interval for head turning
let turnDirection = 0; // Direction of the head (left/right/neutral)
let blinkTimer = 0; // Timer for blinking
let blinkInterval; // Random interval for blinking
let chickenX = 300; // Chicken's X position
let chickenY = 300; // Chicken's Y position
let moveSpeed = 5;  // Movement speed

function setup() {
  createCanvas(600, 600);
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

  // Body
  rect(x - 10, y - 20, 20, 20); // Main body
  rect(x - 15, y - 15, 10, 10); // Left wing
  rect(x + 5, y - 15, 10, 10); // Right wing

  // Head (now properly attached to body)
  push();
  translate(x, y - 20); // Move to top of body
  rotate(radians(headTurnAngle));
  rect(-5, -10, 10, 10); // Head

  // Eye
  fill(0);
  if (eyeOpen) {
    rect(-3, -7, 2, 2);
  } else {
    rect(-3, -5, 2, 1);
  }

  // Beak
  fill(beakColor);
  rect(0, -7, 5, 3);
  pop();

  // Legs
  fill(0);
  rect(x - 7, y, 3, 5);
  rect(x + 4, y, 3, 5);
}
