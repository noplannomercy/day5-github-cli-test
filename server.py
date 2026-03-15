#!/usr/bin/env python3
"""
deploy_pipeline_mcp

gh CLI + vercel CLI를 묶어 feature 브랜치를 PR 머지 후 Vercel 배포하는 파이프라인 MCP 서버.
"""

import asyncio
import json
import logging
import os
import sys
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from mcp.server.fastmcp import FastMCP

# ── 로깅 설정 (stderr + 파일) ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stderr),
        logging.FileHandler("deploy_pipeline.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger("deploy_pipeline")

# ── MCP 서버 초기화 ────────────────────────────────────────────────────────────
mcp = FastMCP("deploy_pipeline_mcp")


# ── 상수 ──────────────────────────────────────────────────────────────────────
CHARACTER_LIMIT = 2000
CLI_ENV = {**os.environ, "PATH": os.environ.get("PATH", "") + ";C:\\Users\\vavag\\bin"}


# ── 공통 유틸 ──────────────────────────────────────────────────────────────────
async def _run(cmd: str) -> tuple[bool, str]:
    """CLI 명령어 실행. (success, output) 반환."""
    logger.info(f"실행: {cmd}")
    proc = await asyncio.create_subprocess_shell(
        cmd,
        stdin=asyncio.subprocess.DEVNULL,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env=CLI_ENV,
    )
    stdout, stderr = await proc.communicate()
    output = (stdout.decode().strip() or stderr.decode().strip())
    if proc.returncode != 0:
        logger.error(f"실패 ({proc.returncode}): {output}")
        return False, output
    logger.info(f"성공: {output[:200]}")
    return True, output


# ── 입력 모델 ──────────────────────────────────────────────────────────────────
class ShipFeatureInput(BaseModel):
    """pipeline_ship_feature 입력 모델."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    repo: str = Field(
        ...,
        description="GitHub 레포지토리 (예: 'noplannomercy/my-app')",
        min_length=3,
    )
    branch: str = Field(
        ...,
        description="머지할 feature 브랜치명 (예: 'feature/add-login')",
        min_length=1,
    )
    pr_title: str = Field(
        ...,
        description="PR 제목 (예: '로그인 기능 추가')",
        min_length=1,
        max_length=200,
    )
    vercel_project: str = Field(
        ...,
        description="Vercel 프로젝트명 (예: 'my-app')",
        min_length=1,
    )
    pr_body: Optional[str] = Field(
        default="",
        description="PR 본문 (선택사항)",
    )


# ── 메인 툴 ───────────────────────────────────────────────────────────────────
@mcp.tool(
    name="pipeline_ship_feature",
    annotations={
        "title": "Feature 브랜치 배포 파이프라인",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    },
)
async def pipeline_ship_feature(params: ShipFeatureInput) -> str:
    """feature 브랜치를 PR로 머지하고 Vercel에 자동 배포한다.

    gh CLI와 vercel CLI를 순서대로 실행:
    1. PR 생성 (gh pr create)
    2. diff 읽기 (gh pr diff)
    3. 머지 + 브랜치 삭제 (gh pr merge --squash --delete-branch)
    4. Vercel 배포 (vercel deploy --prod)
    5. 배포 상태 확인 (vercel ls)

    Args:
        params (ShipFeatureInput):
            - repo (str): GitHub 레포 (예: 'owner/repo')
            - branch (str): feature 브랜치명
            - pr_title (str): PR 제목
            - vercel_project (str): Vercel 프로젝트명
            - pr_body (Optional[str]): PR 본문

    Returns:
        str: 각 단계 결과를 담은 JSON 문자열

    Examples:
        - "feature/add-login 브랜치 배포해줘" → repo, branch, pr_title, vercel_project 채워서 호출
        - 단계 실패 시 해당 단계에서 파이프라인 중단, 이후 단계 스킵
    """
    steps = []
    logger.info(f"파이프라인 시작 | repo={params.repo} branch={params.branch}")

    # ── 1. PR 생성 ─────────────────────────────────────────────────────────────
    body_flag = f'--body "{params.pr_body}"' if params.pr_body else '--body ""'
    ok, out = await _run(
        f'gh pr create --repo {params.repo} --head {params.branch} --base main '
        f'--title "{params.pr_title}" {body_flag}'
    )
    steps.append({"step": "PR 생성", "success": ok, "output": out})
    if not ok:
        return _result(steps, failed_at="PR 생성")

    # PR URL에서 번호 추출
    pr_number = out.rstrip("/").split("/")[-1]
    logger.info(f"PR #{pr_number} 생성됨")

    # ── 2. diff 읽기 ───────────────────────────────────────────────────────────
    ok, out = await _run(f"gh pr diff {pr_number} --repo {params.repo}")
    steps.append({"step": "diff 읽기", "success": ok, "output": out[:CHARACTER_LIMIT]})
    if not ok:
        return _result(steps, failed_at="diff 읽기")

    # ── 3. 머지 + 브랜치 삭제 ──────────────────────────────────────────────────
    ok, out = await _run(
        f"gh pr merge {pr_number} --repo {params.repo} --squash --delete-branch --yes"
    )
    steps.append({"step": "PR 머지", "success": ok, "output": out})
    if not ok:
        return _result(steps, failed_at="PR 머지")

    # ── 4. Vercel 배포 ─────────────────────────────────────────────────────────
    ok, out = await _run(f"vercel deploy --prod --yes")
    steps.append({"step": "Vercel 배포", "success": ok, "output": out})
    if not ok:
        return _result(steps, failed_at="Vercel 배포")

    # ── 5. 배포 상태 확인 ──────────────────────────────────────────────────────
    ok, out = await _run(f"vercel ls {params.vercel_project} --yes")
    steps.append({"step": "배포 상태 확인", "success": ok, "output": out})

    logger.info("파이프라인 완료")
    return _result(steps)


def _result(steps: list, failed_at: Optional[str] = None) -> str:
    """단계 결과를 JSON 문자열로 반환."""
    status = "failed" if failed_at else "success"
    payload = {"status": status, "steps": steps}
    if failed_at:
        payload["failed_at"] = failed_at
        payload["message"] = f"'{failed_at}' 단계에서 실패. 이후 단계 중단."
    return json.dumps(payload, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    mcp.run()
