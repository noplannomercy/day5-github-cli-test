# Timer & Stopwatch - Implementation Plan

## Overview
- **Total Time:** 40-50 minutes
- **Approach:** TDD (Tests First)
- **Critical:** Use requestAnimationFrame, NOT setInterval

---

## Phase 1: Basic Timer (12 min) ✅

### Setup
- [x] Create index.html with Tailwind CDN
- [x] Create js/ folder structure
- [x] Create empty module files (app.js, timer.js, stopwatch.js, audio.js, storage.js)

### HTML Structure
- [x] Header with app title
- [x] Mode tabs (Timer / Stopwatch)
- [x] Time input fields (HH:MM:SS)
- [x] Large time display area
- [x] Control buttons (Start, Pause, Reset)
- [x] Quick preset buttons area

### Timer Logic (timer.js)
- [x] Write TimerTests suite first
- [x] `createTimer()` - factory function with state
- [x] `start()` - record targetTime using Date.now()
- [x] `pause()` - store remaining time, cancel rAF
- [x] `resume()` - recalculate targetTime from remaining
- [x] `reset()` - clear state, cancel rAF
- [x] `tick()` - rAF loop calculating remaining from timestamps
- [x] `formatTime(ms)` - convert to MM:SS display
- [x] **Performance:** Only update DOM when seconds change (not every frame)
- [x] **Visibility:** Handle `visibilitychange` event to restart rAF on tab focus
- [x] **Guard:** Stop at 0, prevent negative countdown

### App Integration (app.js)
- [x] DOM element references
- [x] Button event listeners
- [x] `updateDisplay()` - render time to DOM
- [x] Connect timer callbacks to UI

### Test: Phase 1 Verification
- [x] `TimerTests.runAll()` passes in console
- [x] Start button begins countdown
- [x] Pause stops countdown, preserves time
- [x] Reset clears to initial time
- [x] Display updates smoothly (no flicker)
- [x] 60-second timer = exactly 60 seconds (use phone stopwatch)
- [x] **Tab switch test:** Switch tab mid-countdown, return - time still accurate
- [x] **Zero guard:** Timer stops exactly at 0:00, no negative values
- [x] **Sleep test:** Close laptop lid, reopen - timer shows correct remaining time

---

## Phase 2: Stopwatch (10 min) ✅

### Stopwatch Logic (stopwatch.js)
- [x] Write StopwatchTests suite first
- [x] `createStopwatch()` - factory function with state
- [x] `start()` - record startTime using performance.now()
- [x] `pause()` - accumulate elapsed, cancel rAF
- [x] `resume()` - new startTime, keep accumulated
- [x] `reset()` - clear elapsed and laps
- [x] `lap()` - record split time to laps array
- [x] `tick()` - rAF loop with millisecond precision
- [x] `formatTimeMs(ms)` - convert to HH:MM:SS.ms

### HTML Updates
- [x] Stopwatch display area (shows ms)
- [x] Lap button
- [x] Lap times list (scrollable)
- [x] Export laps button

### App Integration
- [x] Tab switching logic (preserve states)
- [x] Stopwatch button handlers
- [x] `renderLaps()` - display lap list
- [x] Mode state management

### Test: Phase 2 Verification
- [x] `StopwatchTests.runAll()` passes in console
- [x] Stopwatch counts up with milliseconds visible
- [x] Lap button records split time
- [x] Laps display in reverse order (newest first)
- [x] Pause/Resume maintains accurate time
- [x] Tab switch preserves both timer and stopwatch state
- [x] Millisecond precision verified (compare to phone)

---

## Phase 3: UI Polish (10 min) ✅

### Progress Indicator
- [x] Linear progress bar for timer
- [x] Calculate percentage: (initial - remaining) / initial
- [x] Smooth width transition
- [x] Color change as time decreases (green → yellow → red)

### Dark Mode
- [x] Dark background default (bg-gray-900)
- [x] Light text (text-white)
- [x] Accent colors for buttons
- [x] Contrast-safe color choices

### Large Display
- [x] Huge font size (text-6xl or larger)
- [x] Monospace font for numbers
- [x] Centered layout
- [x] Min 44px touch targets for buttons

### Animations
- [x] Button press feedback (scale transform)
- [x] Time change transitions
- [x] Tab switch animation
- [x] Completion pulse effect

### Fullscreen Mode
- [x] Fullscreen API integration
- [x] Toggle button in UI
- [x] Escape to exit

### Test: Phase 3 Verification
- [x] Progress bar moves smoothly
- [x] Progress color changes at 50%, 25%, 10%
- [x] Dark mode is default and readable
- [x] All buttons have visible touch feedback
- [x] Fullscreen toggle works (F key or button)
- [x] Mobile responsive (320px minimum)
- [x] No layout overflow on small screens

---

## Phase 4: Keyboard Shortcuts (8 min) ✅

### Global Shortcuts
- [x] `Space` - Start/Pause toggle
- [x] `R` - Reset current mode
- [x] `Esc` - Stop and Reset
- [x] `F` - Fullscreen toggle
- [ ] `D` - Dark/Light mode toggle (skipped - dark mode only)
- [x] `M` - Switch modes (Timer/Stopwatch) ~~`Tab` conflicts with browser focus~~

