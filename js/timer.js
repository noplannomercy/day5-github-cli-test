/**
 * Timer Module - Countdown timer using requestAnimationFrame
 * CRITICAL: Uses Date.now() for accuracy, NOT tick counting
 */

// Timer factory function
function createTimer(onTick, onComplete) {
  let targetTime = 0;
  let initialDuration = 0;
  let remaining = 0;
  let rafId = null;
  let isRunning = false;
  let isPaused = false;
  let lastSecond = -1;

  function tick() {
    if (!isRunning) return;

    const now = Date.now();
    remaining = Math.max(0, targetTime - now);

    // Performance: only call onTick when seconds change
    const currentSecond = Math.floor(remaining / 1000);
    if (currentSecond !== lastSecond) {
      lastSecond = currentSecond;
      if (onTick) onTick(remaining, initialDuration);
    }

    // Guard: stop at 0
    if (remaining <= 0) {
      isRunning = false;
      isPaused = false;
      if (onComplete) onComplete();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  function start(durationMs) {
    if (isRunning) return;

    initialDuration = durationMs;
    remaining = durationMs;
    targetTime = Date.now() + durationMs;
    isRunning = true;
    isPaused = false;
    lastSecond = -1;

    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    if (!isRunning || isPaused) return;

    isRunning = false;
    isPaused = true;
    remaining = Math.max(0, targetTime - Date.now());

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function resume() {
    if (isRunning || !isPaused) return;

    targetTime = Date.now() + remaining;
    isRunning = true;
    isPaused = false;
    lastSecond = -1;

    rafId = requestAnimationFrame(tick);
  }

  function reset() {
    isRunning = false;
    isPaused = false;
    remaining = 0;
    targetTime = 0;
    lastSecond = -1;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Handle visibility change - restart rAF when tab becomes visible
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && isRunning) {
      // Recalculate and restart rAF
      if (rafId) cancelAnimationFrame(rafId);
      lastSecond = -1; // Force update
      rafId = requestAnimationFrame(tick);
    }
  }

  // Register visibility listener
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return {
    start,
    pause,
    resume,
    reset,
    getRemaining: () => remaining,
    getInitialDuration: () => initialDuration,
    isRunning: () => isRunning,
    isPaused: () => isPaused,
    destroy: () => {
      reset();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
}

// Format milliseconds to MM:SS or HH:MM:SS
function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Parse time inputs to milliseconds
function parseTimeInputs(hours, minutes, seconds) {
  const h = Math.max(0, parseInt(hours) || 0);
  const m = Math.max(0, Math.min(59, parseInt(minutes) || 0));
  const s = Math.max(0, Math.min(59, parseInt(seconds) || 0));
  return (h * 3600 + m * 60 + s) * 1000;
}

// ============================================
// TimerTests - Run in browser console
// ============================================
const TimerTests = {
  results: [],

  assert(condition, testName) {
    this.results.push({ name: testName, passed: condition });
    console.log(condition ? `✓ ${testName}` : `✗ ${testName}`);
  },

  async runAll() {
    console.log('\n=== TimerTests ===\n');
    this.results = [];

    // Test 1: formatTime
    this.assert(formatTime(0) === '00:00', 'formatTime(0) = 00:00');
    this.assert(formatTime(1000) === '00:01', 'formatTime(1000) = 00:01');
    this.assert(formatTime(60000) === '01:00', 'formatTime(60000) = 01:00');
    this.assert(formatTime(3661000) === '1:01:01', 'formatTime(3661000) = 1:01:01');
    this.assert(formatTime(500) === '00:01', 'formatTime(500) rounds up to 00:01');

    // Test 2: parseTimeInputs
    this.assert(parseTimeInputs(0, 25, 0) === 1500000, 'parseTimeInputs(0,25,0) = 1500000ms');
    this.assert(parseTimeInputs(1, 0, 0) === 3600000, 'parseTimeInputs(1,0,0) = 3600000ms');
    this.assert(parseTimeInputs(0, 0, 30) === 30000, 'parseTimeInputs(0,0,30) = 30000ms');

    // Test 3: Timer creation
    let tickCount = 0;
    let completed = false;
    const timer = createTimer(
      () => tickCount++,
      () => completed = true
    );
    this.assert(typeof timer.start === 'function', 'Timer has start method');
    this.assert(typeof timer.pause === 'function', 'Timer has pause method');
    this.assert(typeof timer.resume === 'function', 'Timer has resume method');
    this.assert(typeof timer.reset === 'function', 'Timer has reset method');

    // Test 4: Timer state
    this.assert(!timer.isRunning(), 'Timer initially not running');
    this.assert(!timer.isPaused(), 'Timer initially not paused');

    // Test 5: Start timer
    timer.start(2000);
    this.assert(timer.isRunning(), 'Timer running after start');

    // Test 6: Pause
    await new Promise(r => setTimeout(r, 100));
    timer.pause();
    this.assert(!timer.isRunning(), 'Timer not running after pause');
    this.assert(timer.isPaused(), 'Timer paused after pause');
    const remaining1 = timer.getRemaining();
    this.assert(remaining1 > 0 && remaining1 < 2000, 'Remaining time preserved after pause');

    // Test 7: Resume
    timer.resume();
    this.assert(timer.isRunning(), 'Timer running after resume');

    // Test 8: Reset
    timer.reset();
    this.assert(!timer.isRunning(), 'Timer not running after reset');
    this.assert(!timer.isPaused(), 'Timer not paused after reset');

    // Test 9: Completion callback
    completed = false;
    timer.start(500);
    await new Promise(r => setTimeout(r, 700));
    this.assert(completed, 'onComplete called when timer finishes');
    this.assert(!timer.isRunning(), 'Timer stops after completion');

    // Test 10: Zero guard
    this.assert(timer.getRemaining() === 0, 'Remaining is 0 after completion (no negative)');

    // Cleanup
    timer.destroy();

    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    console.log(`\n=== Results: ${passed}/${total} passed ===\n`);
    return passed === total;
  }
};
