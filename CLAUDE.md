# day5-github-cli

## 개요

GitHub CLI(`gh`)로 GitHub 작업을 수행하고 MCP 없이도 충분한지 검증하는 프로젝트.
`@playwright/test`로 테스트 구조를 유지하면서 `gh` CLI 명령어 실행 결과를 검증.

## 스택

- `gh` CLI — GitHub 작업 수행 (PR, 이슈, 코멘트 등)
- `@playwright/test` — 테스트 실행 프레임워크 (Node.js 기반 CLI 테스트)

## 명령어

```bash
npm install                   # 의존성 설치
npm test                      # 테스트 실행
npx playwright test --ui      # UI 모드
npx playwright show-report    # 리포트 보기
```

## 사전 조건

```bash
gh auth status    # 로그인 상태 확인
gh auth login     # 미로그인 시
```

## 테스트 구조

`@playwright/test`를 웹 E2E가 아닌 CLI 명령어 검증 용도로 활용.
`execSync` 또는 `child_process`로 `gh` 명령어 실행 후 결과 assert.

```js
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test('gh로 PR 목록 조회', () => {
  const result = execSync('gh pr list --json number,title --limit 5').toString();
  const prs = JSON.parse(result);
  expect(Array.isArray(prs)).toBe(true);
});
```

## 테스트 파일 위치

`tests/*.spec.js`

## 개발 원칙

- 각 테스트는 독립적으로 실행 가능해야 함
- `gh` 명령어 실행 결과는 JSON 파싱으로 검증
- 실제 GitHub 데이터를 사용하므로 네트워크 의존성 있음