### Timer-Specific
- [x] `1` - 5 min preset
- [x] `2` - 10 min preset
- [x] `3` - 15 min preset
- [x] `4` - 25 min (Pomodoro)
- [x] `5` - 45 min preset
- [x] `+` / `=` - Add 1 minute
- [x] `-` - Subtract 1 minute

### Stopwatch-Specific
- [x] `L` - Record lap
- [x] `E` - Export laps (copy to clipboard)

### Help Panel
- [x] `?` - Toggle help overlay
- [x] List all shortcuts
- [x] Semi-transparent background
- [x] Click outside to close

### Visual Hints
- [ ] Tooltip on hover showing shortcut (skipped)
- [ ] Keyboard icon indicators on buttons (skipped)

### Test: Phase 4 Verification
- [x] All global shortcuts work (Space, R, Esc, F, M)
- [x] `M` switches between Timer/Stopwatch modes
- [x] Number keys set timer presets
- [x] +/- adjusts timer by 1 minute
- [x] L records lap in stopwatch mode
- [x] ? shows/hides help panel
- [x] Shortcuts don't trigger when typing in input
- [x] No conflicts between shortcuts
- [x] **Accessibility:** Native Tab key focus navigation still works

---

## Phase 5: Alarm & Presets (10 min) ✅

### Web Audio Alarm (audio.js)
- [x] Write AudioTests suite first
- [x] `createAudioContext()` - lazy initialization
- [x] **Safari fallback:** `window.AudioContext || window.webkitAudioContext`
- [x] **User gesture:** Resume AudioContext on first user click (autoplay policy)
- [x] `playAlarm(type, volume)` - generate tone
- [x] `stopAlarm()` - stop playback
- [x] Volume control (0-1 range)
- [x] Multiple sound types (beep, bell, gentle)
- [x] **Graceful degradation:** If audio fails, still show visual alert + notification

### Desktop Notifications
- [x] `requestNotificationPermission()` - on first timer start
- [x] `showNotification(title, body)` - display notification
- [x] Notification when timer completes
- [x] Works when tab is inactive

### Timer Completion
- [x] Trigger alarm at 0:00
- [x] Show notification
- [x] Visual pulse/flash effect
- [ ] Require user action to dismiss (skipped)

### Quick Presets
- [x] Preset buttons: 5, 10, 15, 25 (Pomodoro), 45 min
- [x] Click to set timer duration
- [ ] Visual indication of selected preset (skipped)

### Storage (storage.js)
- [x] Write StorageTests suite first
- [x] `saveState()` - persist timer/stopwatch state
- [x] `loadState()` - restore on page load
- [x] `saveSettings()` - volume, notifications, theme
- [x] `loadSettings()` - restore preferences
- [x] Handle corrupted JSON gracefully
- [x] **Quota handling:** try-catch for localStorage.setItem (quota exceeded)
- [x] **Feature detection:** Check localStorage availability (private browsing)

### Custom Presets
- [ ] Save current duration as preset (skipped - MVP)
- [ ] Name input for preset (skipped - MVP)
- [ ] Max 5 custom presets (skipped - MVP)
- [ ] Delete preset option (skipped - MVP)

### Test: Phase 5 Verification
- [x] `AudioTests.runAll()` passes in console
- [x] `StorageTests.runAll()` passes in console
- [x] Alarm plays when timer hits 0:00
- [x] Notification permission requested on first use
- [x] Notification appears when timer completes
- [x] Notification works when tab is inactive
- [x] Preset buttons set correct durations
- [x] State persists after page refresh
- [x] **Safari test:** Audio works in Safari (webkitAudioContext)
- [x] **Private mode:** App works without localStorage (graceful fallback)
- [x] **Audio fail:** Visual alert shows even if audio blocked

---

## Final Verification Checklist

### Accuracy Tests
- [ ] 1-minute timer = exactly 60 seconds
- [ ] 25-minute timer accurate (compare to phone)
- [ ] Stopwatch milliseconds match phone timer
- [ ] Tab switching doesn't affect accuracy
- [ ] Pause/Resume doesn't cause drift

### Edge Cases
- [ ] Rapid start/pause clicking handled
- [ ] Zero duration prevented
- [ ] Invalid input rejected (99:99:99, negative, non-numeric)
- [ ] Multiple tabs don't conflict
- [ ] Browser back/forward handled
- [ ] **System sleep/wake:** Timer accurate after laptop lid close/open
- [ ] **Long duration:** 24+ hour timer maintains accuracy
- [ ] **Many laps:** 100+ laps doesn't degrade performance
- [ ] **LocalStorage full:** Graceful handling when quota exceeded
- [ ] **Private browsing:** Works without localStorage

### Performance
- [ ] No memory leaks (rAF cleanup)
- [ ] Smooth 60fps animations
- [ ] No console errors
- [ ] Fast initial load

### Mobile
- [ ] Touch targets >= 44px
- [ ] Readable on 320px width
- [ ] Portrait and landscape work
- [ ] No horizontal scroll

---

## Test Suites Summary

Run in browser console:
```javascript
TimerTests.runAll()      // Phase 1
StopwatchTests.runAll()  // Phase 2
AudioTests.runAll()      // Phase 5
StorageTests.runAll()    // Phase 5
```

All tests must pass before commit.
