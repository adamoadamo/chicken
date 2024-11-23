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
let dialogState = {
  current: 'none', // none, greeting, choices, response
  sequence: ['greeting', 'choices', 'response']
};
let currentDialogIndex = 0;
let pigeonFollowing = false;
let pigeonHasSpoken = false;
let seeds = []; // Array to store seeds with their growth state
const SEED_CHANCE = 0.1; // 10% chance
const SPROUT_TIME = 450; // 15 seconds at 30fps
const GROWTH_TIME = 900; // 30 seconds at 30fps

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
  
  // Draw seeds
  seeds.forEach(seed => {
    seed.age++;
    if (seed.age >= GROWTH_TIME && seed.stage < 2) {
      seed.stage = 2;
    } else if (seed.age >= SPROUT_TIME && seed.stage < 1) {
      seed.stage = 1;
    }
    drawSeed(seed);
  });
  
  // Draw characters in order based on Y position
  if (pigeonActive) {
    let duckDrawY = duckY + jumpHeight;
    let duckFeetY = duckDrawY;
    let pigeonFeetY = pigeonY;
    
    if (duckFeetY < pigeonFeetY) {
      // Duck is behind pigeon
      drawShadow(duckX, duckY, duckSize);
      drawDuck(duckX, duckDrawY);
      drawPigeonShadow(pigeonX, pigeonY);
      drawPigeon(pigeonX, pigeonY);
    } else {
      // Pigeon is behind duck
      drawPigeonShadow(pigeonX, pigeonY);
      drawPigeon(pigeonX, pigeonY);
      drawShadow(duckX, duckY, duckSize);
      drawDuck(duckX, duckDrawY);
    }
  } else {
    drawShadow(duckX, duckY, duckSize);
    drawDuck(duckX, duckY + jumpHeight);
  }

  // Update pigeon position
  handlePigeon();

  // Draw score last (on top of everything)
  textFont(historyFont);
  textSize(100);
  textAlign(LEFT, TOP);
  fill(0);
  text(score, 20, -10);

  // Handle dialog display
  if (dialogState.current !== 'none') {
    if (currentDialog) {
      drawDialog(pigeonX, pigeonY, currentDialog);
    } else if (dialogState.current === 'choices') {
      drawChoices();
    }
  }

  // Add this at the start of the draw function (around line 95)
  if (score >= 5) {
    console.log("Score >= 5, pigeonActive:", pigeonActive);
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
  if (dialogState.current === 'choices') {
    if (keyCode === UP_ARROW) {
      selectedChoice = (selectedChoice - 1 + dialogChoices.length) % dialogChoices.length;
      return false;
    } else if (keyCode === DOWN_ARROW) {
      selectedChoice = (selectedChoice + 1) % dialogChoices.length;
      return false;
    } else if (keyCode === 88) { // X key
      let response = selectedChoice === 0 ? 'friendly' : 'unfriendly';
      dialogState.current = 'response';
      currentDialog = [DIALOG.pigeon.choices.question1.responses[response]];
      dialogChoices = [];
      dialogTimer = dialogDuration;
      currentDialogIndex = 0;
      return false;
    }
  } else if (currentDialog) {
    if (keyCode === 88) { // X key
      switch(dialogState.current) {
        case 'greeting':
          dialogState.current = 'choices';
          dialogChoices = DIALOG.pigeon.choices.question1.options;
          currentDialogIndex = 0;
          currentDialog = null;
          selectedChoice = 0; // Reset selection
          break;
        case 'response':
          currentDialog = null;
          dialogState.current = 'none';
          playerCanMove = true;
          pigeonFollowing = selectedChoice === 0;
          pigeonHasSpoken = true;
          break;
      }
    }
    return false;
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
        
        // Check if duck should poop a seed
        if (random() < SEED_CHANCE) {
          seeds.push({
            x: duckX,
            y: duckY + 12.5,
            age: 0,
            stage: 0 // 0: seed, 1: sprout, 2: grown
          });
        }
        
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
  if (score >= 5 && !pigeonActive) {
    pigeonActive = true;
    pigeonDirection = 0;
    let side = floor(random(4));
    switch(side) {
      case 0: // top
        pigeonX = random(width);
        pigeonY = -50;
        break;
      case 1: // right
        pigeonX = width + 50;
        pigeonY = random(height);
        pigeonDirection = -1;
        break;
      case 2: // bottom
        pigeonX = random(width);
        pigeonY = height + 50;
        break;
      case 3: // left
        pigeonX = -50;
        pigeonY = random(height);
        pigeonDirection = 1;
        break;
    }
  }
  
  if (pigeonActive) {
    if (!pigeonHasSpoken) {
      // Move towards duck for initial conversation
      let dx = duckX - pigeonX;
      let dy = duckY - pigeonY;
      let d = sqrt(dx * dx + dy * dy);
      
      if (d > 75) {
        // Update direction based on movement
        if (dx !== 0) {
          pigeonDirection = dx > 0 ? 1 : -1;
        }
        // Move towards duck
        pigeonX += (dx / d) * pigeonSpeed;
        pigeonY += (dy / d) * pigeonSpeed;
      } else if (!currentDialog && dialogState.current === 'none') {
        // Start conversation when close enough
        playerCanMove = false;
        dialogState.current = 'greeting';
        currentDialog = [getRandomDialog('pigeon', 'greetings')];
        dialogTimer = dialogDuration;
        currentDialogIndex = 0;
      }
    } else if (pigeonFollowing) {
      // Find and eat apples if friendly response
      let closestApple = null;
      let closestDist = Infinity;
      
      apples.forEach(apple => {
        let d = dist(pigeonX, pigeonY, apple.x, apple.y);
        if (d < closestDist) {
          closestDist = d;
          closestApple = apple;
        }
      });
      
      if (closestApple) {
        let dx = closestApple.x - pigeonX;
        let dy = closestApple.y - pigeonY;
        let d = sqrt(dx * dx + dy * dy);
        
        if (dx !== 0) {
          pigeonDirection = dx > 0 ? 1 : -1;
        }
        
        pigeonX += (dx / d) * pigeonSpeed;
        pigeonY += (dy / d) * pigeonSpeed;
        
        if (d < 75) {
          let index = apples.indexOf(closestApple);
          if (index > -1) {
            apples.splice(index, 1);
            
            if (random() < SEED_CHANCE) {
              seeds.push({
                x: pigeonX,
                y: pigeonY + 12.5,
                age: 0,
                stage: 0
              });
            }
            
            while (apples.length < maxApples) {
              apples.push({
                x: random(100, width - 100),
                y: random(100, height - 100)
              });
            }
          }
        }
      }
    } else if (pigeonHasSpoken) {
      // Fly away if unfriendly response
      let targetX = pigeonX < width/2 ? -100 : width + 100;
      let targetY = -100;
      let dx = targetX - pigeonX;
      let dy = targetY - pigeonY;
      let d = sqrt(dx * dx + dy * dy);
      
      pigeonX += (dx / d) * pigeonSpeed;
      pigeonY += (dy / d) * pigeonSpeed;
      
      // Remove pigeon when off screen
      if (pigeonY < -100 || pigeonX < -100 || pigeonX > width + 100) {
        pigeonActive = false;
      }
    }
    
    // Keep pigeon within bounds while active
    if (pigeonFollowing) {
      pigeonX = constrain(pigeonX, 50, width - 50);
      pigeonY = constrain(pigeonY, 50, height - 50);
    }
  }
}

function getRandomDialog(character, category) {
  const options = DIALOG[character][category];
  return options[Math.floor(Math.random() * options.length)];
}

function drawDialog(x, y, dialogText) {
  push();
  textFont(historyFont);
  textSize(100);
  textAlign(CENTER);

  // Calculate text wrapping and positioning
  let padding = 50;
  let maxWidth = width - (padding * 2);
  let words = dialogText[currentDialogIndex].split(' ');
  let line = '';
  let lines = [];

  for (let word of words) {
    let testLine = line + word + ' ';
    if (textWidth(testLine) > maxWidth) {
      lines.push(line);
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // Draw text centered in the window
  fill(0);
  let lineHeight = 80;
  let startY = height / 2 - (lines.length * lineHeight) / 2 + lineHeight;

  lines.forEach((line, i) => {
    text(line.trim(), width / 2, startY + (i * lineHeight));
  });

  pop();
}

function drawChoices() {
  push();
  textFont(historyFont);
  textSize(100);
  textAlign(CENTER);

  let padding = 50;
  let choiceYStart = height / 2 + 100; // Start position for choices

  dialogChoices.forEach((choice, i) => {
    let choiceX = width / 2;
    let choiceY = choiceYStart + i * 120; // Stack choices vertically with spacing

    // Change text color if selected
    fill(i === selectedChoice ? '#E0E0E0' : '#000000');
    text(choice, choiceX, choiceY);
  });

  pop();
}

function drawPigeonShadow(x, y) {
  fill(0, 0, 0, 50); // Semi-transparent black
  rect(x - (25 * duckSize), y + 5, 50 * duckSize, 12.5);
}

function drawSeed(seed) {
  switch(seed.stage) {
    case 0: // Basic seed
      fill('#4B2F1C'); // Brown color
      rect(seed.x - 6.25, seed.y - 6.25, 12.5, 12.5);
      break;
      
    case 1: // First sprout
      // Seed
      fill('#4B2F1C');
      rect(seed.x - 6.25, seed.y - 6.25, 12.5, 12.5);
      // Stem
      fill('#228B22'); // Forest Green (same as leaf color)
      rect(seed.x - 3.125, seed.y - 18.75, 6.25, 12.5);
      // Leaf
      rect(seed.x, seed.y - 18.75, 12.5, 6.25);
      break;
      
    case 2: // Grown sprout
      // Seed
      fill('#4B2F1C');
      rect(seed.x - 6.25, seed.y - 6.25, 12.5, 12.5);
      // Stem
      fill('#228B22');
      rect(seed.x - 3.125, seed.y - 25, 6.25, 18.75);
      // Leaves
      rect(seed.x, seed.y - 25, 12.5, 6.25);
      rect(seed.x - 12.5, seed.y - 18.75, 12.5, 6.25);
      break;
  }
}