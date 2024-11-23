const SEED_CHANCE = 0.25;
const SPROUT_TIME = 450;
const GROWTH_TIME = 900;

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
let pigeonHasSpoken = false;
let seeds = []; // Array to store seeds with their growth state
let titMouseX = 400;
let titMouseY = 450;
let titMouseDirection = 0; // -1 left, 0 center, 1 right
let titMouseSize = 0.6; // 60% the size of duck/pigeon
let titMouseActive = false;
let titMouseHasSpoken = false;
let titMouseFollowing = false;
let pigeonFollowing = false;
let pigeonIsMovingToCorner = false;
let pigeonTargetX = 0;
let pigeonTargetY = 0;

const DIALOG = {
  pigeon: {
    greetings: [
      "Hey duck you got any apples?"
    ],
    choices: {
      question1: {
        prompt: "Hey duck you got any apples?",
        options: [
          "Ya, I got apples. Have at it.",
          "Get your own apples."
        ],
        responses: {
          friendly: "Hell ya, apple time.",
          unfriendly: "Damn son, you're a greedy bird."
        }
      }
    }
  },
  titmouse: {
    greetings: [
      "Sprout city over here, can I eat some of those bad boys?"
    ],
    choices: {
      question1: {
        prompt: "Sprout city over here, can I eat those bad boys?",
        options: [
          "Have at it, lil buddy.",
          "Nah, back off pipsqueak."
        ],
        responses: {
          friendly: "Heck ya, sprout city.",
          unfriendly: "What's you're problem?"
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

  // Handle pigeon behavior
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

  // Debug: Log pigeon activity when score changes
  if (score >= 5) {
    console.log("Score >= 5, pigeonActive:", pigeonActive);
  }

  // Update tit mouse position to follow duck
  let dx = duckX - titMouseX;
  let dy = duckY - titMouseY;
  let distance = dist(duckX, duckY, titMouseX, titMouseY);

  if (distance > 100) { // Start following if too far
    titMouseX += (dx / distance) * maxSpeed * 0.8; // Slightly slower than duck
    titMouseY += (dy / distance) * maxSpeed * 0.8;

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
    console.log("Titmouse activated.");
  }

  if (titMouseActive && !titMouseHasSpoken) {
    // Move towards duck for conversation
    let dxTit = duckX - titMouseX;
    let dyTit = duckY - titMouseY;
    let distanceTit = dist(duckX, duckY, titMouseX, titMouseY);

    if (distanceTit > 75) {
      if (dxTit !== 0) {
        titMouseDirection = dxTit > 0 ? 1 : -1;
      }
      titMouseX += (dxTit / distanceTit) * maxSpeed * 0.6;  // Slower movement
      titMouseY += (dyTit / distanceTit) * maxSpeed * 0.6;
      console.log("Titmouse is moving towards the duck for conversation.");
    }
  }

  if (pigeonActive && !pigeonHasSpoken) {
    // Pigeon is approaching for initial conversation
    let dxPig = duckX - pigeonX;
    let dyPig = duckY - pigeonY;
    let distancePig = dist(duckX, duckY, pigeonX, pigeonY);

    if (distancePig < 100) {
      // Initiate dialog handled in keyPressed()
      console.log("Pigeon is near the duck and ready to dialog.");
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
  if (keyCode === 88) { // X key
    if (!currentDialog && dialogState.current === 'none') {
      // Check distance to titmouse
      if (titMouseActive && !titMouseHasSpoken) {
        let dTit = dist(duckX, duckY, titMouseX, titMouseY);
        if (dTit < 100) {
          playerCanMove = false;
          dialogState.current = 'greeting';
          currentDialog = [DIALOG.titmouse.greetings[0]];
          dialogTimer = dialogDuration;
          dialogChoices = DIALOG.titmouse.choices.question1.options;
          selectedChoice = 0;
          console.log("Started dialog with Titmouse.");
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
          dialogChoices = DIALOG.pigeon.choices.question1.options;
          selectedChoice = 0;
          console.log("Started dialog with Pigeon.");
          return false;
        }
      }
    } else if (dialogState.current === 'greeting') {
      // Transition from greeting to choices
      dialogState.current = 'choices';
      dialogTimer = dialogDuration;
      return false;
    } else if (dialogState.current === 'choices') {
      // Handle choice selection and show response
      let response = selectedChoice === 0 ? 'friendly' : 'unfriendly';
      
      if (currentDialog[0] === DIALOG.titmouse.greetings[0]) {
        titMouseHasSpoken = true;
        currentDialog = [DIALOG.titmouse.choices.question1.responses[response]];
      } else if (currentDialog[0] === DIALOG.pigeon.greetings[0]) {
        pigeonHasSpoken = true;
        currentDialog = [DIALOG.pigeon.choices.question1.responses[response]];
        
        if (response === 'friendly') {
          pigeonFollowing = true;
          pigeonIsMovingToCorner = false;
        } else {
          pigeonFollowing = false;
          pigeonIsMovingToCorner = true;
          pigeonTargetX = 50;
          pigeonTargetY = height - 50;
        }
      }
      
      dialogState.current = 'response';
      dialogTimer = dialogDuration;
      dialogChoices = [];
      return false;
    } else if (dialogState.current === 'response') {
      // End dialog
      currentDialog = null;
      dialogState.current = 'none';
      playerCanMove = true;
      return false;
    }
  }
  
  // Handle choice selection with arrow keys
  if (dialogState.current === 'choices') {
    if (keyCode === UP_ARROW) {
      selectedChoice = max(0, selectedChoice - 1);
      return false;
    }
    if (keyCode === DOWN_ARROW) {
      selectedChoice = min(dialogChoices.length - 1, selectedChoice + 1);
      return false;
    }
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
  // Initial spawn check
  if (score >= 5 && !pigeonActive) {
    pigeonActive = true;
    spawnPigeon();
    console.log("Pigeon spawned.");
  }

  if (pigeonActive) {
    if (!pigeonHasSpoken) {
      // Move towards duck for initial conversation
      let dx = duckX - pigeonX;
      let dy = duckY - pigeonY;
      let d = sqrt(dx * dx + dy * dy);
      
      if (d > 75) {
        pigeonX += (dx / d) * pigeonSpeed;
        pigeonY += (dy / d) * pigeonSpeed;
        pigeonDirection = dx > 0 ? 1 : -1;
        console.log("Pigeon is approaching the duck.");
      }
    } else {
      if (pigeonFollowing) {
        // Follow and eat apples
        let nearestApple = findNearestApple();
        if (nearestApple) {
          let dx = nearestApple.x - pigeonX;
          let dy = nearestApple.y - pigeonY;
          let d = sqrt(dx * dx + dy * dy);
          
          if (d > 50) {
            pigeonX += (dx / d) * pigeonSpeed;
            pigeonY += (dy / d) * pigeonSpeed;
            pigeonDirection = dx > 0 ? 1 : -1;
            console.log("Pigeon is moving towards an apple.");
          } else {
            // Eat the apple
            apples = apples.filter(a => a !== nearestApple);
            score++;
            console.log("Pigeon ate an apple. Score:", score);
            
            // Chance to drop a seed
            if (random() < SEED_CHANCE) {
              seeds.push({
                x: pigeonX,
                y: pigeonY + 12.5,
                age: 0,
                stage: 0
              });
              console.log("Pigeon dropped a seed.");
            }
          }
        }
      } else if (pigeonIsMovingToCorner) {
        // Move to the designated corner
        let dx = pigeonTargetX - pigeonX;
        let dy = pigeonTargetY - pigeonY;
        let d = sqrt(dx * dx + dy * dy);
        
        if (d > 5) {
          pigeonX += (dx / d) * pigeonSpeed;
          pigeonY += (dy / d) * pigeonSpeed;
          pigeonDirection = dx > 0 ? 1 : -1;
          console.log("Pigeon is moving to the corner.");
        } else {
          pigeonIsMovingToCorner = false;
          console.log("Pigeon reached the corner.");
        }
      }
    }
  }
}

function moveTowardsDuck(x, y, speed) {
  let dx = duckX - x;
  let dy = duckY - y;
  let d = sqrt(dx * dx + dy * dy);
  
  if (d > 75) {
    pigeonX += (dx / d) * speed;
    pigeonY += (dy / d) * speed;
    pigeonDirection = dx > 0 ? 1 : -1;
  }
}

function findNearestApple() {
  let nearestApple = null;
  let nearestDist = Infinity;
  
  for (let apple of apples) {
    let d = dist(pigeonX, pigeonY, apple.x, apple.y);
    if (d < nearestDist) {
      nearestDist = d;
      nearestApple = apple;
    }
  }
  return nearestApple;
}
function moveTowardsAndEatApple(apple) {
  let dx = apple.x - pigeonX;
  let dy = apple.y - pigeonY;
  let d = sqrt(dx * dx + dy * dy);
  
  if (d > 75) {
    pigeonX += (dx / d) * pigeonSpeed;
    pigeonY += (dy / d) * pigeonSpeed;
    pigeonDirection = dx > 0 ? 1 : -1;
  } else if (d <= 75 && d > 50) {
    // Continue approaching
    pigeonX += (dx / d) * pigeonSpeed;
    pigeonY += (dy / d) * pigeonSpeed;
  } else if (d <= 50) {
    // Eat the apple
    apples = apples.filter(a => a !== apple);
    score++;
    console.log("Pigeon ate an apple. Score:", score);
    
    // Chance to drop a seed
    if (random() < SEED_CHANCE) {
      seeds.push({
        x: pigeonX,
        y: pigeonY + 12.5,
        age: 0,
        stage: 0
      });
      console.log("Pigeon dropped a seed.");
    }
  }
}

function moveToCorner() {
  let dx = pigeonTargetX - pigeonX;
  let dy = pigeonTargetY - pigeonY;
  let d = sqrt(dx * dx + dy * dy);
  
  if (d > 5) {
    pigeonX += (dx / d) * pigeonSpeed;
    pigeonY += (dy / d) * pigeonSpeed;
    pigeonDirection = dx > 0 ? 1 : -1;
    console.log("Pigeon is moving to the corner.");
  } else {
    pigeonIsMovingToCorner = false;
    console.log("Pigeon has reached the corner.");
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

function spawnPigeon() {
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
