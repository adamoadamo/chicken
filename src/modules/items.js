// At the top of items.js
// import { random, width, height, fill, rect } from './p5.js';

// Constants
const SEED_CHANCE = 0.25;
const SPROUT_TIME = 450;
const GROWTH_TIME = 900;

// Colors
const COLORS = {
  apple: '#FF0000',
  stem: '#4B2F1C',
  leaf: '#228B22'
};

// State
let apples = [];
let seeds = [];
let maxApples = 1;

function handleApples() {
  // Add new apples based on maxApples
  while (apples.length < maxApples) {
    apples.push({
      x: random(100, width - 100),
      y: random(100, height - 100)
    });
  }
}

function drawApple(x, y) {
  fill(COLORS.apple);
  rect(x - 12.5, y - 12.5, 25, 25);
  fill(COLORS.stem);
  rect(x - 3.125, y - 18.75, 6.25, 6.25);
  fill(COLORS.leaf);
  rect(x + 3.125, y - 18.75, 12.5, 6.25);
}

function drawAppleShadow(x, y) {
  fill(0, 0, 0, 50);
  rect(x - 12.5, y + 5, 25, 6.25);
}

function drawSeed(seed) {
  switch(seed.stage) {
    case 0: // Basic seed
      fill(COLORS.stem);
      rect(seed.x - 6.25, seed.y - 6.25, 12.5, 12.5);
      break;
      
    case 1: // First sprout
      fill(COLORS.stem);
      rect(seed.x - 6.25, seed.y - 6.25, 12.5, 12.5);
      fill(COLORS.leaf);
      rect(seed.x - 3.125, seed.y - 18.75, 6.25, 12.5);
      rect(seed.x, seed.y - 18.75, 12.5, 6.25);
      break;
      
    case 2: // Grown sprout
      fill(COLORS.stem);
      rect(seed.x - 6.25, seed.y - 6.25, 12.5, 12.5);
      fill(COLORS.leaf);
      rect(seed.x - 3.125, seed.y - 25, 6.25, 18.75);
      rect(seed.x, seed.y - 25, 12.5, 6.25);
      rect(seed.x - 12.5, seed.y - 18.75, 12.5, 6.25);
      break;
  }
}

function updateSeeds() {
  seeds.forEach(seed => {
    seed.age++;
    if (seed.age >= GROWTH_TIME && seed.stage < 2) {
      seed.stage = 2;
    } else if (seed.age >= SPROUT_TIME && seed.stage < 1) {
      seed.stage = 1;
    }
  });
}

function countSproutingSeeds() {
  return seeds.filter(seed => seed.stage > 0).length;
}

// Use ES6 export instead of window assignments
export {
  apples,
  seeds,
  maxApples,
  handleApples,
  drawApple,
  drawAppleShadow,
  drawSeed,
  updateSeeds,
  countSproutingSeeds,
  SEED_CHANCE,
  SPROUT_TIME,
  GROWTH_TIME
};