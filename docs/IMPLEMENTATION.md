# Timer & Stopwatch - Implementation Plan

## Overview
- **Total Time:** 40-50 minutes
- **Approach:** TDD (Tests First)
- **Critical:** Use requestAnimationFrame, NOT setInterval

---

## Phase 1: Basic Timer (12 min)

### Setup
- [ ] Create index.html with Tailwind CDN
- [ ] Create js/ folder structure
- [ ] Create empty module files (app.js, timer.js, stopwatch.js, audio.js, storage.js)

### HTML Structure
- [ ] Header with app title
- [ ] Mode tabs (Timer / Stopwatch)
- [ ] Time input fields (HH:MM:SS)
- [ ] Large time display area
- [ ] Control buttons (Start, Pause, Reset)
- [ ] Quick preset buttons area

### Timer Logic (timer.js)
- [ ] Write TimerTests suite first
- [ ] `createTimer()` - factory function with state
- [ ] `start()` - record targetTime using Date.now()
- [ ] `pause()` - store remaining time, cancel rAF
- [ ] `resume()` - recalculate targetTime from remaining
- [ ] `reset()` - clear state, cancel rAF
- [ ] `tick()` - rAF loop calculating remaining from timestamps
- [ ] `formatTime(ms)` - convert to MM:SS display
- [ ] **Performance:** Only update DOM when seconds change (not every frame)
- [ ] **Visibility:** Handle `visibilitychange` event to restart rAF on tab focus
- [ ] **Guard:** Stop at 0, prevent negative countdown

### App Integration (app.js)
- [ ] DOM element references
- [ ] Button event listeners
- [ ] `updateDisplay()` - render time to DOM
- [ ] Connect timer callbacks to UI

### Test: Phase 1 Verification
- [ ] `TimerTests.runAll()` passes in console
- [ ] Start button begins countdown
- [ ] Pause stops countdown, preserves time
- [ ] Reset clears to initial time
- [ ] Display updates smoothly (no flicker)
- [ ] 60-second timer = exactly 60 seconds (use phone stopwatch)
- [ ] **Tab switch test:** Switch tab mid-countdown, return - time still accurate
- [ ] **Zero guard:** Timer stops exactly at 0:00, no negative values
- [ ] **Sleep test:** Close laptop lid, reopen - timer shows correct remaining time

---

## Phase 2: Stopwatch (10 min)

### Stopwatch Logic (stopwatch.js)
- [ ] Write StopwatchTests suite first
- [ ] `createStopwatch()` - factory function with state
- [ ] `start()` - record startTime using performance.now()
- [ ] `pause()` - accumulate elapsed, cancel rAF
- [ ] `resume()` - new startTime, keep accumulated
- [ ] `reset()` - clear elapsed and laps
- [ ] `lap()` - record split time to laps array
- [ ] `tick()` - rAF loop with millisecond precision
- [ ] `formatTimeMs(ms)` - convert to HH:MM:SS.ms

### HTML Updates
- [ ] Stopwatch display area (shows ms)
- [ ] Lap button
- [ ] Lap times list (scrollable)
- [ ] Export laps button

### App Integration
- [ ] Tab switching logic (preserve states)
- [ ] Stopwatch button handlers
- [ ] `renderLaps()` - display lap list
- [ ] Mode state management

### Test: Phase 2 Verification
- [ ] `StopwatchTests.runAll()` passes in console
- [ ] Stopwatch counts up with milliseconds visible
- [ ] Lap button records split time
- [ ] Laps display in reverse order (newest first)
- [ ] Pause/Resume maintains accurate time
- [ ] Tab switch preserves both timer and stopwatch state
- [ ] Millisecond precision verified (compare to phone)

---

## Phase 3: UI Polish (10 min)

### Progress Indicator
- [ ] Linear progress bar for timer
- [ ] Calculate percentage: (initial - remaining) / initial
- [ ] Smooth width transition
- [ ] Color change as time decreases (green → yellow → red)

### Dark Mode
- [ ] Dark background default (bg-gray-900)
- [ ] Light text (text-white)
- [ ] Accent colors for buttons
- [ ] Contrast-safe color choices

### Large Display
- [ ] Huge font size (text-6xl or larger)
- [ ] Monospace font for numbers
- [ ] Centered layout
- [ ] Min 44px touch targets for buttons

### Animations
- [ ] Button press feedback (scale transform)
- [ ] Time change transitions
- [ ] Tab switch animation
- [ ] Completion pulse effect

### Fullscreen Mode
- [ ] Fullscreen API integration
- [ ] Toggle button in UI
- [ ] Escape to exit

