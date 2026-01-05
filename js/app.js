/**
 * App Module - Main application logic
 * Connects timer/stopwatch to UI
 */

(function() {
  'use strict';

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Tabs
    tabTimer: document.getElementById('tab-timer'),
    tabStopwatch: document.getElementById('tab-stopwatch'),

    // Timer mode
    timerMode: document.getElementById('timer-mode'),
    timerInput: document.getElementById('timer-input'),
    timerDisplay: document.getElementById('timer-display'),
    inputHours: document.getElementById('input-hours'),
    inputMinutes: document.getElementById('input-minutes'),
    inputSeconds: document.getElementById('input-seconds'),
    progressContainer: document.getElementById('progress-container'),
    progressBar: document.getElementById('progress-bar'),
    btnStart: document.getElementById('btn-start'),
    btnPause: document.getElementById('btn-pause'),
    btnReset: document.getElementById('btn-reset'),

    // Stopwatch mode
    stopwatchMode: document.getElementById('stopwatch-mode'),
    stopwatchDisplay: document.getElementById('stopwatch-display'),
    btnSwStart: document.getElementById('btn-sw-start'),
    btnSwPause: document.getElementById('btn-sw-pause'),
    btnSwLap: document.getElementById('btn-sw-lap'),
    btnSwReset: document.getElementById('btn-sw-reset'),
    lapContainer: document.getElementById('lap-container'),
    lapList: document.getElementById('lap-list')
  };

  // ============================================
  // State
  // ============================================
  let currentMode = 'timer'; // 'timer' or 'stopwatch'
  let timer = null;
  let stopwatch = null;

  // ============================================
  // Timer UI Functions
  // ============================================
  function updateTimerDisplay(remaining, initial) {
    elements.timerDisplay.textContent = formatTime(remaining);

    // Update progress bar
    const progress = initial > 0 ? (remaining / initial) * 100 : 100;
    elements.progressBar.style.width = `${progress}%`;

    // Color change based on progress
    if (progress > 50) {
      elements.progressBar.className = 'h-full bg-green-500 transition-all duration-200';
    } else if (progress > 25) {
      elements.progressBar.className = 'h-full bg-yellow-500 transition-all duration-200';
    } else {
      elements.progressBar.className = 'h-full bg-red-500 transition-all duration-200';
    }
  }

  function onTimerComplete() {
    // Completion pulse effect
    elements.timerDisplay.classList.add('animate-pulse-complete');
    document.body.classList.add('animate-flash');

    setTimeout(() => {
      elements.timerDisplay.classList.remove('animate-pulse-complete');
      document.body.classList.remove('animate-flash');

      // Reset UI to input state
      showTimerInput();
      elements.btnStart.classList.remove('hidden');
      elements.btnPause.classList.add('hidden');
    }, 1500);

    // TODO Phase 5: Play alarm, show notification
    console.log('Timer complete!');
  }

  function showTimerInput() {
    elements.timerInput.classList.remove('hidden');
    elements.timerDisplay.classList.add('hidden');
    elements.progressContainer.classList.add('hidden');
  }

  function showTimerDisplay() {
    elements.timerInput.classList.add('hidden');
    elements.timerDisplay.classList.remove('hidden');
    elements.progressContainer.classList.remove('hidden');
  }

  function getInputDuration() {
    return parseTimeInputs(
      elements.inputHours.value,
      elements.inputMinutes.value,
      elements.inputSeconds.value
    );
  }

  function setInputDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    elements.inputHours.value = hours;
    elements.inputMinutes.value = minutes;
    elements.inputSeconds.value = seconds;
  }

  // ============================================
  // Timer Event Handlers
  // ============================================
  function handleStart() {
    const duration = getInputDuration();
    if (duration <= 0) return;

    // Create timer if not exists
    if (!timer) {
      timer = createTimer(updateTimerDisplay, onTimerComplete);
    }

    // Show display mode
    showTimerDisplay();
    updateTimerDisplay(duration, duration);

    // Start timer
    timer.start(duration);

    // Update buttons
    elements.btnStart.classList.add('hidden');
    elements.btnPause.classList.remove('hidden');
  }

  function handlePause() {
    if (!timer) return;

    if (timer.isPaused()) {
      // Resume
      timer.resume();
      elements.btnPause.textContent = 'Pause';
      elements.btnPause.className = 'px-8 py-4 rounded-lg bg-yellow-600 text-white font-bold text-lg min-h-[44px] min-w-[100px] transition-all hover:bg-yellow-500 active:scale-95';
    } else {
      // Pause
      timer.pause();
      elements.btnPause.textContent = 'Resume';
      elements.btnPause.className = 'px-8 py-4 rounded-lg bg-green-600 text-white font-bold text-lg min-h-[44px] min-w-[100px] transition-all hover:bg-green-500 active:scale-95';
    }
  }

  function handleReset() {
    if (timer) {
      timer.reset();
    }

    // Reset UI
    showTimerInput();
    elements.btnStart.classList.remove('hidden');
    elements.btnPause.classList.add('hidden');
    elements.btnPause.textContent = 'Pause';
    elements.btnPause.className = 'px-8 py-4 rounded-lg bg-yellow-600 text-white font-bold text-lg min-h-[44px] min-w-[100px] transition-all hover:bg-yellow-500 active:scale-95 hidden';
    elements.progressBar.style.width = '100%';
    elements.progressBar.className = 'h-full bg-green-500 transition-all duration-200';
  }

  function handlePreset(e) {
    const seconds = parseInt(e.target.dataset.preset);
    if (!seconds) return;

    setInputDuration(seconds * 1000);
  }

  // ============================================
  // Stopwatch UI Functions
  // ============================================
  function updateStopwatchDisplay(elapsed) {
    const time = formatTimeMs(elapsed);
    elements.stopwatchDisplay.innerHTML = `${time.main}<span class="text-4xl text-gray-400">.${time.ms}</span>`;
  }

  function renderLaps(laps) {
    if (laps.length === 0) {
      elements.lapContainer.classList.add('hidden');
      return;
    }

    elements.lapContainer.classList.remove('hidden');

    // Render in reverse order (newest first)
    const html = [...laps].reverse().map(lap => {
      const split = formatTimeMs(lap.split);
      const total = formatTimeMs(lap.total);
      return `
        <div class="flex justify-between items-center p-2 bg-gray-800 rounded">
          <span class="text-gray-400">Lap ${lap.number}</span>
          <span class="font-mono">${split.main}.${split.ms}</span>
          <span class="text-gray-500 text-sm">${total.main}.${total.ms}</span>
        </div>
      `;
    }).join('');

    elements.lapList.innerHTML = html;
  }

  // ============================================
  // Stopwatch Event Handlers
  // ============================================
  function handleSwStart() {
    // Create stopwatch if not exists
    if (!stopwatch) {
      stopwatch = createStopwatch(updateStopwatchDisplay);
    }

    stopwatch.start();

    // Update buttons
    elements.btnSwStart.classList.add('hidden');
    elements.btnSwPause.classList.remove('hidden');
    elements.btnSwLap.classList.remove('hidden');
  }

  function handleSwPause() {
    if (!stopwatch) return;

    if (stopwatch.isPaused()) {
      // Resume
      stopwatch.resume();
      elements.btnSwPause.textContent = 'Pause';
      elements.btnSwPause.className = 'px-8 py-4 rounded-lg bg-yellow-600 text-white font-bold text-lg min-h-[44px] min-w-[100px] transition-all hover:bg-yellow-500 active:scale-95';
    } else {
      // Pause
      stopwatch.pause();
      elements.btnSwPause.textContent = 'Resume';
      elements.btnSwPause.className = 'px-8 py-4 rounded-lg bg-green-600 text-white font-bold text-lg min-h-[44px] min-w-[100px] transition-all hover:bg-green-500 active:scale-95';
    }
  }

  function handleSwLap() {
    if (!stopwatch) return;

    stopwatch.lap();
    renderLaps(stopwatch.getLaps());
  }

  function handleSwReset() {
    if (stopwatch) {
      stopwatch.reset();
    }

    // Reset UI
    updateStopwatchDisplay(0);
    elements.btnSwStart.classList.remove('hidden');
    elements.btnSwPause.classList.add('hidden');
    elements.btnSwPause.textContent = 'Pause';
    elements.btnSwPause.className = 'px-8 py-4 rounded-lg bg-yellow-600 text-white font-bold text-lg min-h-[44px] min-w-[100px] transition-all hover:bg-yellow-500 active:scale-95 hidden';
    elements.btnSwLap.classList.add('hidden');
    elements.lapContainer.classList.add('hidden');
    elements.lapList.innerHTML = '';
  }

  function handleSwExport() {
    if (!stopwatch) return;

    const laps = stopwatch.getLaps();
    if (laps.length === 0) return;

    const csv = exportLapsToCSV(laps);

    // Copy to clipboard
    navigator.clipboard.writeText(csv).then(() => {
      console.log('Laps copied to clipboard!');
      // Brief visual feedback
      const btn = document.getElementById('btn-sw-export');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = originalText, 1500);
      }
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  // ============================================
  // Fullscreen Mode
  // ============================================
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  function updateFullscreenIcon() {
    const iconExpand = document.getElementById('icon-expand');
    const iconCompress = document.getElementById('icon-compress');

    if (document.fullscreenElement) {
      iconExpand.classList.add('hidden');
      iconCompress.classList.remove('hidden');
    } else {
      iconExpand.classList.remove('hidden');
      iconCompress.classList.add('hidden');
    }
  }

  // ============================================
  // Tab Switching
  // ============================================
  function switchToTimer() {
    currentMode = 'timer';
    elements.timerMode.classList.remove('hidden');
    elements.stopwatchMode.classList.add('hidden');
    elements.tabTimer.className = 'px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold min-h-[44px] transition-all hover:bg-blue-500';
    elements.tabStopwatch.className = 'px-6 py-3 rounded-lg bg-gray-700 text-gray-300 font-semibold min-h-[44px] transition-all hover:bg-gray-600';
  }

  function switchToStopwatch() {
    currentMode = 'stopwatch';
    elements.timerMode.classList.add('hidden');
    elements.stopwatchMode.classList.remove('hidden');
    elements.tabTimer.className = 'px-6 py-3 rounded-lg bg-gray-700 text-gray-300 font-semibold min-h-[44px] transition-all hover:bg-gray-600';
    elements.tabStopwatch.className = 'px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold min-h-[44px] transition-all hover:bg-blue-500';
  }

  // ============================================
  // Initialize
  // ============================================
  function init() {
    // Tab events
    elements.tabTimer.addEventListener('click', switchToTimer);
    elements.tabStopwatch.addEventListener('click', switchToStopwatch);

    // Timer control events
    elements.btnStart.addEventListener('click', handleStart);
    elements.btnPause.addEventListener('click', handlePause);
    elements.btnReset.addEventListener('click', handleReset);

    // Stopwatch control events
    elements.btnSwStart.addEventListener('click', handleSwStart);
    elements.btnSwPause.addEventListener('click', handleSwPause);
    elements.btnSwLap.addEventListener('click', handleSwLap);
    elements.btnSwReset.addEventListener('click', handleSwReset);

    // Export button (if exists)
    const btnExport = document.getElementById('btn-sw-export');
    if (btnExport) {
      btnExport.addEventListener('click', handleSwExport);
    }

    // Fullscreen button
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', toggleFullscreen);
    }

    // Fullscreen change event
    document.addEventListener('fullscreenchange', updateFullscreenIcon);

    // Preset events
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', handlePreset);
    });

    // Input validation - prevent invalid values
    [elements.inputHours, elements.inputMinutes, elements.inputSeconds].forEach(input => {
      input.addEventListener('change', () => {
        const max = input.id === 'input-hours' ? 99 : 59;
        const val = parseInt(input.value) || 0;
        input.value = Math.max(0, Math.min(max, val));
      });
    });

    console.log('Timer & Stopwatch initialized');
    console.log('Run TimerTests.runAll() or StopwatchTests.runAll() to verify');
  }

  // Start app
  init();
})();
