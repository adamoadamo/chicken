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
let pigeonX = -50;
let pigeonY = -50;
let pigeonActive = false;
let pigeonSpeed = 3;
let pigeonDirection = 0; // -1 left, 0 center, 1 right
let currentDialog = null;
let dialogTimer = 0;
let dialogDuration = 90; // 3 seconds at 30 fps
let dialogChoices = [];
let selectedChoice = 0;
let playerCanMove = true;

const DIALOG = {
  pigeon: {
    greetings: [
      "There are so many apples. I'm so hungry."
    ],
    choices: {
      question1: {
        prompt: "There are so many apples. I'm so hungry.",
        options: [
          "You can have some of mine!",
          "These are MY apples!"
        ],
        responses: {
          friendly: "You're so kind! Let's share them.",
          unfriendly: "How rude! I'll remember this..."
        }
      }
    }
  },
  duck: {
    collecting: [
      "Yum!",
      "Another one!",
      "Delicious!"
    ]
  }
};

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
  background('#3CB371');
  
  // Handle movement
  if (playerCanMove) {
    if (keyIsDown(LEFT_ARROW)) {
      velocityX -= acceleration;
      turnDirection = -1;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      velocityX += acceleration;
      turnDirection = 1;
    }
    if (keyIsDown(UP_ARROW)) {
      velocityY -= acceleration;
    }
    if (keyIsDown(DOWN_ARROW)) {
      velocityY += acceleration;
    }
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

  // Draw game elements
  apples.forEach(apple => {
    drawAppleShadow(apple.x, apple.y);
    drawApple(apple.x, apple.y);
  });
  
  drawShadow(duckX, duckY, duckSize);
  drawDuck(duckX, duckY + jumpHeight);

  // Handle pigeon
  handlePigeon();
  
  // Draw score last (on top of everything)
  textFont(historyFont);
  textSize(100);
  textAlign(LEFT, TOP);
  fill(0);
  text(score, 20, -10);

  // Handle dialog display
  if (currentDialog && dialogTimer > 0) {
    drawDialog(pigeonX, pigeonY, currentDialog);
    dialogTimer--;
    if (dialogTimer <= 0) {
      currentDialog = null;
    }
  }
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
  if (dialogChoices.length > 0) {
    if (keyCode === LEFT_ARROW) {
      selectedChoice = 0;
    } else if (keyCode === RIGHT_ARROW) {
      selectedChoice = 1;
    } else if (keyCode === 88) { // X key
      let response = selectedChoice === 0 ? 'friendly' : 'unfriendly';
      currentDialog = DIALOG.pigeon.choices.question1.responses[response];
      dialogChoices = [];
      dialogTimer = dialogDuration;
      setTimeout(() => {
        playerCanMove = true;
        currentDialog = null;
      }, dialogDuration * 33); // Convert frames to ms
    }
    return false;
  }
  
  if (keyCode === 88 && currentDialog) {
    dialogTimer = 0;
    currentDialog = null;
  }
  return false;
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
  if (keyIsDown(90) && !isJumping) { // 90 is Z key (was 32 for spacebar)
    isJumping = true;
    jumpVelocity = jumpForce;
    wingPixelOffset = -25;
  }
  
  if (isJumping) {
    jumpHeight += jumpVelocity;
    jumpVelocity += gravity;
    wingPixelOffset = lerp(wingPixelOffset, 0, 0.1);
    
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

function drawPigeon(x, y) {
  fill('#808080'); // Gray base color
  
  // Body (same size as duck)
  rect(x - (25 * duckSize), y - (50 * duckSize), 50 * duckSize, 50 * duckSize);
  
  // Wings (slightly different shape than duck)
  rect(x - (37.5 * duckSize), y - (43.75 * duckSize), 31.25 * duckSize, 31.25 * duckSize); // Left wing
  rect(x + (6.25 * duckSize), y - (43.75 * duckSize), 31.25 * duckSize, 31.25 * duckSize); // Right wing
  
  // Neck (shorter than duck)
  rect(x - (12.5 * duckSize), y - (62.5 * duckSize), 25 * duckSize, 12.5 * duckSize);
  
  // Head (rounder than duck)
  rect(x - (18.75 * duckSize), y - (75 * duckSize), 37.5 * duckSize, 18.75 * duckSize);
  
  // Eye and Beak
  if (turnDirection <= 0) {  // Looking left or center
    // Beak (smaller than duck)
    fill('#000000'); // Black beak
    rect(x - (12.5 * duckSize), y - (68.75 * duckSize), 6.25 * duckSize, 6.25 * duckSize);
    // Eye
    fill('#FF0000'); // Red eye
    rect(x, y - (68.75 * duckSize), 6.25 * duckSize, 6.25 * duckSize);
  } else {  // Looking right
    // Beak
    fill('#000000');
    rect(x + (6.25 * duckSize), y - (68.75 * duckSize), 6.25 * duckSize, 6.25 * duckSize);
    // Eye
    fill('#FF0000');
    rect(x - (6.25 * duckSize), y - (68.75 * duckSize), 6.25 * duckSize, 6.25 * duckSize);
  }
  
  // Neck pattern (characteristic pigeon iridescence)
  fill('#4B0082'); // Indigo
  rect(x - (6.25 * duckSize), y - (62.5 * duckSize), 12.5 * duckSize, 6.25 * duckSize);
  
  // Legs (thinner than duck)
  fill('#FF6B6B'); // Pink legs
  rect(x - 12.5, y, 6.25, 12.5);
  rect(x + 6.25, y, 6.25, 12.5);
}

function handlePigeon() {
  if (score === 5 && !pigeonActive) {
    pigeonActive = true;
    // Choose random side to enter from
    let side = floor(random(4));
    switch(side) {
      case 0: // top
        pigeonX = random(width);
        pigeonY = -50;
        break;
      case 1: // right
        pigeonX = width + 50;
        pigeonY = random(height);
        break;
      case 2: // bottom
        pigeonX = random(width);
        pigeonY = height + 50;
        break;
      case 3: // left
        pigeonX = -50;
        pigeonY = random(height);
        break;
    }
  }
  
  if (pigeonActive) {
    let dx = duckX - pigeonX;
    let dy = duckY - pigeonY;
    let dist = sqrt(dx * dx + dy * dy);
    
    if (dist > 75 && playerCanMove) {
      pigeonX += (dx / dist) * pigeonSpeed;
      pigeonY += (dy / dist) * pigeonSpeed;
      pigeonDirection = dx > 0 ? 1 : -1;
    } else if (!currentDialog) {
      playerCanMove = false;
      currentDialog = DIALOG.pigeon.choices.question1;
      dialogChoices = currentDialog.options;
      dialogTimer = dialogDuration;
    }
    
    drawShadow(pigeonX, pigeonY, 1);
    drawPigeon(pigeonX, pigeonY);
  }
}

function getRandomDialog(character, category) {
  const options = DIALOG[character][category];
  return options[Math.floor(Math.random() * options.length)];
}

function drawDialog(x, y, dialogText, choices = null) {
  push();
  textFont(historyFont);
  textSize(100);
  textAlign(CENTER);
  
  // Position at bottom of screen with padding
  let padding = 50;
  let dialogY = height - 150;
  
  // Draw background rectangle with rounded corners
  fill(255);
  rect(padding, dialogY - 80, width - (padding * 2), 120, 12.5);
  
  // Draw text
  fill(0);
  text(dialogText, width/2, dialogY);
  
  // Draw choices if they exist
  if (choices) {
    choices.forEach((choice, i) => {
      let choiceY = dialogY + 80;
      let choiceX = width/2 + (i === 0 ? -200 : 200);
      
      // Draw choice background
      fill(i === selectedChoice ? '#E0E0E0' : '#FFFFFF');
      rect(choiceX - 150, choiceY - 40, 300, 80, 12.5);
      
      // Draw choice text
      fill(0);
      text(choice, choiceX, choiceY);
    });
  }
  
  pop();
}