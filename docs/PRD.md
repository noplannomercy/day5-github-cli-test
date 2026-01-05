# Timer & Stopwatch - Product Requirements Document

## Project Overview

**Name:** Minimalist Timer & Stopwatch  
**Type:** Single Page Application  
**Target:** Productivity users, students, athletes  
**Timeline:** Day 4 (40-50 minutes)

---

## WHAT (Tech Stack)

**Frontend:**
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (ES6+)

**APIs:**
- Web Audio API (alarm sounds)
- Notification API (desktop alerts)

**Storage:**
- LocalStorage API

**Structure:**
- Single HTML file
- Modular JS (app.js, timer.js, stopwatch.js, audio.js, storage.js)
- No build tools

---

## WHY (Purpose & Goals)

**Primary Goal:**  
Provide distraction-free time tracking for focus and productivity

**Target Users:**
- Students studying (Pomodoro)
- Athletes timing workouts
- Professionals managing time blocks
- Anyone needing simple time tracking

**Key Differentiators:**
- Minimalist, clean UI
- Keyboard-driven
- Pomodoro built-in
- Custom presets
- Desktop notifications

---

## HOW (Features & Requirements)

### 1. Core Modes

**Countdown Timer:**
- Set hours, minutes, seconds
- Start, Pause, Resume, Reset
- Visual progress (circular or linear)
- Alarm when complete
- Desktop notification

**Stopwatch:**
- Start, Pause, Resume, Reset
- Lap times (split times)
- Display: HH:MM:SS.ms
- Export lap times

**Dual Mode:**
- Switch between timer/stopwatch
- Preserve state when switching
- Clear mode indicator

### 2. User Interface

**Layout Structure:**
```
[Header: Timer / Stopwatch toggle]

[Mode Tabs]
[⏱️ Timer] [⏲️ Stopwatch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIMER MODE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Time Input]
┌───┐ ┌───┐ ┌───┐
│ 25│:│ 00│:│ 00│  (HH:MM:SS)
└───┘ └───┘ └───┘

[Large Display]
┌─────────────────────────────┐
│                             │
│        25:00                │
│    (huge, centered)         │
│                             │
└─────────────────────────────┘

[Progress Ring or Bar]
████████████░░░░░░░░  60%

[Controls]
[▶️ Start] [⏸️ Pause] [🔄 Reset]

[Quick Presets]
[5 min] [10 min] [15 min] [25 min Pomodoro] [Custom]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STOPWATCH MODE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Large Display]
┌─────────────────────────────┐
│                             │
│      00:12:34.56            │
│                             │
└─────────────────────────────┘

[Controls]
[▶️ Start] [⏸️ Pause] [↩️ Lap] [🔄 Reset]

[Lap Times]
Lap 3: 00:04:15.23
Lap 2: 00:04:12.10
Lap 1: 00:04:07.23
Total: 00:12:34.56

[Export Laps]
```

**UI Requirements:**
- Fullscreen option
- Dark mode default
- Minimal distractions
- Large, readable numbers
- Smooth animations
- Keyboard shortcuts

### 3. Timer Logic

**Countdown Timer:**
```javascript
// Precision timing
let startTime;
let targetTime;
let rafId;

function tick() {
  const now = Date.now();
  const remaining = targetTime - now;
  
  if (remaining <= 0) {
    // Timer complete
    triggerAlarm();
    showNotification();
    return;
  }
  
  updateDisplay(remaining);
  rafId = requestAnimationFrame(tick);
}
```

**Key Requirements:**
- Use requestAnimationFrame (not setInterval)
- Accurate to 1 second
- Survive tab switching (track actual time)
- No drift over long periods

**Stopwatch:**
```javascript
// High precision
let startTime;
let elapsed = 0;
let laps = [];

function tick() {
  const now = performance.now();
  const current = elapsed + (now - startTime);
  
  updateDisplay(current);
  rafId = requestAnimationFrame(tick);
}
```

**Requirements:**
- Millisecond precision
- Accurate lap splits
- No drift

### 4. Keyboard Shortcuts

**Global:**
- `Space`: Start/Pause
- `R`: Reset
- `Esc`: Stop + Reset
- `F`: Fullscreen toggle
- `D`: Dark mode toggle

**Timer:**
- `1-5`: Quick presets (5, 10, 15, 25, custom)
- `+/-`: Add/subtract 1 minute

**Stopwatch:**
- `L`: Lap time
- `E`: Export laps

**Visual Indicator:**
- Show keyboard hints on hover
- Help panel (toggle with `?`)

### 5. Alarm & Notifications

**Alarm Sound:**
- Web Audio API
- Volume control
- Choose sound (3-5 options)
- Fade in option

**Desktop Notification:**
- Request permission on first use
- Show when timer completes
- Even if tab not focused
- Title: "Timer Complete!"
- Body: "25 minutes finished"

**Visual Alert:**
- Flash screen
- Pulse animation
- Require user action to dismiss

### 6. Presets & Customization

**Built-in Presets:**
```javascript
presets = {
  "5 min": 300,
  "10 min": 600,
  "15 min": 900,
  "25 min (Pomodoro)": 1500,
  "45 min": 2700,
  "1 hour": 3600
}
```

