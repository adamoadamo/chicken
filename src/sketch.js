import DIALOG from './dialog.js';
import Pigeon from './entities/Pigeon.js';
let duckColor = '#FFFFFF';
let duckX = 400;
let duckY = 400;
let beakColor = '#F4A500'; // Orange
let headTurnAngle = 0; // Head rotation angle
let turnTimer = 0; // Timer for head turn
let turnInterval; // Random interval for head turning
let turnDirection = 0; // Direction of the head (left/right/neutral)
let moveSpeed = 6;  // Slightly faster movement speed
let appleColor = '#FF0000';     // Red
let stemColor = '#4B2F1C';      // Brown
let leafColor = '#228B22';      // Forest Green
let appleX;
let appleY;
let historyFont;
let score = 0;
let duckSize = 1; // Scale multiplier for duck
let isJumping = false;
let jumpVelocity = 0;
let jumpHeight = 0;
let gravity = 0.5;
let jumpForce = -12;
let wingPixelOffset = 0;
let velocityX = 0;
let velocityY = 0;
let acceleration = 1.2;
let friction = 0.9;
let maxSpeed = 12;
let apples = [{x: 400, y: 400}]; // Start with one apple
let maxApples = 1;               // Will increase as score goes up
let grassBlades = [];
let windAngle = 0;
let windSpeed = 0.01;
let grassHeight = 25; // Half of duck height (50)
let grassColors = ['#2E8B57'];
let pigeon = new Pigeon();

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

  // Initialize grass blades with random spacing (reduced density)
  for (let y = 0; y < height; y += 50) {
    for (let x = 0; x < width + 6.25; x += 37.5) {
      if (random() < 0.35) { // Reduced chance from 0.7 to 0.35
        grassBlades.push(new GrassBlade(x, y));
      }
    }
  }
}

function draw() {
  background('#3CB371');
  
  // Handle movement
  if (keyIsDown(65)) { // A key
    velocityX -= acceleration;
    turnDirection = -1;
  }
  if (keyIsDown(68)) { // D key
    velocityX += acceleration;
    turnDirection = 1;
  }
  if (keyIsDown(87)) { // W key
    velocityY -= acceleration;
  }
  if (keyIsDown(83)) { // S key
    velocityY += acceleration;
  }

  // Apply friction and limit speed
  velocityX *= friction;
  velocityY *= friction;
  velocityX = constrain(velocityX, -maxSpeed, maxSpeed);
  velocityY = constrain(velocityY, -maxSpeed, maxSpeed);

  // Update position
  duckX += velocityX;
  duckY += velocityY;

  // Keep duck within canvas
  duckX = constrain(duckX, 50, width - 50);
  duckY = constrain(duckY, 50, height - 50);

  // Handle jumping
  handleJump();
  
  // Check for apple collection
  checkCollision();

  // Draw ALL grass first
  windAngle += windSpeed;
  grassBlades.forEach(blade => {
    if (!blade.isInFrontOfDuck(duckX, duckY)) {
      blade.draw();
    }
  });

  // Draw game elements
  apples.forEach(apple => {
    drawAppleShadow(apple.x, apple.y);
    
    // Draw background grass for this apple
    grassBlades.forEach(blade => {
      if (!blade.isInFrontOfApple(apple.x, apple.y) && !blade.isInFrontOfDuck(duckX, duckY)) {
        blade.draw();
      }
    });
    
    drawApple(apple.x, apple.y);
    
    // Draw foreground grass for this apple
    grassBlades.forEach(blade => {
      if (blade.isInFrontOfApple(apple.x, apple.y)) {
        blade.draw();
      }
    });
  });
  
  drawShadow(duckX, duckY, duckSize);
  drawDuck(duckX, duckY + jumpHeight);
  
  // Draw foreground grass for duck
  grassBlades.forEach(blade => {
    if (blade.isInFrontOfDuck(duckX, duckY)) {
      blade.draw();
    }
  });

  // Handle pigeon
  pigeon.update(duckX, duckY, score);
  pigeon.draw();

  if (pigeon.showDialog) {
    textFont(historyFont);
    textSize(50);
    textAlign(CENTER, BOTTOM);
    fill(0);
    text(DIALOG.pigeon.greeting, width/2, height - 50);
  }

  // Draw score last (on top of everything)
  textFont(historyFont);
  textSize(200);
  textAlign(LEFT, TOP);
  fill(0);
  text(score, 20, -30);
}

