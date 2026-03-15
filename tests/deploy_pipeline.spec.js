// @ts-check
/**
 * deploy_pipeline_mcp 통합 테스트
 *
 * 테스트 전략:
 * - 실제 _run() 로직을 Python subprocess로 직접 검증
 * - MCP 서버를 JSON-RPC로 호출하여 tool 응답 검증
 * - 각 시나리오는 독립적으로 실행 가능
 */
import { test, expect } from '@playwright/test';
import { execSync, spawnSync } from 'child_process';

// ── 공통 헬퍼 ────────────────────────────────────────────────────────────────

/** Python으로 MCP 서버에 JSON-RPC tools/call 요청을 보낸다 */
function callMcpTool(toolName, params) {
  const request = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: toolName, arguments: params },
  });

  // server.py를 stdio 모드로 실행 후 단일 요청/응답 교환
  const result = spawnSync(
    'python',
    ['server.py'],
    {
      input: request + '\n',
      encoding: 'utf-8',
      timeout: 60_000,
      env: { ...process.env },
    }
  );

  if (result.error) throw result.error;

  // stdout에서 JSON-RPC 응답 파싱
  const lines = result.stdout.trim().split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      return JSON.parse(line);
    } catch { /* 로그 줄은 무시 */ }
  }
  throw new Error(`MCP 응답 파싱 실패\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
}

/** GitHub에 테스트용 feature 브랜치를 생성하고 빈 커밋을 추가한다 */
function createTestBranch(branch) {
  execSync(`git checkout -b ${branch}`, { encoding: 'utf-8' });
  execSync(`git commit --allow-empty -m "test: ${branch} 테스트 커밋"`, { encoding: 'utf-8' });
  execSync(`git push origin ${branch}`, { encoding: 'utf-8' });
  execSync(`git checkout main`, { encoding: 'utf-8' });
}

/** 원격 브랜치 삭제 (정리용) */
function deleteRemoteBranch(branch) {
  try {
    execSync(`git push origin --delete ${branch}`, { encoding: 'utf-8' });
  } catch { /* 이미 삭제됐으면 무시 */ }
}

// ── 시나리오 1: 서버 기동 및 툴 목록 확인 ─────────────────────────────────────

test('MCP 서버가 기동되고 pipeline_ship_feature 툴이 등록되어 있다', () => {
  const listRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  });

  const result = spawnSync('python', ['server.py'], {
    input: listRequest + '\n',
    encoding: 'utf-8',
    timeout: 15_000,
    env: { ...process.env },
  });

  expect(result.error).toBeUndefined();

  const lines = result.stdout.trim().split('\n').filter(Boolean);
  let response;
  for (const line of lines) {
    try { response = JSON.parse(line); break; } catch { }
  }

  expect(response).toBeDefined();
  expect(response.result).toBeDefined();

  const toolNames = response.result.tools.map((t) => t.name);
  expect(toolNames).toContain('pipeline_ship_feature');
});

// ── 시나리오 2: 입력 검증 — 필수 파라미터 누락 ────────────────────────────────

test('필수 파라미터(repo) 누락 시 오류를 반환한다', () => {
  const response = callMcpTool('pipeline_ship_feature', {
    // repo 누락
    branch: 'feature/test-missing-repo',
    pr_title: '테스트 PR',
    vercel_project: 'test-project',
  });

  // MCP 레벨에서 validation error 또는 tool error 응답
  expect(response.error ?? response.result?.isError).toBeTruthy();
});

test('필수 파라미터(branch) 누락 시 오류를 반환한다', () => {
  const response = callMcpTool('pipeline_ship_feature', {
    repo: 'noplannomercy/day5-github-cli-test',
    // branch 누락
    pr_title: '테스트 PR',
    vercel_project: 'test-project',
  });

  expect(response.error ?? response.result?.isError).toBeTruthy();
});

test('허용되지 않은 extra 파라미터 전달 시 오류를 반환한다', () => {
  const response = callMcpTool('pipeline_ship_feature', {
    repo: 'noplannomercy/day5-github-cli-test',
    branch: 'feature/test',
    pr_title: '테스트 PR',
    vercel_project: 'test-project',
    unknown_field: 'should fail',  // extra="forbid"
  });

  expect(response.error ?? response.result?.isError).toBeTruthy();
});

// ── 시나리오 3: 존재하지 않는 브랜치로 PR 생성 시도 → 실패 응답 구조 검증 ──────

test('존재하지 않는 브랜치로 호출 시 PR 생성 단계에서 실패하고 JSON 구조를 반환한다', () => {
  const response = callMcpTool('pipeline_ship_feature', {
    repo: 'noplannomercy/day5-github-cli-test',
    branch: 'feature/non-existent-branch-xyz-99999',
    pr_title: 'MCP 실패 시나리오 테스트',
    vercel_project: 'day5-github-cli-test',
  });

  // MCP tool 자체는 성공 응답 (파이프라인 실패 결과를 JSON으로 반환)
  expect(response.result).toBeDefined();
  expect(response.result.isError).toBeFalsy();

  const payload = JSON.parse(response.result.content[0].text);
  expect(payload.status).toBe('failed');
  expect(payload.failed_at).toBe('PR 생성');
  expect(Array.isArray(payload.steps)).toBe(true);
  expect(payload.steps[0].step).toBe('PR 생성');
  expect(payload.steps[0].success).toBe(false);
  expect(payload.message).toContain('PR 생성');
});

// ── 시나리오 4: 정상 파이프라인 — 실제 브랜치 생성 후 PR 머지까지 ────────────

test('정상 브랜치로 호출 시 PR 생성 단계가 성공하고 steps 배열에 결과가 쌓인다', () => {
  const branch = `feature/mcp-test-${Date.now()}`;

  try {
    createTestBranch(branch);

    const response = callMcpTool('pipeline_ship_feature', {
      repo: 'noplannomercy/day5-github-cli-test',
      branch,
      pr_title: `[MCP 테스트] ${branch}`,
      vercel_project: 'day5-github-cli-test',
      pr_body: 'playwright test로 자동 생성된 PR',
    });

    expect(response.result).toBeDefined();
    const payload = JSON.parse(response.result.content[0].text);

    // PR 생성 단계는 반드시 성공
    expect(payload.steps[0].step).toBe('PR 생성');
    expect(payload.steps[0].success).toBe(true);
    expect(payload.steps[0].output).toMatch(/https:\/\/github\.com\/.+\/pull\/\d+/);

    // diff 읽기 단계도 성공
    expect(payload.steps[1].step).toBe('diff 읽기');
    expect(payload.steps[1].success).toBe(true);

    // PR 머지 단계도 성공
    expect(payload.steps[2].step).toBe('PR 머지');
    expect(payload.steps[2].success).toBe(true);

    // vercel 단계는 실패해도 구조는 유지 (vercel CLI 미설치 환경 허용)
    expect(payload.steps.length).toBeGreaterThanOrEqual(3);

  } finally {
    deleteRemoteBranch(branch);
  }
});

// ── 시나리오 5: 파이프라인 결과 JSON 스키마 검증 ─────────────────────────────

test('실패 응답은 status/failed_at/message/steps 키를 모두 포함한다', () => {
  const response = callMcpTool('pipeline_ship_feature', {
    repo: 'noplannomercy/day5-github-cli-test',
    branch: 'feature/schema-check-xyz',
    pr_title: '스키마 검증 테스트',
    vercel_project: 'test',
  });

  const payload = JSON.parse(response.result.content[0].text);

  if (payload.status === 'failed') {
    expect(payload).toHaveProperty('status', 'failed');
    expect(payload).toHaveProperty('failed_at');
    expect(payload).toHaveProperty('message');
    expect(payload).toHaveProperty('steps');
    expect(Array.isArray(payload.steps)).toBe(true);
  }
});

// ── 시나리오 6: 이미 존재하는 PR 중복 생성 시도 ──────────────────────────────

test('같은 브랜치로 두 번 호출 시 두 번째는 PR 생성 단계에서 실패한다', () => {
  const branch = `feature/dup-test-${Date.now()}`;

  try {
    createTestBranch(branch);

    // 첫 번째 호출 — PR 생성
    callMcpTool('pipeline_ship_feature', {
      repo: 'noplannomercy/day5-github-cli-test',
      branch,
      pr_title: '[중복 테스트] 첫 번째',
      vercel_project: 'day5-github-cli-test',
    });

    // 두 번째 호출 — 동일 브랜치, PR 이미 존재 or 브랜치 삭제됨
    const second = callMcpTool('pipeline_ship_feature', {
      repo: 'noplannomercy/day5-github-cli-test',
      branch,
      pr_title: '[중복 테스트] 두 번째',
      vercel_project: 'day5-github-cli-test',
    });

    const payload = JSON.parse(second.result.content[0].text);
    expect(payload.status).toBe('failed');

  } finally {
    deleteRemoteBranch(branch);
  }
});
