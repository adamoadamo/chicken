let duckColor = '#FFFFFF';
let duckX = 400;
let duckY = 400;
let beakColor = '#F4A500'; // Orange
let eyeOpen = true; // State for the eye (open/closed)
let headTurnAngle = 0; // Head rotation angle
let turnTimer = 0; // Timer for head turn
let turnInterval; // Random interval for head turning
let turnDirection = 0; // Direction of the head (left/right/neutral)
let blinkTimer = 0; // Timer for blinking
let blinkInterval; // Random interval for blinking
let moveSpeed = 6;  // Slightly faster movement speed
let appleColor = '#FF0000';     // Red
let stemColor = '#4B2F1C';      // Brown
let leafColor = '#228B22';      // Forest Green
let appleX;
let appleY;
let historyFont;
let score = 0;
let duckSize = 1; // Scale multiplier for duck

function preload() {
  historyFont = loadFont('m3x6.ttf');
}

function setup() {
  createCanvas(800, 800);
  noSmooth();
  noStroke();
  frameRate(30);

  // Initialize blink and turn intervals
  blinkInterval = random(60, 180);
  turnInterval = random(120, 240);
  
  // Set random position for apple
  // Keep apple away from edges by staying 100px within border
  appleX = random(100, width - 100);
  appleY = random(100, height - 100);
}

function draw() {
  background('#3CB371'); // Green background
  
  // Handle WASD movement
  if (keyIsDown(87)) { // W key
    duckY -= moveSpeed;
  }
  if (keyIsDown(83)) { // S key
    duckY += moveSpeed;
  }
  if (keyIsDown(65)) { // A key
    duckX -= moveSpeed;
  }
  if (keyIsDown(68)) { // D key
    duckX += moveSpeed;
  }

  // Draw the duck at its current position
  drawDuck(duckX, duckY);

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

  drawApple(appleX, appleY);  // Draw apple at random position

  // Check for collision
  checkCollision();
  
  // Draw score
  textFont(historyFont);
  textSize(200);  // Doubled size
  textAlign(LEFT, TOP);
  fill(0);
  text(score, 20, -30);  // Moved Y position from 20 to -30
}

function drawDuck(x, y) {
  fill(duckColor);

  // Body (scaled with size)
  rect(x - (25 * duckSize), y - (50 * duckSize), 50 * duckSize, 50 * duckSize); // Main body
  rect(x - (38 * duckSize), y - (38 * duckSize), 25 * duckSize, 25 * duckSize); // Left wing
  rect(x + (12 * duckSize), y - (38 * duckSize), 25 * duckSize, 25 * duckSize); // Right wing

  // Head (scaled with size)
  rect(x - (12.5 * duckSize), y - (75 * duckSize), 25 * duckSize, 25 * duckSize); // Head

  // Eye and Beak
  if (turnDirection <= 0) {  // Looking left or center
    // Eye
    fill(0);
    if (eyeOpen) {
      rect(x - (7.5 * duckSize), y - (67.5 * duckSize), 5 * duckSize, 5 * duckSize);
    } else {
      rect(x - (7.5 * duckSize), y - (62.5 * duckSize), 5 * duckSize, 2.5 * duckSize);
    }
    // Beak
    fill(beakColor);
    rect(x - (12.5 * duckSize), y - (67.5 * duckSize), 12.5 * duckSize, 7.5 * duckSize);
  } else {  // Looking right
    // Eye
    fill(0);
    if (eyeOpen) {
      rect(x + (2.5 * duckSize), y - (67.5 * duckSize), 5 * duckSize, 5 * duckSize);
    } else {
      rect(x + (2.5 * duckSize), y - (62.5 * duckSize), 5 * duckSize, 2.5 * duckSize);
    }
    // Beak
    fill(beakColor);
    rect(x, y - (67.5 * duckSize), 12.5 * duckSize, 7.5 * duckSize);
  }

  // Legs (unchanged size)
  fill(0);
  rect(x - 17.5, y, 7.5, 12.5);
  rect(x + 10, y, 7.5, 12.5);
}

function drawApple(x, y) {
  // Main apple body
  fill(appleColor);
  rect(x - 25, y - 25, 50, 50);        // Center square
  rect(x - 12.5, y - 37.5, 25, 12.5);  // Top middle
  rect(x - 37.5, y - 12.5, 12.5, 25);  // Left middle
  rect(x + 25, y - 12.5, 12.5, 25);    // Right middle
  
  // Stem
  fill(stemColor);
  rect(x - 6.25, y - 50, 12.5, 12.5);
  
  // Leaf
  fill(leafColor);
  rect(x + 6.25, y - 50, 12.5, 12.5);
}

function keyPressed() {
  // This empty function ensures p5.js is listening for keyboard events
  return false; // Prevents default browser behaviors
}

function checkCollision() {
  let d = dist(duckX, duckY - 25, appleX, appleY);
  if (d < 75) {
    score++;
    duckSize += 0.25; // Increase by 25% which matches our pixel scale of 12.5
    appleX = random(100, width - 100);
    appleY = random(100, height - 100);
  }
}