function drawDuck(x, y) {
  fill(duckColor);

  // Body (scaled with size)
  rect(x - (25 * duckSize), y - (50 * duckSize), 50 * duckSize, 50 * duckSize); // Main body

  // Original wings
  rect(x - (37.5 * duckSize), y - (37.5 * duckSize), 25 * duckSize, 25 * duckSize); // Left wing
  rect(x + (12.5 * duckSize), y - (37.5 * duckSize), 25 * duckSize, 25 * duckSize); // Right wing

  // Only draw floating wing pixels when jumping
  if (isJumping) {
    // Floating wing pixels
    rect(x - (50 * duckSize), y - (37.5 * duckSize) + wingPixelOffset, 12.5 * duckSize, 12.5 * duckSize); // Left floating pixel
    rect(x + (37.5 * duckSize), y - (37.5 * duckSize) + wingPixelOffset, 12.5 * duckSize, 12.5 * duckSize); // Right floating pixel
  }

  // Head (scaled with size)
  rect(x - (12.5 * duckSize), y - (75 * duckSize), 25 * duckSize, 25 * duckSize); // Head

  // Eye and Beak
  if (turnDirection <= 0) {  // Looking left or center
    // Beak first
    fill(beakColor);
    rect(x - (12.5 * duckSize), y - (62.5 * duckSize), 12.5 * duckSize, 6.25 * duckSize);
    // Eye to the right of beak
    fill(0);
    rect(x, y - (68.75 * duckSize), 6.25 * duckSize, 6.25 * duckSize);
  } else {  // Looking right
    // Beak first
    fill(beakColor);
    rect(x, y - (62.5 * duckSize), 12.5 * duckSize, 6.25 * duckSize);
    // Eye to the left of beak
    fill(0);
    rect(x - (6.25 * duckSize), y - (68.75 * duckSize), 6.25 * duckSize, 6.25 * duckSize);
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
  // Only check collisions if not jumping
  if (!isJumping) {
    for (let i = apples.length - 1; i >= 0; i--) {
      let d = dist(duckX, duckY - 25, apples[i].x, apples[i].y);
      if (d < 75) {
        score++;
        apples.splice(i, 1);
        
        maxApples = 1 + Math.floor(score / 5);
        
        while (apples.length < maxApples) {
          apples.push({
            x: random(100, width - 100),
            y: random(100, height - 100)
          });
        }
      }
    }
  }
}

function handleJump() {
  if (keyIsDown(32) && !isJumping) { // 32 is spacebar
    isJumping = true;
    jumpVelocity = jumpForce;
    wingPixelOffset = -25; // Move wing pixel up when jump starts
  }
  
  if (isJumping) {
    jumpHeight += jumpVelocity;
    jumpVelocity += gravity;
    wingPixelOffset = lerp(wingPixelOffset, 0, 0.1); // Smoothly return wing pixel
    
    // Check if landed
    if (jumpHeight >= 0) {
      jumpHeight = 0;
      jumpVelocity = 0;
      isJumping = false;
      wingPixelOffset = 0;
    }
  }
}

function drawShadow(x, y, size) {
  fill(0, 0, 0, 50); // Semi-transparent black
  let shadowSize = max(map(jumpHeight, -100, 0, 0.5, 1), 0.5); // Shadow never smaller than half size
  rect(x - (25 * size), y + 5, 50 * size * shadowSize, max(12.5 * shadowSize, 6.25));
}

function drawAppleShadow(x, y) {
  fill(0, 0, 0, 50); // Semi-transparent black
  rect(x - 25, y + 12.5, 50, 12.5); // Base shadow
  rect(x - 12.5, y + 6.25, 25, 6.25); // Top shadow
}

class GrassBlade {
  constructor(x, y) {
    this.x = x + random(-6.25, 6.25);
    this.baseY = y + random(-12.5, 12.5);
    this.height = random([12.5, 18.75, 25, 31.25]);
    this.width = 6.25;
    this.color = '#2E8B57';
  }
  
  draw() {
    fill(this.color);
    // Draw main grass blade
    rect(this.x, this.baseY, this.width, this.height - 6.25);
    
    // Simple 8-bit style movement
    let offset = round(cos(windAngle)) * 6.25;
    rect(this.x + offset, this.baseY, this.width, 6.25);
  }

  isInFrontOfDuck(duckX, duckY) {
    return (
      Math.abs(this.x - duckX) < 18.75 &&
      this.baseY > duckY - 6.25 &&
      this.baseY < duckY + 18.75
    );
  }

  isInFrontOfApple(appleX, appleY) {
    return (
      Math.abs(this.x - appleX) < 18.75 &&
      this.baseY > appleY - 6.25 &&
      this.baseY < appleY + 18.75
    );
  }
}
