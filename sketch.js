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
  appleY = random(100, height - 100);aw
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
  textSize(96);  // Doubled size
  textAlign(LEFT, TOP);
  fill(0);
  text(score, 20, 20);  // Just the number
}

function drawDuck(x, y) {
  fill(duckColor);

  // Body (doubled in size)
  rect(x - 25, y - 50, 50, 50); // Main body
  rect(x - 38, y - 38, 25, 25); // Left wing
  rect(x + 12, y - 38, 25, 25); // Right wing

  // Head
  rect(x - 12.5, y - 75, 25, 25); // Head

  // Eye and Beak
  if (turnDirection <= 0) {  // Looking left or center
    // Eye
    fill(0);
    if (eyeOpen) {
      rect(x - 7.5, y - 67.5, 5, 5);
    } else {
      rect(x - 7.5, y - 62.5, 5, 2.5);
    }
    // Beak
    fill(beakColor);
    rect(x - 12.5, y - 67.5, 12.5, 7.5);
  } else {  // Looking right
    // Eye
    fill(0);
    if (eyeOpen) {
      rect(x + 2.5, y - 67.5, 5, 5);
    } else {
      rect(x + 2.5, y - 62.5, 5, 2.5);
    }
    // Beak
    fill(beakColor);
    rect(x, y - 67.5, 12.5, 7.5);
  }

  // Legs
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
  // Calculate the distance between duck and apple centers
  let d = dist(duckX, duckY - 25, appleX, appleY);
  // If distance is less than their combined radii (using 50 as approximate size)
  if (d < 75) {
    // Increase score
    score++;
    // Move apple to new random position
    appleX = random(100, width - 100);
    appleY = random(100, height - 100);
  }
}
