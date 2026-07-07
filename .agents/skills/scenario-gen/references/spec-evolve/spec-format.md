# spec-format — 중간 스펙 `<name>.spec.md` 형식

Phase 1 산출물의 형식. `---` frontmatter(분석 메타) + 본문(Step별 자연어 명세). 본문은 Phase 2 에서 "요청"으로 그대로 소비된다.

## frontmatter 키

```yaml
---
id: <짧은 식별자>              # 예: pda-inspection-request
domain: <도메인>               # 예: 품질/물류
feature: <한 줄 기능>           # 예: 출하검사의뢰 입력 — 스캔으로 품목 적재
screenKind: input | query | mixed
route: A | B | mixed           # routing.md 결정 (정적 / 데이터연결 / 혼재)
events: [저장, 삭제, 신규, 조회]  # 있으면
steps:                         # Step 분해 — 권장 3~5 · 최대 7 (아래 "Step 수 규칙")
  - { id: Step1, role: ..., next: Step2 }
keyRoles:                      # key-roles.md — 필드 → master/detail/link/none
  <필드>: <role>
categories:                    # route 에 B 가 포함될 때 — data-connection.md
  Ctg<Name>: { role: master|detail, keys: [...], parentKey: ..., childKey: ..., fields: [...] }
assumptions:                   # 구조 미제공 시 추론한 가정 (사람 검토용)
  - <가정 문장>
provisional:                   # 비블로킹 미해결 (key-roles.md / lint.md)
  - { field: ..., guess: ..., why: ... }
expect:                        # Phase 2 가 만족해야 할 체크리스트 (검증·자기점검용)
  - <기대 조건>
---
```

`expect` 는 bench 케이스(T-/D-)의 그것과 같은 역할 — 생성 결과가 맞는지 스스로 점검하는 목록. 예: "Step1→2→3 reachability 1회", "디테일은 DataUsage:query (UseInnerBlock 금지)", "Init mock 부모2+자식", "Collections:{} 유지", "조회조건 12개 → Step2 분리".

## 본문 (Step별 명세)

각 Step 을 헤더로 나누고, 그 안에 영역(마스터/디테일/조회조건/요약)과 항목을 적는다. 항목은 `이름 — 의도(컨트롤) [기본값/바인딩]` 형태. 데이터연결·목업·네비게이션 규칙을 문장으로 명시.

**"데이터 / 목업" 절은 필수**다 — 구조 제공이든 미제공이든 화면을 채울 **구체적 mock 값**(현실적 리터럴 N건, 부모-자식이면 조인 일치)을 적는다. 미제공이면 `mockup.md` 절차로 카테고리·필드·값을 추정해 적고 frontmatter `categories`/`assumptions` 에 기록. 빈 화면으로 끝내지 않는다.

본문 작성 시 참고 템플릿:
- 마스터-디테일(B, 부모-자식) → `templates/master-detail.spec.md`
- 조회 화면(조건 분리) → `templates/query-screen.spec.md`
- 정적 프로토타입(A, 구조 미제공/단건) → `templates/static-prototype.spec.md`

## Step 수 규칙 (스펙기반 생성)

스펙으로 진화한 화면은 **3~5 Step 권장 · 최대 7 Step** 으로 구성한다. 한 Step 에 모든 걸 욱여넣지도, 과하게 잘게 쪼개지도 말 것 — 흐름을 자연스러운 단계로 분해하되 **7개를 넘기지 않는다**(넘으면 서브 흐름을 합치거나 Step 안 영역으로 묶는다). 정말 단순한 단건 화면이면 2 Step 이하도 가능하나, 그 근거를 `assumptions` 에 적는다.

- **목록/조회**: 결과 리스트 + (조회조건 폼 분리) + 상세(detail) → 자연히 2~3 Step. 조회조건 ≥5 면 조건 폼을 별도 Step (`query-screens.md`).
- **입력**: 기본정보 → 상세/항목 → 확인/완료 처럼 입력 흐름을 단계화 → 3 Step.
- **단건 표시(A)**: 표시 + 결과/확인 등으로 2~3 Step. 정말 1화면이면 적게 둘 수 있으나 근거를 `assumptions` 에 적는다.
- StartSteps + 각 Step.Next 합집합으로 reachability 가 정확히 1회 되도록(끊기거나 중복 금지). 헤더 BackButton 표준 적용.

## Step 전환 / 네비 (스펙 본문에 반드시 기술)

각 Step 에 대해 **어떻게 들어오고 나가는지**를 스펙 본문에 명시한다(샘플 수준으로 구체적으로). 모호하게 두면 흐름이 끊긴 생성물(예: 조회조건 Step 에서 결과로 못 돌아옴)이 나온다.

- **StartSteps**: 보통 `["Step1"]`. 다중 진입이 필요하면 나열.
- **전진**: `BottomButtons[*].MoveTo:"Next"` + `Next.MoveStepOrder:["StepN"]`, 또는 리스트 카드 `UseMove:true` + `MoveSteps.MoveStepOrder`.
- **복귀**: 헤더 `UseBackButton:true`(표준 BackButton, `IsRestored:true` 로 값 유지) 또는 `BottomButtons[*].MoveTo:"Prev"`. ⚠ `Current.step.moveToPrev/moveToNext` 스크립트 **금지**.
- **조회조건 진입**: 결과 Step `FixedContentsTop` 에서 진입(상단). 하단 '조회조건' 버튼·`바로가기`·`메인메뉴`·`펼치기/접기` 라벨 버튼 **생성 금지**.
- 각 Step 줄에 `next:`/`back:`/`filterEntry:` 를 적어 reachability 가 정확히 1회 되게 한다.

## expect 에 넣을 자체 점검 항목 (해당 시)

- M-D 제공 → `intent.mock`(부모+자식 카테고리) 동반, `UseDataConnection:true`/`DataConnection` ≥1 (0이면 실패).
- 반복 영역은 `DataUsage:"query"` + 스크롤 그룹으로 한두 겹 래핑(중첩 깊이 ≥5 목표), 정적 Label 복제 아님.
- 조회조건은 상단(`FixedContentsTop`)/별도 Step, 하단 진입 버튼 없음, 부가 네비 버튼(바로가기/메인메뉴/펼치기) **0개**.
- 마스터 표시 라벨 바인딩(가능 시) + 종속 선택 mock.
- Step reachability 정확히 1회, 복귀 채널은 표준(스크립트 흐름제어 0).
- Collections:{} 유지, validate 통과.

## 작성 원칙

- **구조 제공 시**: 준 필드/키/카디널리티를 그대로 옮기고 임의 추가 금지. 부가정보는 보조 병합.
- **구조 미제공 시**: 추론한 마스터-디테일·키를 채우되 `assumptions` 에 근거를 남긴다.
- provisional 은 멈춤 사유가 아니다 — 기록하고 진행.
- 본문은 Phase 2 가 읽고 노드를 만들 수 있을 만큼 구체적이되, **시나리오 JSON 을 여기 쓰지 않는다**(그건 Phase 2). 스펙은 "무엇을"이고 Phase 2 가 "어떻게".
