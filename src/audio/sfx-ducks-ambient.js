let ducksReverb;
let playbackRate = 0.8;

function initDucksSound(sound) {
  // Create and configure reverb
  ducksReverb = new p5.Reverb();
  
  // Connect sound to reverb with 3 second decay, 2 second duration
  ducksReverb.process(sound, 3, 2);
  
  // Set playback rate (slower)
  sound.rate(playbackRate);
  
  // Set volume to 0.2 (half of 0.4)
  sound.setVolume(0.2);
}

function startDucksSound(sound) {
  if (sound && sound.isLoaded()) {
    sound.loop();
  }
}

// Export functions for use in sketch.js
window.initDucksSound = initDucksSound;
window.startDucksSound = startDucksSound;