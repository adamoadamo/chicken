let chickenColor = '#FFFFFF'; // White
let beakColor = '#F4A500'; // Orange
let eyeOpen = true; // State for the eye (open/closed)
let headTurnAngle = 0; // Head rotation angle
let turnTimer = 0; // Timer for head turn
let turnInterval; // Random interval for head turning
let turnDirection = 0; // Direction of the head (left/right/neutral)
let blinkTimer = 0; // Timer for blinking
let blinkInterval; // Random interval for blinking

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

  // Draw the chicken
  drawChicken(300, 300);

  // Blinking logic
  blinkTimer++;
  if (blinkTimer >= blinkInterval) {
    eyeOpen = !eyeOpen; // Toggle eye state
    blinkTimer = 0; // Reset timer
    blinkInterval = random(60, 180); // New random interval
  }

  // Head turning logic
  turnTimer++;
  if (turnTimer >= turnInterval) {
    // Choose a new random head turn direction (-1 = left, 1 = right, 0 = center)
    turnDirection = floor(random(-1, 2)); 
    turnTimer = 0; // Reset timer
    turnInterval = random(120, 240); // New random interval
  }

  // Update head rotation angle
  headTurnAngle = turnDirection * 10; // Rotate ±10 degrees
}

function drawChicken(x, y) {
  fill(chickenColor);

  // Body
  rect(x - 10, y - 20, 20, 20); // Main body
  rect(x - 15, y - 15, 10, 10); // Left wing
  rect(x + 5, y - 15, 10, 10); // Right wing

  // Head
  push(); // Save the current transformation state
  translate(x, y - 25); // Move to the neck position
  rotate(radians(headTurnAngle)); // Rotate the head around the neck
  rect(-5, -15, 10, 10); // Draw the head

  // Eye
  fill(0); // Black for eye
  if (eyeOpen) {
    rect(-3, -12, 2, 2); // Open eye
  } else {
    rect(-3, -10, 2, 1); // Closed eye
  }

  // Beak
  fill(beakColor);
  rect(0, -12, 5, 3); // Beak
  pop(); // Restore the transformation state

  // Legs
  fill(0); // Black legs
  rect(x - 7, y, 3, 5);
  rect(x + 4, y, 3, 5);
}
