---
description: flextudio 시나리오를 스펙 기반으로 생성하는 커맨드. 곧바로 화면을 만들지 않고 먼저 중간 스펙(.spec.md)으로 마스터-디테일·키·데이터연결을 확정한 뒤, 그 스펙대로 시나리오를 생성하고 데이터연결 보장 게이트까지 거친다. 스펙 단계가 필요할 때만 명시 호출 (기본은 스펙 없이 직접 생성).
argument-hint: <화면 요청 / 화면정의서 / 데이터구조>
---

# /flex-spec — 스펙 기반 생성 (명시 진입)

이 커맨드는 **`scenario-gen` 스킬을 스펙 경로(spec-evolve 하네스)로 강제 진입**시키는 전용 입구다.
평소(자동 트리거·`/scenario-gen`)의 **기본은 스펙 없이 직접 생성**이고, 사용자가 이 커맨드로 들어온 경우에만 **중간 스펙(`<name>.spec.md`)을 먼저 진화시킨 뒤** 생성한다. 절차의 정본은 scenario-gen 스킬의 `SKILL.md` 와 `references/spec-evolve/` 이며, 이 커맨드는 그 경로를 **켜는 신호 + 데이터연결 보장 게이트**만 더한다.

사용자 요청:

> $ARGUMENTS

## 반드시 이 순서로

1. **스펙 경로 강제** — 직접 생성 경로로 직행하지 말 것. `scenario-gen` 스킬을 사용하되, 먼저 `references/spec-evolve/README.md` 를 Read 하여 **Phase 1(스펙 진화)** 부터 시작한다.
2. **Phase 1 — 스펙 진화** — `references/spec-evolve/` 절차(intake → routing → key-roles → data-connection → mockup → query-screens → conventions → spec-format)로 위 요청을 `./<name>.spec.md` (현재 작업 폴더 cwd) 로 진화시킨다. 추론한 마스터-디테일·키·목업은 frontmatter/본문에 기록하고, 불확실하면 `provisional` 로 둔 채 멈추지 않는다.
3. **Phase 2 — 시나리오 생성** — `.spec.md` 본문을 SKILL.md "시퀀스 3. 요청 분석"의 입력으로 삼아 평소대로 노드를 빌드하고 `flex-scenario validate` 로 자가검증 루프를 통과시킨다.
4. **★ 데이터연결 보장 게이트 (이 경로의 필수 추가 단계)** — Phase 2 산출 시나리오를 점검한다. 화면이 **목록·카드·"~별"·"~내역"·조회·반복·선택지(Combo/Search)** 성격인데 `UseDataConnection:true` + `DataConnection` + 시작 Step.Init `intent.mock` 이 **0건이면 통과시키지 말 것**:
   - `examples/index.json` 에서 **구조(`stepCount`/`patterns`/`controlTypes`)가 유사한 `design/` 샘플 시나리오**를 고르고, **반드시 먼저 `flex-scenario validate --no-write <후보 example>` 로 `ok:true` 를 확인**한다 (★ example 검증엔 `--no-write` 필수 — 기본 validate 는 `ok:true` 시 본문을 입력 파일에 write-back 해 참조 예제를 변형시킨다).
   - 그 샘플의 데이터연결 노드(부모 query → 자식 query(Parent 필터·조인키) → detail, `LabelCKey`/`Ckeys` 바인딩, named-handler `intent.mock`)와 내 산출물을 **key-diff** 한다.
   - 빠진 데이터연결을 `Edit` 로 **추가 수정**해 주입한다 — 정적 `Label` 복제로 도망가지 않는다. 단건 마스터/헤더도 정적으로 두지 말고 `DataUsage:"default"` + `LabelCKey` 로 바인딩한다. 규칙 정본: `references/spec-evolve/data-connection.md`, `references/spec-evolve/mockup.md`.
   - 진짜 단건 정적 표시(고정 문구뿐)거나 실제 `scenario.DataSources`(Fixed/Grid)가 채워진 경우만 예외로 데이터연결 없이 통과.
   - 수정 후 `flex-scenario validate <scenario>` 를 다시 통과시킨다.
5. **산출** — `flex-scenario session finish` 의 `artifact` 경로(`.spec.md` + `-scenario.json`)를 답에 명시한다. 추론 가정·provisional 미해결이 있으면 `references/spec-evolve/lint.md` 형식으로 1블록 보고(비블로킹).

> 한 줄 요약: **기본은 `/flex-spec` 없이 바로 생성. 이 커맨드는 "스펙을 거쳐 + 데이터연결을 끝까지 보장해" 달라는 명시 요청이다.**
