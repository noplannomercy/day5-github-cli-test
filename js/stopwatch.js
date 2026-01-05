/**
 * Stopwatch Module - Count up timer with lap times
 * CRITICAL: Uses performance.now() for millisecond precision
 */

// Stopwatch factory function
function createStopwatch(onTick) {
  let startTime = 0;
  let elapsed = 0;
  let rafId = null;
  let isRunning = false;
  let isPaused = false;
  let laps = [];

  function tick() {
    if (!isRunning) return;

    const now = performance.now();
    const current = elapsed + (now - startTime);

    if (onTick) onTick(current);

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (isRunning) return;

    startTime = performance.now();
    isRunning = true;
    isPaused = false;

    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    if (!isRunning || isPaused) return;

    // Accumulate elapsed time
    elapsed += performance.now() - startTime;
    isRunning = false;
    isPaused = true;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function resume() {
    if (isRunning || !isPaused) return;

    startTime = performance.now();
    isRunning = true;
    isPaused = false;

    rafId = requestAnimationFrame(tick);
  }

  function reset() {
    isRunning = false;
    isPaused = false;
    elapsed = 0;
    startTime = 0;
    laps = [];

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function lap() {
    if (!isRunning && !isPaused) return null;

    const current = isRunning
      ? elapsed + (performance.now() - startTime)
      : elapsed;

    // Calculate split time (time since last lap or start)
    const lastLapTotal = laps.length > 0 ? laps[laps.length - 1].total : 0;
    const split = current - lastLapTotal;

    const lapData = {
      number: laps.length + 1,
      split: split,
      total: current
    };

    laps.push(lapData);
    return lapData;
  }

  function getElapsed() {
    if (isRunning) {
      return elapsed + (performance.now() - startTime);
    }
    return elapsed;
  }

  function getLaps() {
    return [...laps];
  }

  // Handle visibility change
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && isRunning) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return {
    start,
    pause,
    resume,
    reset,
    lap,
    getElapsed,
    getLaps,
    isRunning: () => isRunning,
    isPaused: () => isPaused,
    destroy: () => {
      reset();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
}

// Format milliseconds to HH:MM:SS.ms
function formatTimeMs(ms) {
  const totalMs = Math.floor(ms);
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const centiseconds = Math.floor((totalMs % 1000) / 10);

  const timeStr = hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    main: timeStr,
    ms: String(centiseconds).padStart(2, '0')
  };
}

// Export laps to CSV format
function exportLapsToCSV(laps) {
  if (laps.length === 0) return '';

  const header = 'Lap,Split Time,Total Time\n';
  const rows = laps.map(lap => {
    const split = formatTimeMs(lap.split);
    const total = formatTimeMs(lap.total);
    return `${lap.number},${split.main}.${split.ms},${total.main}.${total.ms}`;
  }).join('\n');

  return header + rows;
}

// ============================================
// StopwatchTests - Run in browser console
// ============================================
const StopwatchTests = {
  results: [],

  assert(condition, testName) {
    this.results.push({ name: testName, passed: condition });
    console.log(condition ? `✓ ${testName}` : `✗ ${testName}`);
  },

  async runAll() {
    console.log('\n=== StopwatchTests ===\n');
    this.results = [];

    // Test 1: formatTimeMs
    let fmt = formatTimeMs(0);
    this.assert(fmt.main === '00:00' && fmt.ms === '00', 'formatTimeMs(0) = 00:00.00');

    fmt = formatTimeMs(1234);
    this.assert(fmt.main === '00:01' && fmt.ms === '23', 'formatTimeMs(1234) = 00:01.23');

    fmt = formatTimeMs(65432);
    this.assert(fmt.main === '01:05' && fmt.ms === '43', 'formatTimeMs(65432) = 01:05.43');

    fmt = formatTimeMs(3661234);
    this.assert(fmt.main === '01:01:01' && fmt.ms === '23', 'formatTimeMs(3661234) = 01:01:01.23');

    // Test 2: Stopwatch creation
    let tickCount = 0;
    const sw = createStopwatch(() => tickCount++);
    this.assert(typeof sw.start === 'function', 'Stopwatch has start method');
    this.assert(typeof sw.lap === 'function', 'Stopwatch has lap method');

    // Test 3: Initial state
    this.assert(!sw.isRunning(), 'Stopwatch initially not running');
    this.assert(!sw.isPaused(), 'Stopwatch initially not paused');
    this.assert(sw.getElapsed() === 0, 'Stopwatch initially at 0');

    // Test 4: Start
    sw.start();
    this.assert(sw.isRunning(), 'Stopwatch running after start');
    await new Promise(r => setTimeout(r, 100));
    this.assert(sw.getElapsed() > 50, 'Elapsed time increases');

    // Test 5: Pause
    sw.pause();
    this.assert(!sw.isRunning(), 'Stopwatch not running after pause');
    this.assert(sw.isPaused(), 'Stopwatch paused after pause');
    const elapsed1 = sw.getElapsed();
    await new Promise(r => setTimeout(r, 100));
    const elapsed2 = sw.getElapsed();
    this.assert(Math.abs(elapsed1 - elapsed2) < 5, 'Elapsed time stable while paused');

    // Test 6: Resume
    sw.resume();
    this.assert(sw.isRunning(), 'Stopwatch running after resume');
    await new Promise(r => setTimeout(r, 100));
    this.assert(sw.getElapsed() > elapsed1, 'Elapsed continues after resume');

    // Test 7: Lap
    const lap1 = sw.lap();
    this.assert(lap1 !== null, 'Lap returns data');
    this.assert(lap1.number === 1, 'First lap number is 1');
    this.assert(lap1.split > 0, 'Lap has split time');
    this.assert(lap1.total > 0, 'Lap has total time');

    await new Promise(r => setTimeout(r, 50));
    const lap2 = sw.lap();
    this.assert(lap2.number === 2, 'Second lap number is 2');
    this.assert(lap2.total > lap1.total, 'Total time increases');

    // Test 8: getLaps
    const laps = sw.getLaps();
    this.assert(laps.length === 2, 'getLaps returns all laps');

    // Test 9: Reset
    sw.reset();
    this.assert(!sw.isRunning(), 'Stopwatch not running after reset');
    this.assert(sw.getElapsed() === 0, 'Elapsed is 0 after reset');
    this.assert(sw.getLaps().length === 0, 'Laps cleared after reset');

    // Test 10: exportLapsToCSV
    sw.start();
    await new Promise(r => setTimeout(r, 50));
    sw.lap();
    await new Promise(r => setTimeout(r, 50));
    sw.lap();
    const csv = exportLapsToCSV(sw.getLaps());
    this.assert(csv.includes('Lap,Split Time,Total Time'), 'CSV has header');
    this.assert(csv.includes('1,'), 'CSV has lap 1');
    this.assert(csv.includes('2,'), 'CSV has lap 2');

    // Cleanup
    sw.destroy();

    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    console.log(`\n=== Results: ${passed}/${total} passed ===\n`);
    return passed === total;
  }
};
