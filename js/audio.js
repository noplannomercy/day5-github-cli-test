/**
 * Audio Module - Web Audio API for alarm sounds
 * Safari fallback + user gesture handling
 */

const AudioManager = (function() {
  // Safari fallback
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioContext = null;
  let currentOscillator = null;
  let currentGain = null;
  let isPlaying = false;

  // Lazy initialization with user gesture
  function initContext() {
    if (!audioContext && AudioContext) {
      try {
        audioContext = new AudioContext();
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
        return false;
      }
    }
    return !!audioContext;
  }

  // Resume context (required after user gesture)
  function resumeContext() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  // Sound patterns
  const sounds = {
    beep: { frequency: 800, pattern: [200, 100, 200, 100, 200] },
    bell: { frequency: 600, pattern: [500, 200, 500, 200, 500] },
    gentle: { frequency: 400, pattern: [300, 150, 300, 150, 300, 150, 300] }
  };

  // Play alarm sound
  function playAlarm(type = 'beep', volume = 0.7) {
    if (!initContext()) {
      console.warn('Audio not available');
      return false;
    }

    resumeContext();
    stopAlarm(); // Stop any existing alarm

    const sound = sounds[type] || sounds.beep;
    isPlaying = true;

    playPattern(sound.frequency, sound.pattern, volume, 0);
    return true;
  }

  function playPattern(frequency, pattern, volume, index) {
    if (!isPlaying || index >= pattern.length) {
      isPlaying = false;
      return;
    }

    const duration = pattern[index] / 1000;
    const isOn = index % 2 === 0;

    if (isOn) {
      playTone(frequency, duration, volume);
    }

    setTimeout(() => {
      playPattern(frequency, pattern, volume, index + 1);
    }, pattern[index]);
  }

  function playTone(frequency, duration, volume) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    currentOscillator = oscillator;
    currentGain = gainNode;
  }

  // Stop alarm
  function stopAlarm() {
    isPlaying = false;
    if (currentOscillator) {
      try {
        currentOscillator.stop();
      } catch (e) {}
      currentOscillator = null;
    }
    currentGain = null;
  }

  // Check if audio is available
  function isAvailable() {
    return !!AudioContext;
  }

  return {
    init: initContext,
    resume: resumeContext,
    play: playAlarm,
    stop: stopAlarm,
    isAvailable
  };
})();

// ============================================
// AudioTests - Run in browser console
// ============================================
const AudioTests = {
  results: [],

  assert(condition, testName) {
    this.results.push({ name: testName, passed: condition });
    console.log(condition ? `✓ ${testName}` : `✗ ${testName}`);
  },

  async runAll() {
    console.log('\n=== AudioTests ===\n');
    this.results = [];

    // Test 1: AudioManager exists
    this.assert(typeof AudioManager === 'object', 'AudioManager exists');
    this.assert(typeof AudioManager.play === 'function', 'AudioManager.play exists');
    this.assert(typeof AudioManager.stop === 'function', 'AudioManager.stop exists');

    // Test 2: Audio availability check
    this.assert(typeof AudioManager.isAvailable() === 'boolean', 'isAvailable returns boolean');

    // Test 3: Init context
    const initResult = AudioManager.init();
    this.assert(typeof initResult === 'boolean', 'init returns boolean');

    // Test 4: Play alarm (requires user gesture first)
    console.log('Note: Audio tests require user gesture. Click anywhere first.');

    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    console.log(`\n=== Results: ${passed}/${total} passed ===\n`);
    console.log('Manual test: Click page, then run AudioManager.play("beep", 0.5)');
    return passed === total;
  }
};
