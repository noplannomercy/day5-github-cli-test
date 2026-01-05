/**
 * Storage Module - LocalStorage for state persistence
 * Handles quota errors and private browsing gracefully
 */

const StorageManager = (function() {
  const STORAGE_KEY = 'timer-stopwatch-data';

  // Feature detection
  function isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Save data with quota handling
  function save(key, data) {
    if (!isAvailable()) return false;

    try {
      const stored = load() || {};
      stored[key] = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded');
      }
      return false;
    }
  }

  // Load data with corrupted JSON handling
  function load(key) {
    if (!isAvailable()) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return key ? null : {};

      const data = JSON.parse(stored);
      return key ? data[key] : data;
    } catch (e) {
      console.warn('Corrupted storage data, clearing...');
      clear();
      return key ? null : {};
    }
  }

  // Clear all data
  function clear() {
    if (!isAvailable()) return false;

    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Save timer state
  function saveTimerState(state) {
    return save('timer', {
      lastDuration: state.duration || 0,
      timestamp: Date.now()
    });
  }

  // Load timer state
  function loadTimerState() {
    return load('timer');
  }

  // Save settings
  function saveSettings(settings) {
    return save('settings', settings);
  }

  // Load settings with defaults
  function loadSettings() {
    const defaults = {
      volume: 0.7,
      soundType: 'beep',
      notifications: true
    };
    const saved = load('settings');
    return { ...defaults, ...saved };
  }

  return {
    isAvailable,
    save,
    load,
    clear,
    saveTimerState,
    loadTimerState,
    saveSettings,
    loadSettings
  };
})();

// ============================================
// StorageTests - Run in browser console
// ============================================
const StorageTests = {
  results: [],

  assert(condition, testName) {
    this.results.push({ name: testName, passed: condition });
    console.log(condition ? `✓ ${testName}` : `✗ ${testName}`);
  },

  runAll() {
    console.log('\n=== StorageTests ===\n');
    this.results = [];

    // Test 1: StorageManager exists
    this.assert(typeof StorageManager === 'object', 'StorageManager exists');
    this.assert(typeof StorageManager.save === 'function', 'save method exists');
    this.assert(typeof StorageManager.load === 'function', 'load method exists');

    // Test 2: Availability check
    const available = StorageManager.isAvailable();
    this.assert(typeof available === 'boolean', 'isAvailable returns boolean');
    console.log(`LocalStorage available: ${available}`);

    if (!available) {
      console.log('Skipping storage tests (not available)');
      return false;
    }

    // Test 3: Save and load
    const testData = { test: 'value', num: 123 };
    const saveResult = StorageManager.save('test', testData);
    this.assert(saveResult === true, 'save returns true');

    const loadResult = StorageManager.load('test');
    this.assert(loadResult !== null, 'load returns data');
    this.assert(loadResult.test === 'value', 'loaded data matches saved');
    this.assert(loadResult.num === 123, 'loaded number matches saved');

    // Test 4: Timer state
    StorageManager.saveTimerState({ duration: 1500000 });
    const timerState = StorageManager.loadTimerState();
    this.assert(timerState !== null, 'timer state loaded');
    this.assert(timerState.lastDuration === 1500000, 'timer duration correct');

    // Test 5: Settings with defaults
    StorageManager.saveSettings({ volume: 0.5 });
    const settings = StorageManager.loadSettings();
    this.assert(settings.volume === 0.5, 'saved volume loaded');
    this.assert(settings.soundType === 'beep', 'default soundType applied');

    // Test 6: Clear
    StorageManager.clear();
    const afterClear = StorageManager.load('test');
    this.assert(afterClear === null, 'data cleared');

    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    console.log(`\n=== Results: ${passed}/${total} passed ===\n`);
    return passed === total;
  }
};
