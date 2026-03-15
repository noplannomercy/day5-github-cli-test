# Vanilla JS E2E 테스트 가이드

`playwright-cli` (탐색) + `@playwright/test` (spec 실행) 기반. MCP 미사용.

---

## 도구 개요

| 도구 | 역할 |
|------|------|
| `playwright-cli` | 브라우저를 CLI로 조작해서 앱 탐색 / 셀렉터 파악 |
| `@playwright/test` | spec 파일 작성 및 테스트 실행 프레임워크 |
| `serve` | Vanilla JS 앱을 로컬 서버로 띄워주는 도구 |

> **왜 MCP 안 쓰나?**
> MCP playwright 툴은 스키마 오버헤드가 크다.
> `playwright-cli`는 CLI 명령어 한 줄로 동일한 탐색이 가능하고 토큰 효율이 높다.

---

## 작업 순서

### 1단계: 패키지 초기화 및 설치

```bash
npm init -y
npm install --save-dev @playwright/test serve
npx playwright install chromium
```

> `playwright-cli`는 전역 설치 (이미 설치됐으면 skip)
> ```bash
> npm install -g playwright-cli
> ```

**설치한 것들:**
- `@playwright/test` — `test()`, `expect()` 로 spec 파일 작성 및 실행
- `serve` — `index.html` 있는 폴더를 로컬 웹서버로 띄워줌 (Vanilla JS 모듈은 파일 직접 열기 불가)
- `playwright-cli` — 브라우저를 headless로 열고 CLI로 조작하는 탐색 도구

---

### 2단계: playwright.config.js 작성

```js
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',  // 프로젝트마다 포트 다르게 설정
    headless: true,
  },
  webServer: {
    command: 'npx serve -p 3000 --no-port-switching .',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,  // 이미 서버가 떠 있으면 재사용
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

**핵심 설정:**
- `baseURL` — 테스트에서 `page.goto('/')` 하면 이 URL로 이동
- `webServer` — `npm test` 실행 시 serve 서버를 자동으로 띄움 (별도 터미널 불필요)

> **포트 충돌 주의**: 여러 프로젝트를 동시에 띄우면 포트가 겹칠 수 있다.
> ```bash
> netstat -ano | grep "LISTEN" | grep ":300"  # 사용 중인 포트 확인
> ```

---

### 3단계: package.json scripts 추가

```json
"scripts": {
  "test": "playwright test",
  "serve": "serve -p 3000 --no-port-switching"
}
```

- `npm test` → 서버 자동 시작 + 테스트 실행 + 결과 출력 한 번에
- `npm run serve` → 서버만 단독으로 띄울 때

---

### 4단계: CLAUDE.md 작성

프로젝트 개요, 스택, 명령어, 셀렉터 주의사항, 테스트 코드 규칙 작성.
다음 세션에서 Claude가 이 파일을 읽고 컨텍스트를 파악하는 용도.

---

### 5단계: 앱 탐색 (playwright-cli)

`playwright-cli`로 브라우저를 직접 열고 UI 구조를 파악한다.
**코드만 보고 테스트를 작성하면 안 되는 이유:**
- 실제 셀렉터(ID, role, 버튼 이름)를 확인해야 함
- 어떤 UI가 언제 나타나는지 동작 순서 파악 필요
- 코드만 읽으면 모르는 숨겨진 동작이 있음 (예: Lap 버튼은 START 후에만 나타남)

```bash
# 서버가 아직 안 떠 있으면 먼저 실행
npx serve -p 3000 --no-port-switching .

# 브라우저 열기
playwright-cli -s=myapp open http://localhost:3000

# 현재 페이지 구조를 yml 파일로 출력 → 읽어서 ref 파악
playwright-cli -s=myapp snapshot

# 요소 클릭 (snapshot의 ref 사용)
playwright-cli -s=myapp click e17       # 버튼 클릭
playwright-cli -s=myapp fill e22 "5"    # 입력 필드 채우기

