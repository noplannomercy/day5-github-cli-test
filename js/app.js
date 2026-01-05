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
    // Reset UI to input state
    showTimerInput();
    elements.btnStart.classList.remove('hidden');
    elements.btnPause.classList.add('hidden');

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
    console.log('Run TimerTests.runAll() to verify timer logic');
  }

  // Start app
  init();
})();
