# Timer & Stopwatch - CLAUDE.md

## Tech Stack
- HTML5, Tailwind CSS (CDN), Vanilla JS (ES6+)
- Web Audio API, Notification API, LocalStorage
- Modules: app.js, timer.js, stopwatch.js, audio.js, storage.js

## Commands
- Open: `start index.html`
- Test: Browser console + manual timing tests

## Development Workflow
CRITICAL: Phase-based workflow:
1. Complete each phase fully
2. Test in browser
3. Commit if tests pass
4. Update IMPLEMENTATION.md
5. Continue to next phase

DO NOT skip testing. DO NOT commit failing code.

## Git Workflow
Branches: `feature/[name]`, `fix/[name]`
Commits: `feat:`, `fix:`, `test:`, `docs:`

Before ANY commit YOU MUST:
- Test timer accuracy (60 seconds = exactly 60s)
- Test keyboard shortcuts work
- Test tab switching maintains time
- No console errors

## Testing Requirements
IMPORTANT: Tests FIRST approach

Test coverage:
- Timer accuracy (no drift over 1 hour)
- requestAnimationFrame usage (NOT setInterval)
- Tab visibility handling
- Keyboard: Space, R, Esc, F, L, +/-
- Alarm triggers at 0:00
- Desktop notifications with permission
- LocalStorage save/load state
- Stopwatch millisecond precision

## Code Conventions
- Use requestAnimationFrame for all timing
- Track actual elapsed time via Date.now()/performance.now()
- Cancel rAF on pause/stop
- Large readable display (min 44px touch targets)
- Dark mode default

## Critical Rules
ALWAYS:
- Calculate time from timestamps (not ticks)
- Clean up requestAnimationFrame
- Handle tab visibility changes
- Request notification permission before use

NEVER:
- Use setInterval for timing (causes drift)
- Trust tick counts
- Block main thread
- Auto-play alarm without user action
- Skip rAF cleanup