# 탐색 후 닫기
playwright-cli -s=myapp close
```

**snapshot 읽는 법:**

```yaml
# .playwright-cli/page-xxx.yml
- button "START" [ref=e31]           ← getByRole('button', {name:'START'}) 또는 #btn-start
- spinbutton [ref=e24]: "25"         ← input[type=number], 현재값 25
- button "Lap (L)" [ref=e48]         ← 이 버튼이 보이면 실행 중이라는 뜻
- generic [ref=e40]: 00:00.00        ← 텍스트 표시 영역
```

---

### 6단계: 테스트케이스 식별 → 승인

탐색 결과를 바탕으로 **LLM 판단 기준**을 적용해 테스트할 케이스를 선별한다.
전부 다 테스트하는 게 아니라, 가치 있는 것만 골라낸다.

### LLM 판단 기준

**테스트 작성 여부**
- 작성: 비즈니스 로직, 상태 전환, 데이터 저장/복원, 경계값 처리, 다단계 플로우
- 생략: 시각적 스타일·애니메이션, 예측 불가 출력, 정적 콘텐츠 표시

**인증 최적화**
- 인증이 필요한 테스트가 3개 이상이면 → 매번 로그인 금지, `storageState` 패턴 사용
- 로그인/로그아웃 플로우 테스트 자체는 직접 로그인 (storageState 미사용)
- 여러 역할(admin, user)이 필요하면 역할별로 auth 파일 분리

**셀렉터 전략**
- ID 있음 → ID 셀렉터 우선
- ID 없음 → `getByRole` → 클래스/data 속성 순으로 판단

**waitForTimeout 사용 여부**
- 필수: 비동기 상태 변화, 애니메이션 완료 후 결과 읽기
- 생략: 클릭 즉시 반영되는 동기 상태 변경

---

선별 후 표로 정리해 승인 받고 spec 작성 시작.

| 기능 | 케이스 | 판단 |
|------|--------|------|
| ... | START → 동작 시작 | 작성 — 상태 변경 |
| ... | PAUSE → 정지 | 작성 — 상태 변경 |
| ... | 데이터 영속성 | 작성 — localStorage |
| ... | 애니메이션 효과 | 생략 — 스타일 |

---

### 6.5단계: 판단 로그 작성 (TEST-DECISIONS.md)

spec 작성 전, LLM이 어떤 판단으로 테스트를 선별했는지 루트에 기록한다.
**생략된 항목까지 남겨야** 나중에 "왜 이걸 안 테스트했지?" 추적 가능.

```markdown
# TEST-DECISIONS.md

## 탐색한 기능 목록

| 기능 | 판단 | 근거 |
|------|------|------|
| START → 카운트다운 시작 | 작성 | 상태 전환 |
| PAUSE → 시간 정지 | 작성 | 상태 전환 |
| RESET → 초기값 복원 | 작성 | 상태 전환 |
| 프리셋 버튼 클릭 | 작성 | 비즈니스 로직 (입력값 변경) |
| 애니메이션 효과 | 생략 | 시각적 스타일 |
| 버튼 색상/크기 | 생략 | 시각적 스타일 |

## 적용한 판단 기준

- 상태 전환 → 작성
- 비즈니스 로직 → 작성
- 시각적 스타일·애니메이션 → 생략
```

---

### 7단계: spec 파일 작성

```js
// @ts-check
const { test, expect } = require('@playwright/test');

// 헬퍼 함수 — JSDoc 타입 필수
/** @param {import('@playwright/test').Page} page */
async function someHelper(page) {
  await page.click('#some-btn');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());  // localStorage 사용 앱이면 필수
  await page.reload();
});
```

#### 인증 있는 앱 — storageState 패턴

인증 필요 테스트가 3개 이상이면 `beforeAll`로 한 번만 로그인하고 세션을 재사용한다.

```ts
import { test, expect } from '@playwright/test'

const ADMIN = { email: 'admin@test.com', password: 'password123' }

// ── 1. 세션 저장 (파일 최상단, describe 밖)
test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext()
  const p = await ctx.newPage()
  await p.goto('/login')
  await p.fill('input[name="email"]', ADMIN.email)
  await p.fill('input[name="password"]', ADMIN.password)
  await p.click('button[type="submit"]')
  await p.waitForURL('/')
  await ctx.storageState({ path: '.auth/admin.json' })
  await ctx.close()
})