### Test: Phase 3 Verification
- [ ] Progress bar moves smoothly
- [ ] Progress color changes at 50%, 25%, 10%
- [ ] Dark mode is default and readable
- [ ] All buttons have visible touch feedback
- [ ] Fullscreen toggle works (F key or button)
- [ ] Mobile responsive (320px minimum)
- [ ] No layout overflow on small screens

---

## Phase 4: Keyboard Shortcuts (8 min)

### Global Shortcuts
- [ ] `Space` - Start/Pause toggle
- [ ] `R` - Reset current mode
- [ ] `Esc` - Stop and Reset
- [ ] `F` - Fullscreen toggle
- [ ] `D` - Dark/Light mode toggle
- [ ] `M` - Switch modes (Timer/Stopwatch) ~~`Tab` conflicts with browser focus~~

### Timer-Specific
- [ ] `1` - 5 min preset
- [ ] `2` - 10 min preset
- [ ] `3` - 15 min preset
- [ ] `4` - 25 min (Pomodoro)
- [ ] `5` - 45 min preset
- [ ] `+` / `=` - Add 1 minute
- [ ] `-` - Subtract 1 minute

### Stopwatch-Specific
- [ ] `L` - Record lap
- [ ] `E` - Export laps (copy to clipboard)

### Help Panel
- [ ] `?` - Toggle help overlay
- [ ] List all shortcuts
- [ ] Semi-transparent background
- [ ] Click outside to close

### Visual Hints
- [ ] Tooltip on hover showing shortcut
- [ ] Keyboard icon indicators on buttons

### Test: Phase 4 Verification
- [ ] All global shortcuts work (Space, R, Esc, F, D, M)
- [ ] `M` switches between Timer/Stopwatch modes
- [ ] Number keys set timer presets
- [ ] +/- adjusts timer by 1 minute
- [ ] L records lap in stopwatch mode
- [ ] ? shows/hides help panel
- [ ] Shortcuts don't trigger when typing in input
- [ ] No conflicts between shortcuts
- [ ] **Accessibility:** Native Tab key focus navigation still works

---

## Phase 5: Alarm & Presets (10 min)

### Web Audio Alarm (audio.js)
- [ ] Write AudioTests suite first
- [ ] `createAudioContext()` - lazy initialization
- [ ] **Safari fallback:** `window.AudioContext || window.webkitAudioContext`
- [ ] **User gesture:** Resume AudioContext on first user click (autoplay policy)
- [ ] `playAlarm(type, volume)` - generate tone
- [ ] `stopAlarm()` - stop playback
- [ ] Volume control (0-1 range)
- [ ] Multiple sound types (beep, bell, gentle)
- [ ] **Graceful degradation:** If audio fails, still show visual alert + notification

### Desktop Notifications
- [ ] `requestNotificationPermission()` - on first timer start
- [ ] `showNotification(title, body)` - display notification
- [ ] Notification when timer completes
- [ ] Works when tab is inactive

### Timer Completion
- [ ] Trigger alarm at 0:00
- [ ] Show notification
- [ ] Visual pulse/flash effect
- [ ] Require user action to dismiss

### Quick Presets
- [ ] Preset buttons: 5, 10, 15, 25 (Pomodoro), 45 min
- [ ] Click to set timer duration
- [ ] Visual indication of selected preset

### Storage (storage.js)
- [ ] Write StorageTests suite first
- [ ] `saveState()` - persist timer/stopwatch state
- [ ] `loadState()` - restore on page load
- [ ] `saveSettings()` - volume, notifications, theme
- [ ] `loadSettings()` - restore preferences
- [ ] Handle corrupted JSON gracefully
- [ ] **Quota handling:** try-catch for localStorage.setItem (quota exceeded)
- [ ] **Feature detection:** Check localStorage availability (private browsing)

### Custom Presets
- [ ] Save current duration as preset
- [ ] Name input for preset
- [ ] Max 5 custom presets
- [ ] Delete preset option

### Test: Phase 5 Verification
- [ ] `AudioTests.runAll()` passes in console
- [ ] `StorageTests.runAll()` passes in console
- [ ] Alarm plays when timer hits 0:00
- [ ] Volume slider adjusts alarm loudness
- [ ] Notification permission requested on first use
- [ ] Notification appears when timer completes
- [ ] Notification works when tab is inactive
- [ ] Preset buttons set correct durations
- [ ] State persists after page refresh
- [ ] Settings (volume, theme) persist
- [ ] **Safari test:** Audio works in Safari (webkitAudioContext)
- [ ] **Private mode:** App works without localStorage (graceful fallback)
- [ ] **Audio fail:** Visual alert shows even if audio blocked

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
