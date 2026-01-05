# Day 4 - Timer & Stopwatch: All Prompts Used

## 1. CLAUDE.md Generation

```
Read: docs/PRD.md

Based on this PRD, generate CLAUDE.md following Anthropic best practices:

## Project: Timer & Stopwatch

### Tech Stack
[Extract from PRD]

### Commands
- Open: open index.html
- Test: Browser console + manual timing tests

### Development Workflow
CRITICAL: Follow Phase-based workflow:
1. Complete each phase fully
2. Test in browser
3. Commit if tests pass
4. Update IMPLEMENTATION.md
5. Continue to next phase

DO NOT skip testing.
DO NOT commit failing code.

### Git Workflow
Branch Strategy:
- feature/[name] for new features
- fix/[name] for bug fixes

Commit Format:
- feat: [description]
- fix: [description]
- test: [description]

Before ANY commit:
YOU MUST:
- Test timer accuracy (60 seconds = exactly 60s)
- Test keyboard shortcuts work
- Test tab switching maintains time
- No console errors

### Testing Requirements
Tests FIRST approach:

Write tests for:
- Timer accuracy (no drift over 1 hour)
- requestAnimationFrame usage (not setInterval)
- Tab visibility handling
- Keyboard shortcuts (Space, R, Esc, F)
- Alarm triggers at 0:00
- Desktop notifications
- LocalStorage (save/load state)
- Stopwatch millisecond precision

Test components:
- timer.js: countdown logic, rAF
- stopwatch.js: count up logic, laps
- audio.js: Web Audio API
- storage.js: LocalStorage operations

NEVER:
- Use setInterval for timing
- Trust tick counts (causes drift)
- Skip rAF cleanup

### Code Conventions
[Extract from PRD]

### Critical Rules
[Extract from PRD CRITICAL RULES]

Keep under 60 lines.
Strong keywords: IMPORTANT, YOU MUST, NEVER, ALWAYS, CRITICAL.

Save to: CLAUDE.md
```

---

## 2. IMPLEMENTATION.md Creation

```
Read:
- docs/PRD.md
- CLAUDE.md

Create detailed implementation plan:

Format as checklist:
## Phase 1: [Name]
- [ ] Task 1
- [ ] Task 2
- [ ] Test: [what to verify]

## Phase 2: [Name]
- [ ] Task 1
- [ ] Task 2
- [ ] Test: [what to verify]

Include:
- All phases from PRD Implementation Sequence
- TDD steps for each phase
- Specific test cases
- Time estimate per phase

Save to: docs/IMPLEMENTATION.md

STOP after saving.
Show me the plan.
```

---

## 3. Co-pilot AI Review (Korean)

```
나 지금 Timer & Stopwatch 앱 만들려고 구현 계획 짰어.
이 계획 검토해주고 놓친 거 있으면 알려줘.

특히:
- requestAnimationFrame 정확도 이슈
- 탭 전환 시 시간 추적
- 배터리/성능 최적화
- 키보드 단축키 충돌
- Web Audio API 호환성
- 놓친 엣지케이스

간단하게 피드백 줘.
/docs/IMPLEMENTATION.md 참조해.
```

---

## 4. Feedback Application

```
피드백 반영해서 IMPLEMENTATION.md 업데이트해줘
```

---

## 5. Git Initialization

```
Initialize Git repository:

1. git init

2. Create .gitignore:
   - .DS_Store
   - node_modules/
   - *.log

3. Initial commit:
   git add docs/
   git add CLAUDE.md
   git commit -m "docs: Initial project setup with PRD and reviewed implementation plan"

4. Show status
```

---

## 6. Phase 1 Execution

```
Read: docs/IMPLEMENTATION.md

Start Phase 1.

TDD approach:
- Implement as planned
- Test in browser
- STOP after Phase 1 complete
```

---

## 7. Phase 1 Commit & Phase 2 Start

```
Phase 1 커밋하고 Phase 2 시작해줘
```

---

## 8. Phase 2 Commit & Phase 3 Start

```
Phase 2 커밋하고 IMPLEMENTATION.md 업데이트하고 phase3시작해줘..
```

---

## 9. Phase 3 Commit & Phase 4 Start

```
Phase 3 커밋하고 Phase 4 시작해줘
```

---

## 10. IMPLEMENTATION.md Update & Phase 4 Commit

```
IMPLEMENTATION.md 업데이트부터해줘 . 커밋하고 다음 진행해줘
```

---

## 11. Prompts Documentation

```
List all prompts I used today from start to finish.

Include:
1. PRD creation
2. CLAUDE.md generation
3. IMPLEMENTATION.md creation
4. Co-pilot AI review feedback application
5. Git initialization
6. All implementation phases
7. Everything

Chronological order.
Save to: docs/PROMPTS-DAY4.md
```

---

## Summary

| Step | Action |
|------|--------|
| 1 | CLAUDE.md 생성 |
| 2 | IMPLEMENTATION.md 생성 |
| 3 | Co-pilot AI 리뷰 (한국어) |
| 4 | 피드백 반영 |
| 5 | Git 초기화 |
| 6 | Phase 1 실행 |
| 7 | Phase 1 커밋 + Phase 2 시작 |
| 8 | Phase 2 커밋 + Phase 3 시작 |
| 9 | Phase 3 커밋 + Phase 4 시작 |
| 10 | Phase 4 커밋 + Phase 5 진행 |
| 11 | 프롬프트 문서화 |

**Total Prompts: 11**