// ── 2. 인증 필요 테스트 전체에 적용
test.use({ storageState: '.auth/admin.json' })

// ── 3. 로그인/로그아웃 테스트는 별도 describe로 분리 (빈 세션)
test.describe('로그인 플로우', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('로그인 성공 → /dashboard 이동', async ({ page }) => { ... })
  test('로그인 실패 → 에러 표시', async ({ page }) => { ... })
  test('로그아웃 → /login 이동', async ({ page }) => { ... })
})

// ── 4. 나머지 테스트는 storageState 자동 적용 (로그인 불필요)
test('대시보드 표시', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible()
})
```

> `.auth/` 폴더는 `.gitignore`에 추가 (`**/.auth/`)

---

### 8단계: 실행 및 검증

```bash
npm test                          # 전체 실행
npx playwright test --grep "키워드"  # 특정 테스트만
npx playwright test --ui           # UI 모드 (시각적 확인)
npx playwright show-report         # HTML 리포트
```

---

## 테스트 코드 규칙

- 헬퍼 함수 파라미터에 JSDoc 타입 필수
- `beforeEach`에서 항상 `page.goto('/')` 로 초기 상태 보장
- localStorage 사용 앱: `page.evaluate(() => localStorage.clear())` + `page.reload()` 필수
- ID 셀렉터(`#btn-start`) 우선, 없으면 `getByRole` 사용, 없으면 클래스/data 속성

---

## 자주 쓰는 검증 패턴

```js
// 시간/값 변화 검증
await page.click('#btn-start');
await page.waitForTimeout(1500);
await expect(page.locator('#display')).not.toHaveText('초기값');

// 동작 정지 검증 (before/after 비교)
const before = await locator.textContent();
await page.waitForTimeout(1000);
const after = await locator.textContent();
expect(before).toBe(after);

// 랜덤 결과 → 특정 값 말고 범위로 검증
const total = parseInt(await page.locator('#total').textContent() ?? '0');
expect(total).toBeGreaterThanOrEqual(1);
expect(total).toBeLessThanOrEqual(20);

// 클리어 후 빈 상태 → count 말고 메시지 텍스트로 검증
// (클리어 후 placeholder <p> 요소가 1개 남는 패턴 주의)
await expect(page.locator('#list-container')).toContainText('No items yet');

// 숨김/표시 검증
await expect(page.locator('#btn-lap')).toBeHidden();
await expect(page.locator('#result-section')).toBeVisible();

// 입력값 검증
await expect(page.locator('#input-minutes')).toHaveValue('25');

// data 속성 셀렉터 (ID 없을 때)
await page.locator('[data-dice="d6"][data-action="increase"]').click();

// 클래스 셀렉터 (ID 없을 때)
await page.locator('.note-more-btn').click();

// 애니메이션 대기 — 애니메이션 시간 확인 후 여유분 추가
await page.waitForTimeout(800);  // 500ms 애니메이션이면 800ms 대기
```

---

## 흔한 실수와 해결법

| 실수 | 원인 | 해결 |
|------|------|------|
| `getByRole('button', { name: '5 min' })` 이 여러 개 매칭 | "5 min"이 "15 min" 안에 포함됨 | `{ exact: true }` 추가 |
| RESUME 클릭이 timeout | RESUME 버튼이 따로 없고 PAUSE 버튼 텍스트만 바뀜 | JS 코드 확인 후 같은 버튼 재클릭 |
| 요소가 hidden이라 클릭 불가 | 특정 동작 후에만 나타나는 UI | 선행 동작(START 등) 먼저 수행 |
| 클리어 후 `toHaveCount(0)` 실패 | 클리어 후 빈 상태 placeholder 요소가 남음 | count 대신 텍스트 검증 |
| Coin Flip / 애니메이션 후 텍스트 못 읽음 | 애니메이션 완료 전에 읽음 | 애니메이션 시간 확인 후 `waitForTimeout` 충분히 |
| 컨텍스트 메뉴 동작 후 ID가 null | hide 함수가 ID를 먼저 null로 만듦 | ID를 변수에 저장한 뒤 hide 호출 |

---

## 앱 버그를 테스트가 잡아내는 경우

> day5 note-taker 실제 사례

