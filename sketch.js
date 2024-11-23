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
let apples = []; // Start with no apples
let maxApples = 1;               // Will increase as score goes up
let pigeonX = -50;
let pigeonY = -50;
let pigeonActive = false;
let pigeonSpeed = 3.75;
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
const SEED_CHANCE = 0.25; // Increased to 25% chance
const SPROUT_TIME = 450; // 15 seconds at 30fps
const GROWTH_TIME = 900; // 30 seconds at 30fps
let titMouseX = 400;
let titMouseY = 450;
let titMouseDirection = 0; // -1 left, 0 center, 1 right
let titMouseSize = 0.6; // 60% the size of duck/pigeon
let titMouseActive = false;
let titMouseHasSpoken = false;
let titMouseFollowing = false;
let pigeonTargetX = 0;
let pigeonTargetY = 0;
let pigeonIsMovingToCorner = false;

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
  titmouse: {
    greetings: [
      "There are so many sprouts. I'm so hungry."
    ],
    choices: {
      question1: {
        prompt: "There are so many sprouts. I'm so hungry.",
        options: [
          "You can have some of mine!",
          "These are MY sprouts!"
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
  
  // Add first apple
  apples.push({
    x: random(100, width - 100),
    y: random(100, height - 100)
  });
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
  let duckDrawY = duckY + jumpHeight;
  let characters = [
    { x: duckX, y: duckDrawY, z: duckDrawY, type: 'duck' }
  ];
  
  if (titMouseActive) {
    characters.push({ x: titMouseX, y: titMouseY, z: titMouseY, type: 'titmouse' });
  }
  
  if (pigeonActive) {
    characters.push({ x: pigeonX, y: pigeonY, z: pigeonY, type: 'pigeon' });
  }
  
  // Sort characters by Y position
  characters.sort((a, b) => a.z - b.z);
  
  // Draw characters in order
  characters.forEach(char => {
    switch(char.type) {
      case 'duck':
        drawShadow(char.x, duckY, duckSize);
        drawDuck(char.x, char.y);
        break;
      case 'titmouse':
        drawTitMouseShadow(char.x, char.y);
        drawTitMouse(char.x, char.y);
        break;
      case 'pigeon':
        drawPigeonShadow(char.x, char.y);
        drawPigeon(char.x, char.y);
        break;
    }
  });

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

  // Update tit mouse position to follow duck
  let dx = duckX - titMouseX;
  let dy = duckY - titMouseY;
  let dist = sqrt(dx * dx + dy * dy);
  
  if (dist > 100) { // Start following if too far
    titMouseX += (dx / dist) * maxSpeed * 0.8; // Slightly slower than duck
    titMouseY += (dy / dist) * maxSpeed * 0.8;
    
    // Update direction based on movement
    if (dx !== 0) {
      titMouseDirection = dx > 0 ? 1 : -1;
    }
  }

  // Update tit mouse behavior
  let sproutingSeeds = countSproutingSeeds();
  
  if (sproutingSeeds >= 2 && !titMouseActive) {
    titMouseActive = true;
    titMouseX = -50;
    titMouseY = random(height);
  }

  if (titMouseActive && !titMouseHasSpoken) {
    // Move towards duck for conversation
    let dx = duckX - titMouseX;
    let dy = duckY - titMouseY;
    let d = sqrt(dx * dx + dy * dy);
    
    if (d > 75) {
      if (dx !== 0) {
        titMouseDirection = dx > 0 ? 1 : -1;
      }
      titMouseX += (dx / d) * maxSpeed * 0.6;  // Slower movement
      titMouseY += (dy / d) * maxSpeed * 0.6;
    }
  }

  if (pigeonActive && !pigeonHasSpoken) {
    // Move towards duck for conversation
    let dx = duckX - pigeonX;
    let dy = duckY - pigeonY;
    let d = sqrt(dx * dx + dy * dy);
    
    if (d > 75) {
      if (dx !== 0) {
        pigeonDirection = dx > 0 ? 1 : -1;
      }
      pigeonX += (dx / d) * pigeonSpeed;
      pigeonY += (dy / d) * pigeonSpeed;
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
  // Main apple body (75% of original size)
  fill(appleColor);
  rect(x - 18.75, y - 18.75, 37.5, 37.5);        // Center square
  rect(x - 9.375, y - 28.125, 18.75, 9.375);     // Top middle
  rect(x - 28.125, y - 9.375, 9.375, 18.75);     // Left middle
  rect(x + 18.75, y - 9.375, 9.375, 18.75);      // Right middle
  
  // Stem
  fill(stemColor);
  rect(x - 6.25, y - 37.5, 6.25, 9.375);
  
  // Leaf
  fill(leafColor);
  rect(x, y - 37.5, 6.25, 9.375);
}

function keyPressed() {
  // Start conversation when X is pressed near a character
  if (keyCode === 88) {
    if (!currentDialog && dialogState.current === 'none') {
      // Check distance to titmouse
      if (titMouseActive && !titMouseHasSpoken) {
        let dTit = dist(duckX, duckY, titMouseX, titMouseY);
        if (dTit < 100) {
          playerCanMove = false;
          dialogState.current = 'greeting';
          currentDialog = [DIALOG.titmouse.greetings[0]];
          dialogTimer = dialogDuration;
          currentDialogIndex = 0;
          dialogChoices = DIALOG.titmouse.choices.question1.options;
          selectedChoice = 0;
          return false;
        }
      }
      
      // Check distance to pigeon
      if (pigeonActive && !pigeonHasSpoken) {
        let dPig = dist(duckX, duckY, pigeonX, pigeonY);
        if (dPig < 100) {
          playerCanMove = false;
          dialogState.current = 'greeting';
          currentDialog = [DIALOG.pigeon.greetings[0]];
          dialogTimer = dialogDuration;
          currentDialogIndex = 0;
          dialogChoices = DIALOG.pigeon.choices.question1.options;
          selectedChoice = 0;
          return false;
        }
      }
    } else if (dialogState.current === 'response') {
      // End the dialog and allow player movement again
      currentDialog = null;
      dialogState.current = 'none';
      playerCanMove = true;
      return false;
    }
  }
  
  // Handle dialog progression
  if (currentDialog && dialogState.current === 'greeting' && keyCode === 88) {
    dialogState.current = 'choices';
    currentDialog = null;
    return false;
  }
  
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
      
      // Check which character is speaking
      if (currentDialog && currentDialog[0] === DIALOG.titmouse.greetings[0]) {
        currentDialog = [DIALOG.titmouse.choices.question1.responses[response]];
        titMouseHasSpoken = true;
      } else {
        currentDialog = [DIALOG.pigeon.choices.question1.responses[response]];
        pigeonHasSpoken = true;
      }
      
      dialogChoices = [];
      dialogTimer = dialogDuration;
      currentDialogIndex = 0;
      return false;
    }
  }
  
  if (keyCode === 88 && dialogState.current === 'response') { // X key pressed during response
    if (currentDialog && currentDialog[0] === DIALOG.pigeon.choices.question1.responses[response]) {
      // For pigeon dialog
      if (selectedChoice === 0) { // Friendly response
        pigeonFollowing = true;
        pigeonIsMovingToCorner = false;
      } else { // Unfriendly response
        pigeonFollowing = false;
        pigeonIsMovingToCorner = true;
        // Set corner position
        pigeonTargetX = 50;
        pigeonTargetY = height - 50;
      }
    }
    
    // Reset dialog state
    currentDialog = null;
    dialogState.current = 'none';
    playerCanMove = true;
    return false;
  }
}

function checkCollision() {
  // Only check collisions if not jumping
  if (!isJumping) {
    for (let i = apples.length - 1; i >= 0; i--) {
      let d = dist(duckX, duckY - 25, apples[i].x, apples[i].y);
      if (d < 75) {
        score++;
        apples.splice(i, 1);
        
        // Random chance to spawn multiple apples
        let spawnChance = random();
        let numNewApples = 1; // Default spawn one apple
        
        if (spawnChance < 0.5) { // 50% chance for 2 apples
          numNewApples = 2;
        } else if (spawnChance < 0.7) { // Additional 20% chance for 3 apples
          numNewApples = 3;
        }
        
        // Check if duck should poop a seed
        if (random() < SEED_CHANCE) {
          seeds.push({
            x: duckX,
            y: duckY + 12.5,
            age: 0,
            stage: 0
          });
        }

        // Spawn new apples
        for (let j = 0; j < numNewApples; j++) {
          apples.push({
            x: random(100, width - 100),
            y: random(100, height - 100)
          });
        }
      }
    }
  }
  
  // Always ensure at least one apple exists
  if (apples.length === 0) {
    apples.push({
      x: random(100, width - 100),
      y: random(100, height - 100)
    });
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
  rect(x - 18.75, y + 9.375, 37.5, 9.375); // Base shadow
  rect(x - 9.375, y + 6.25, 18.75, 6.25);  // Top shadow
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
  
  if (pigeonActive && pigeonFollowing) {
    // Find nearest apple
    let nearestApple = null;
    let nearestDist = Infinity;
    
    for (let apple of apples) {
      let dx = apple.x - pigeonX;
      let dy = apple.y - pigeonY;
      let d = sqrt(dx * dx + dy * dy);
      if (d < nearestDist) {
        nearestDist = d;
        nearestApple = apple;
      }
    }
    
    if (nearestApple) {
      let dx = nearestApple.x - pigeonX;
      let dy = nearestApple.y - pigeonY;
      let d = sqrt(dx * dx + dy * dy);
      
      if (d > 0) {
        pigeonX += (dx / d) * pigeonSpeed;
        pigeonY += (dy / d) * pigeonSpeed;
        
        if (dx !== 0) {
          pigeonDirection = dx > 0 ? 1 : -1;
        }
        
        // Eat apple if close enough
        if (d < 50) {
          apples = apples.filter(a => a !== nearestApple);
          score++;
          
          // Check if pigeon should drop a seed
          if (random() < SEED_CHANCE) {
            seeds.push({
              x: pigeonX,
              y: pigeonY + 12.5,
              age: 0,
              stage: 0
            });
          }
        }
      }
    }
  }

  if (pigeonIsMovingToCorner) {
    let dx = pigeonTargetX - pigeonX;
    let dy = pigeonTargetY - pigeonY;
    let d = sqrt(dx * dx + dy * dy);
    
    if (d > 5) {  // Keep moving until very close to target
      pigeonX += (dx / d) * pigeonSpeed;
      pigeonY += (dy / d) * pigeonSpeed;
      
      if (dx !== 0) {
        pigeonDirection = dx > 0 ? 1 : -1;
      }
    } else {
      pigeonIsMovingToCorner = false;  // Stop moving once reached target
    }
  }
}

function getRandomDialog(character, category) {
  const options = DIALOG[character][category];
  return options[Math.floor(Math.random() * options.length)];
}

function drawDialog(x, y, dialogText) {
  // Position dialog above the speaking character
  let dialogY = y;
  if (currentDialog && currentDialog[0] === DIALOG.titmouse.greetings[0]) {
    x = titMouseX;
    dialogY = titMouseY;
  } else if (currentDialog && currentDialog[0] === DIALOG.pigeon.greetings[0]) {
    x = pigeonX;
    dialogY = pigeonY;
  }
  
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

function drawTitMouse(x, y) {
  fill('#FFD700'); // Yellow base color
  
  // Body (smaller than duck)
  rect(x - (25 * titMouseSize), y - (50 * titMouseSize), 50 * titMouseSize, 50 * titMouseSize);
  
  // Wings
  rect(x - (37.5 * titMouseSize), y - (43.75 * titMouseSize), 31.25 * titMouseSize, 31.25 * titMouseSize); // Left wing
  rect(x + (6.25 * titMouseSize), y - (43.75 * titMouseSize), 31.25 * titMouseSize, 31.25 * titMouseSize); // Right wing
  
  // Head (rounder than duck, and connected to body)
  rect(x - (18.75 * titMouseSize), y - (68.75 * titMouseSize), 37.5 * titMouseSize, 25 * titMouseSize);
  
  // Eye and Beak
  if (titMouseDirection <= 0) {  // Looking left or center
    // Beak (tiny)
    fill('#000000');
    rect(x - (12.5 * titMouseSize), y - (62.5 * titMouseSize), 6.25 * titMouseSize, 6.25 * titMouseSize);
    // Eye
    fill('#000000');
    rect(x, y - (62.5 * titMouseSize), 6.25 * titMouseSize, 6.25 * titMouseSize);
  } else {  // Looking right
    // Beak
    fill('#000000');
    rect(x + (6.25 * titMouseSize), y - (62.5 * titMouseSize), 6.25 * titMouseSize, 6.25 * titMouseSize);
    // Eye
    fill('#000000');
    rect(x - (6.25 * titMouseSize), y - (62.5 * titMouseSize), 6.25 * titMouseSize, 6.25 * titMouseSize);
  }
  
  // Legs (wider)
  fill('#000000');
  rect(x - (6.25 * titMouseSize), y, 6.25, 6.25 * titMouseSize); // Left leg
  rect(x + (0 * titMouseSize), y, 6.25, 6.25 * titMouseSize); // Right leg
}

function drawTitMouseShadow(x, y) {
  fill(0, 0, 0, 50); // Semi-transparent black
  rect(x - (25 * titMouseSize), y + 5, 50 * titMouseSize, 6.25);
}

function countSproutingSeeds() {
  return seeds.filter(seed => seed.stage > 0).length;
}

function handleDialog(character) {
  if (!character.hasSpoken) {
    // Move towards duck for initial conversation
    let dx = duckX - character.x;
    let dy = duckY - character.y;
    let d = sqrt(dx * dx + dy * dy);
    
    if (d > 75) {
      // Update direction based on movement
      if (dx !== 0) {
        character.direction = dx > 0 ? 1 : -1;
      }
      // Move towards duck
      character.x += (dx / d) * maxSpeed * 0.75;
      character.y += (dy / d) * maxSpeed * 0.75;
    }
  }
}