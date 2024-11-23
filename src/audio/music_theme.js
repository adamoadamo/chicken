// Ensure you include the p5.sound library in your project.
// If you're using the p5.js online editor, it's included by default.
// If you're integrating into a larger JS program, make sure to include p5.sound.js.

let kick, snare, hat;
let snareFilter, hatFilter, hatDelay;
let melodyOsc;
let reverb, limiter;
let melodyDelay;
let tempo = 90; // Beats per minute
let beatInterval;
let currentStep = 0;
let melodyNotes = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale
let melodyIndex = 0;

// Define a chord progression for the melody to resolve
let chords = [
  [60, 64, 67], // C major
  [62, 65, 69], // D minor
  [64, 67, 71], // E minor
  [65, 69, 72], // F major
];
let currentChord = 0;

// Envelopes for smoother amplitude transitions
let kickEnv, snareEnv, hatEnv, melodyEnv;

let isPlaying = false;

// Add these to the top of music_theme.js with other state variables
let kickEnabled = false;
let snareEnabled = false;
let hatEnabled = false;
let melodyEnabled = true;

// Function to initialize the music module
function initMusicModule() {
  // Initialize Envelopes
  kickEnv = new p5.Envelope();
  kickEnv.setADSR(0.01, 0.4, 0, 0.2);
  kickEnv.setRange(0.15, 0);

  snareEnv = new p5.Envelope();
  snareEnv.setADSR(0.001, 0.4, 0, 0.2);
  snareEnv.setRange(0.1, 0);

  hatEnv = new p5.Envelope();
  hatEnv.setADSR(0.001, 0.05, 0, 0.05);
  hatEnv.setRange(0.05, 0);

  melodyEnv = new p5.Envelope();
  melodyEnv.setADSR(0.01, 0.3, 0.5, 0.5);
  melodyEnv.setRange(0.4, 0);

  // Initialize Kick Drum
  kick = new p5.Oscillator('sine');
  kick.freq(90);
  kick.start();
  kick.amp(0);

  // Initialize Snare Drum
  snare = new p5.Noise('white');
  snare.start();
  snare.amp(0);

  // Initialize Hi-Hat
  hat = new p5.Noise('white');
  hat.start();
  hat.amp(0);

  // Initialize a Low-Pass Filter for the Snare
  snareFilter = new p5.Filter('lowpass');
  snareFilter.freq(1000);
  snare.disconnect();
  snare.connect(snareFilter);
  snareFilter.connect();

  // Initialize a High-Pass Filter for the Hi-Hat
  hatFilter = new p5.Filter('highpass');
  hatFilter.freq(8000);
  hat.disconnect();
  hat.connect(hatFilter);
  hatFilter.connect();

  // Initialize Melody Oscillator
  melodyOsc = new p5.Oscillator('sine');
  melodyOsc.start();
  melodyOsc.amp(0);

  // Initialize Melody Delay
  melodyDelay = new p5.Delay();
  melodyOsc.disconnect();
  melodyDelay.process(melodyOsc, 0.3, 0.5, 2000);
  melodyDelay.disconnect();

  // Process the output of the delay with reverb
  reverb = new p5.Reverb();
  reverb.process(melodyDelay, 3, 2);

  // Initialize Limiter to prevent clipping
  limiter = new p5.Gain();
  limiter.amp(1);
  reverb.disconnect();
  reverb.connect(limiter);
  limiter.connect();

  // Calculate interval between beats in milliseconds
  beatInterval = (60000 / tempo) / 4; // 16th notes

  // Start the beat loop
  setInterval(playBeat, beatInterval);
}

function playBeat() {
  if (kickEnabled && (currentStep === 0 || currentStep === 10)) {
    playKick();
  }

  if (snareEnabled && (currentStep === 4 || currentStep === 12)) {
    playSnare();
  }

  if (hatEnabled && (currentStep % 4 !== 0)) {
    playHat();
  }

  if (melodyEnabled && (currentStep % 8 === 0)) {
    playMelody();
  }

  currentStep = (currentStep + 1) % 16;
}

function playKick() {
  kickEnv.play(kick);
}

function playSnare() {
  snareEnv.play(snare);
}

function playHat() {
  hatEnv.play(hat);
}

function playMelody() {
  let chord = chords[currentChord];
  let note;

  if (random() < 0.7) {
    note = random(chord);
  } else {
    note = melodyNotes[melodyIndex];
    melodyIndex = (melodyIndex + 1) % melodyNotes.length;
  }

  let freq = midiToFreq(note);

  melodyOsc.freq(freq);
  melodyEnv.play(melodyOsc);

  // Randomly decide whether to apply delay
  if (random() < 0.5) {
    melodyDelay.drywet(0.5);
  } else {
    melodyDelay.drywet(0);
  }

  if (currentStep % 8 === 0) {
    currentChord = (currentChord + 1) % chords.length;
  }
}

// Utility function to convert MIDI note to frequency
function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function startMusic() {
  if (!isPlaying) {
    initMusicModule();
    isPlaying = true;
  }
}

function stopMusic() {
  if (isPlaying) {
    // Stop all sound sources
    kick.stop();
    snare.stop();
    hat.stop();
    melodyOsc.stop();
    isPlaying = false;
  }
}

function toggleMusic() {
  if (isPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
}

// Add these trigger functions
function enableHiHat() {
  hatEnabled = true;
}

function enableMelody() {
  melodyEnabled = true;
}

// Add these new trigger functions (after line 212)
function enableKickDrum() {
  kickEnabled = true;
}

function enableSnareAndHiHat() {
  snareEnabled = true;
  hatEnabled = true;
}

// Export functions for use in sketch.js
window.startMusic = startMusic;
window.stopMusic = stopMusic;
window.toggleMusic = toggleMusic;
window.enableKickDrum = enableKickDrum;
window.enableSnareAndHiHat = enableSnareAndHiHat;