컨텍스트 메뉴 복제(`#ctx-duplicate-note`) 클릭 테스트가 실패.
원인: `hideNoteContextMenu()` 내부에서 `contextMenuNoteId = null` 처리 후
`getNote(contextMenuNoteId)` 호출 → 항상 `null` 반환 → 복제 미동작.

```js
// 버그 코드
function handleCtxDuplicateNote() {
  if (!contextMenuNoteId) return;
  hideNoteContextMenu();          // ← 여기서 contextMenuNoteId = null
  const original = getNote(contextMenuNoteId);  // getNote(null) → undefined
  if (!original) return;          // 항상 여기서 return
}

// 수정 코드
function handleCtxDuplicateNote() {
  if (!contextMenuNoteId) return;
  const noteId = contextMenuNoteId;  // ← 먼저 저장
  hideNoteContextMenu();
  const original = getNote(noteId);
  if (!original) return;
}
```

**E2E 테스트는 이런 로직 버그를 UI 동작 수준에서 잡아낸다.**

---

## 개념 정리

### playwright-cli vs @playwright/test

| | playwright-cli | @playwright/test |
|--|---------------|-----------------|
| 용도 | 앱 탐색 / 셀렉터 파악 | 테스트 작성 / 실행 |
| 사용 시점 | spec 작성 전 (5~6단계) | spec 작성 후 (7~8단계) |
| 결과물 | snapshot yml 파일 | 테스트 통과/실패 결과 |
| 명령어 | `playwright-cli open`, `snapshot` | `npm test` |

### 5단계(탐색)와 6단계(케이스 식별)의 관계

playwright-cli snapshot은 현재 페이지의 UI 구조를 yml로 출력한다.
이 yml을 읽어서 "어떤 기능이 있는지" 파악하고 테스트케이스를 도출한다.

단, yml은 **현재 보이는 UI만** 찍힌다.
동작에 따라 바뀌는 UI(예: START 후에만 나타나는 Lap 버튼)는
직접 클릭해보면서 추가 snapshot을 찍어야 케이스를 제대로 식별할 수 있다.

```
snapshot → UI 구조 파악 ("어떤 기능이 있는지")
직접 클릭 → 동작 순서 파악 ("어떤 순서로 바뀌는지")
```

### 8단계가 테스트 자동화의 본질

1~7단계는 전부 8단계를 위한 준비다.

```
npm test  (한 줄)
    ↓
serve 서버 자동 시작
    ↓
spec 파일의 test() 전부 실행
    ↓
통과 → 배포 / 실패 → 중단
```

사람이 직접 브라우저 열고, 버튼 클릭하고, 결과 확인하던 것을
**자동으로, 반복적으로, 일관되게** 대신 해주는 것이 테스트 자동화다.

CI/CD에 붙이면 코드가 바뀔 때마다 자동으로 `npm test`를 실행해서
사람 없이 검증한다.

```yaml
# GitHub Actions 예시
- run: npm install
- run: npx playwright install chromium
- run: npm test   # ← 이게 전부
```

---

## 작업 이력

### 2026-03-14

**day5-note-taker-playwright** (port 3002) — 24개 통과
- 생성/읽기/수정/삭제/검색/핀/태그/정렬/마크다운/단축키/영속성
- 앱 버그 발견 및 수정: 컨텍스트 메뉴 3개 함수 (duplicate/pin/delete) `contextMenuNoteId` 저장 순서 버그

**day4-timer-stopwatch-playwright** (port 3003) — 18개 통과
- 타이머 START/PAUSE/RESUME/RESET/프리셋/커스텀 시간
- 스톱워치 START/PAUSE/RESUME/RESET/LAP
- 공통: 탭 전환 상태 유지, 단축키 Space/R
- 이슈: `{ exact: true }` 부분 텍스트 매칭, RESUME = PAUSE 버튼 텍스트 변경

**day3-dice-roller-playwright** (port 3004) — 17개 통과
- 주사위 선택/감소/초기화, 롤 결과 범위 검증, Modifier
- Advantage/Disadvantage, Quick Presets, 히스토리, Coin Flip
- 이슈: 클리어 후 placeholder 텍스트 존재, 애니메이션 대기 시간 조정
