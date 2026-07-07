# spec-evolve — 스펙 진화 하네스 (명시 호출 경로의 Phase 1)

> **이 하네스는 기본 경로가 아니다.** scenario-gen 의 기본은 스펙 없이 바로 생성이고(SKILL.md "진입 분기"), 이 하네스는 사용자가 **`/flex-spec` 슬래시 커맨드로 진입했거나 명시적으로 스펙 단계를 요청한 경우에만** 탄다. 막연한 입력이라는 이유만으로 여기로 강제되지 않는다.

raw 입력(화면정의서 엑셀/표/텍스트/캡처, 데이터구조 동봉 요청, 막연한 한 줄 요청)을 **곧바로 시나리오로 만들지 않고**, 먼저 구체화된 중간 스펙 `<name>.spec.md` 으로 "진화"시킨다. 그 스펙이 SKILL.md "시퀀스 3. 요청 분석"의 입력이 된다.

목적: 추론(마스터-디테일·키·데이터연결·조회조건 분리)을 **생성 본문과 분리**해, 사람이 검토 가능한 중간 산출물로 남기고 재현성을 높인다.

## 세 Phase

- **Phase 1 — 스펙 진화** (이 폴더): raw 입력 → `<name>.spec.md` (frontmatter + Step별 본문). 절차는 아래.
- **Phase 2 — 시나리오 생성** (SKILL.md 본문 시퀀스): `.spec.md` 본문을 "요청"으로 보고 평소대로 노드 빌드 + `flex-scenario validate`. 별도 hand-off 도구 없음 — **같은 스킬 안에서 그대로 이어서 진행**한다.
- **Phase 3 — 데이터연결 보장 게이트** (`data-connection.md` "★ 생성 후 데이터연결 보장 게이트"): 산출 시나리오에 데이터연결이 빠졌으면(목록·조회·반복·M-D 화면인데 `DataConnection`/`intent.mock` 0건) **통과시키지 말고**, `ok:true` 가 보증된 유사 구조 `design/` 샘플과 key-diff 해 **추가 수정으로 주입**한 뒤 재검증한다. 이건 `lint.md`(비블로킹 보고)와 달리 **블로킹**이다 — 스펙 경로의 핵심 보장.

## Phase 1 절차 (이 순서)

1. **인테이크** — 입력 모달리티 식별 → 모달리티 무관 필드 목록으로 정규화. 캡처면 `Read` 로 이미지 직접 판독. → `intake.md`
2. **라우팅** — "데이터 구조 신호" 유무로 A(정적)/B(데이터연결) 결정. 구조 제공 시 그대로 따르고 부가정보는 보조 병합, 미제공 시 코퍼스 추론. → `routing.md`
3. **필드 플랜 + keyRole** — 각 필드에 `keyRole`(master/detail/link/none/provisional). 카디널리티로 판정, 불확실하면 `provisional`+flag 하고 멈추지 않는다. → `key-roles.md`
4. **데이터연결 설계 (B 경로)** — 마스터-디테일을 부모 query + 자식 query(Parent 필터+조인키) + detail 로 매핑. → `data-connection.md`
5. **목업데이터 추정·세팅** — 구조 제공이든 미제공이든 화면을 현실적 목업으로 채운다(빈 화면 금지). 미제공이면 카테고리·필드·값을 추정. → `mockup.md`
6. **조회 화면 분해** — 조회조건이 많으면(≥5) 별도 Step 으로 분리. → `query-screens.md`
7. **컨벤션 적용** — 의도→컨트롤 매핑, 날짜 등 기본값, 마스터-디테일 레이아웃 골격. → `conventions.md`
8. **스펙 작성** — `<name>.spec.md` 를 `spec-format.md` 형식으로 쓴다. 추론 가정·provisional·mock 을 frontmatter/본문에 명시. 템플릿은 `templates/` 참조. → `spec-format.md`

이후 Phase 2(SKILL.md 시퀀스로 생성) → **Phase 3 데이터연결 보장 게이트** 로 이어진다.

9. **데이터연결 보장 게이트** (Phase 2 생성 직후, 블로킹) — 산출 시나리오에 데이터연결이 빠졌으면 유사 구조 `design/` 샘플(validate `ok:true` 확인)과 key-diff 해 `Edit` 로 주입 후 재검증. → `data-connection.md` "★ 생성 후 데이터연결 보장 게이트"

## 산출 위치

- 중간 스펙: `./<name>.spec.md` (현재 작업 폴더 cwd)
- 이후 시나리오: `./<name>-scenario.json` (현재 작업 폴더 cwd · SKILL.md 산출 규칙과 동일)

## 자기완결 원칙

이 하네스가 참조하는 모든 정본(스펙 형식·예시·컨벤션)은 **이 폴더 안에 번들**되어 있다. 레포 전용 경로(`bench/cases`, `sample_spec` 등)를 런타임에 참조하지 않는다 — 배포 환경엔 없다. 시나리오 형식/스키마/검증은 같은 스킬에 동봉된 `docs/`·`schemas/`·`flex-scenario validate` 를 쓴다.

## 비블로킹 원칙 (게이트와 구분)

불확실한 키·추론 가정 때문에 진행을 멈추지 않는다. `provisional` 로 두고 Phase 2 까지 흘린 뒤, 최종 응답에서 lint 가 "미해결"로 보고한다. → `lint.md`

> 단, **Phase 3 데이터연결 보장 게이트는 비블로킹이 아니다.** keyRole 추론의 불확실성은 `provisional` 로 흘려보내도 되지만, 목록·조회·반복 화면에 데이터연결 자체가 0건인 것은 보고만 하고 넘기지 않고 **샘플 참조로 주입해 고친 뒤** 통과시킨다(`data-connection.md`).