**Custom Presets:**
- Save current time as preset
- Name it
- Quick access
- Max 5 custom presets

**Settings:**
- Alarm sound selection
- Volume
- Desktop notifications (on/off)
- Auto-start next (Pomodoro cycles)
- Dark/light mode

### 7. Data Structure

**LocalStorage Schema:**
```javascript
{
  timer: {
    lastDuration: 1500,
    isPaused: false,
    remaining: 1200
  },
  stopwatch: {
    elapsed: 12345,
    laps: [4123, 4087, 4135],
    isPaused: true
  },
  customPresets: [
    {name: "My Study", seconds: 3000}
  ],
  settings: {
    alarmSound: "gentle",
    volume: 0.7,
    notifications: true,
    darkMode: true,
    autoStart: false
  }
}
```

---

## File Structure

```
day4-timer-stopwatch/
├── index.html       
├── js/
│   ├── app.js       # Main logic
│   ├── timer.js     # Timer logic
│   ├── stopwatch.js # Stopwatch logic
│   ├── audio.js     # Sound handling
│   └── storage.js   # LocalStorage
├── sounds/
│   ├── gentle.mp3
│   ├── bell.mp3
│   └── chime.mp3
└── docs/
    ├── PRD.md
    ├── IMPLEMENTATION.md
    └── PROMPTS-DAY4.md
```

---

## Implementation Sequence

**Phase 1: Basic Timer (12 min)**
1. HTML structure (tabs, input, display)
2. Timer logic (countdown with rAF)
3. Start/Pause/Reset controls
4. Display updates

**Phase 2: Stopwatch (10 min)**
5. Stopwatch logic (count up with rAF)
6. Lap times functionality
7. Lap display
8. Reset

**Phase 3: UI Polish (10 min)**
9. Progress indicator (circular/linear)
10. Fullscreen mode
11. Dark mode styling
12. Smooth animations

**Phase 4: Keyboard Shortcuts (8 min)**
13. Global shortcuts (Space, R, Esc)
14. Mode-specific shortcuts
15. Help panel (?)
16. Visual hints

**Phase 5: Alarm & Presets (10 min)**
17. Web Audio alarm
18. Desktop notifications
19. Quick presets
20. Custom presets
21. Settings panel

---

## CRITICAL RULES

**IMPORTANT:**
- Timing MUST use requestAnimationFrame (not setInterval)
- Timer MUST be accurate (survive tab switching)
- Keyboard shortcuts MUST work globally
- Notifications MUST request permission
- Display MUST be large and readable

**YOU MUST:**
- Track actual elapsed time (not ticks)
- Handle tab visibility changes
- Test accuracy over 1 hour
- Support millisecond precision for stopwatch
- Cancel rAF on pause/stop

**NEVER:**
- Use setInterval for timing
- Trust tick counts (drift occurs)
- Block main thread
- Auto-play alarm without permission
- Make tiny buttons (mobile)

**ALWAYS:**
- Calculate time from timestamps
- Clean up requestAnimationFrame
- Show keyboard shortcuts
- Provide visual feedback
- Test on mobile (portrait/landscape)

---

## Success Criteria

**Functional:**
- [ ] Timer counts down accurately
- [ ] Stopwatch counts up with ms precision
- [ ] Keyboard shortcuts all work
- [ ] Alarm plays at timer end
- [ ] Notifications appear
- [ ] Presets save and load
- [ ] Fullscreen works

**Non-Functional:**
- [ ] No time drift (1 hour test)
- [ ] Works when tab inactive
- [ ] Smooth animations (60fps)
- [ ] Large, readable display
- [ ] Clean, minimal UI
- [ ] Mobile responsive

---

## Testing Checklist

**Timer Accuracy:**
- [ ] Set 1 minute, verify exactly 60 seconds
- [ ] Set 25 minutes, verify accurate
- [ ] Switch tabs mid-timer, returns accurate
- [ ] Pause/resume maintains accuracy
- [ ] Long duration (1 hour) no drift

**Stopwatch Accuracy:**
- [ ] Millisecond precision
- [ ] Lap times accurate
- [ ] Long duration no drift
- [ ] Pause/resume maintains time

**Keyboard Shortcuts:**
- [ ] Space starts/pauses
- [ ] R resets
- [ ] Esc stops and resets
- [ ] F toggles fullscreen
- [ ] L records lap (stopwatch)
- [ ] Help panel (?) works

**Alarm & Notifications:**
- [ ] Alarm plays at timer end
- [ ] Volume control works
- [ ] Desktop notification appears
- [ ] Notification when tab inactive
- [ ] Permission requested properly

**Edge Cases:**
- [ ] Browser tab inactive during countdown
- [ ] System sleep/wake
- [ ] Multiple tabs open
- [ ] Rapid start/pause clicking
- [ ] Zero duration input
- [ ] Invalid input handling

---

## Bonus Features (If Time)

- [ ] Pomodoro auto-cycle (work → break)
- [ ] Session history (completed timers)
- [ ] Sound options (3-5 sounds)
- [ ] Export stopwatch laps as CSV
- [ ] Timer title/label input
- [ ] Multiple simultaneous timers