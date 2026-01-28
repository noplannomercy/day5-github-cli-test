# 0. MCP Setting
    .mcp.json

# 1. 디자인 생성 (MCP)
    @stitch Timer & Stopwatch 웹앱 만들어줘.

    ## 용도
    집중 작업용 타이머, 시간 측정 도구

    ## 사용자
    학생, 직장인, 프리랜서

    ## 스타일
    - 무드: 모던하고 미니멀한 생산성 도구
    - 테마: 다크 모드, 민트/시안 포인트 컬러
    - 폰트: 깔끔한 산세리프, 숫자는 모노스페이스

    ## 레이아웃
    - 상단: 모드 선택 탭 (Timer / Stopwatch / Pomodoro)
    - 중앙: 큰 시간 표시 (디지털 시계 스타일)
    - 하단: 컨트롤 버튼 (Start, Pause, Reset)

    ## 주요 요소
    - 큰 시간 숫자 (00:00:00)
    - 프로그레스 링/바
    - Start/Pause/Reset 버튼
    - 프리셋 버튼 (5분, 15분, 25분)
    - 알람 설정

    ## 참고
    iOS 시계 앱, Forest 앱 스타일

# 2. DESIGN.md 추출 (MCP)
    @stitch 디자인 컨텍스트 추출해서 docs/DESIGN.md 작성해줘

# 3. 기존 프로젝트에 적용 (Claude Code)


    ## 🔄 Level 3: 단계별 적용

    ### Step 3-1. 색상 시스템
    ```markdown
    DESIGN.md의 색상 시스템만 기존 index.html에 적용해줘.
    - 배경색, 텍스트색, 포인트 컬러
    - 기능(JS)은 건드리지 마
    - 레이아웃/구조는 유지
    ```

    ### Step 3-2. 폰트/타이포그래피
    ```markdown
    DESIGN.md의 폰트/타이포그래피를 적용해줘.
    - 폰트 패밀리, 사이즈, 굵기
    - 이전 색상 유지
    ```

    ### Step 3-3. 레이아웃
    ```markdown
    DESIGN.md의 레이아웃 구조를 적용해줘.
    - 전체 배치, 간격, 정렬
    - 색상/폰트 유지
    ```

    ### Step 3-4. 컴포넌트
    ```markdown
    DESIGN.md의 컴포넌트 스타일을 적용해줘.
    - 버튼, 카드, 인풋 등
    - 기존 스타일 유지하면서 개선
    ```
# 4. clarify
    DESIGN.md와 현재 index.html을 비교해서:
    1. 잘 반영된 것
    2. 빠진 것 / 다르게 적용된 것
    3. 추가 개선이 필요한 것

    리스트로 정리해줘.    