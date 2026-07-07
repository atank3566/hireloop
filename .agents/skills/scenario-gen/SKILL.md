---
name: scenario-gen
user-invocable: false
description: flextudio meta-contract v1 시나리오 JSON 빌드 절차. 사용자가 "휴가신청 화면", "리스트-상세", "결재 트리" 등 flextudio 화면 생성을 요청하거나, 화면정의서(엑셀/표/텍스트/캡처 이미지)·데이터구조를 주거나, 막연히 "~화면 만들어줘" 라고 하면 이 절차를 따른다. **기본은 스펙 없이 바로 생성** — 입력이 막연해도 멈추지 말고 routing/mockup 추론으로 데이터연결·목업을 스스로 세팅해 직접 생성한다. 사용자가 `/flex-spec` 슬래시 커맨드로 진입했거나 명시적으로 스펙 단계를 요청할 때만 references/spec-evolve/ 로 중간 스펙(.spec.md)을 거쳐 생성한다. .claude/skills/scenario-gen/ 안에 펼쳐진 schema/pattern/example 자산을 Read 로 조회하고 `flex-scenario validate` 로 자체 검증한다.
---

# scenario-gen (CLI 설치형 Skill)

이 Skill 은 `.claude/skills/scenario-gen/` 에 설치되어 있다. 화면 생성에 필요한 모든 자산(schema / doc / pattern / example / catalog / rules)의 진실원본이 같은 디렉토리 아래 정적 파일로 펼쳐져 있어, **Read 도구로 직접 fetch** 한다. 검증만 Bash 로 `flex-scenario validate`.

## 진입 분기 — 직접 생성(기본) vs 스펙 진화 하네스(명시 호출)

**기본은 직접 생성이다.** 자동 트리거(화면 요청)든 `/scenario-gen` 이든, 곧바로 아래 "시퀀스"로 가서 시나리오를 만든다. 두 경로 모두 같은 "시퀀스"로 수렴하고, 스펙 경로는 그 **앞에 선행 단계 하나**를 더 얹을 뿐이다.

- **직접 생성 경로 (기본)** — 입력이 구체적이든 막연하든 바로 "시퀀스"로. **입력이 막연해도(도메인 한두 단어 "재고관리/주문관리" 등) 멈추거나 사용자에게 되묻지 않는다.** `references/spec-evolve/routing.md`·`mockup.md` 의 추론 규칙대로 마스터-디테일·키·목업을 **스스로 추론·세팅**해 생성한다 — 구조 미제공이라고 비워두지 않고, 목록·조회성이면 `DataConnection`+`intent.mock` 까지 직접 박는다. `.spec.md` 중간 산출은 만들지 않는다.
- **스펙 진화 하네스 경로 (명시 호출 시에만)** — 사용자가 **`/flex-spec` 슬래시 커맨드**로 진입했거나, "스펙으로 / 스펙 먼저 / .spec.md 로" 처럼 **명시적으로 스펙 단계를 요청**한 경우에만. 이때는 곧바로 노드를 만들지 말고, 먼저 `references/spec-evolve/` 절차로 입력을 **구체화된 중간 스펙(`<name>.spec.md`)** 으로 진화시킨다(마스터-디테일·키·데이터연결·조회조건 확정). 그 스펙을 아래 "시퀀스 3. 요청 분석"의 입력으로 삼아 이어서 생성하고, **생성 뒤 "데이터연결 보장 게이트"** 까지 거친다. 진입점: **`references/spec-evolve/README.md`** Read.

> **빈/정적 회귀 금지는 두 경로 공통 기본이다.** 목록·카드성 화면을 데이터연결 없이 정적 Label 로 떨구는 실패는 스펙 경로의 전유물이 아니라 **직접 생성에서도 똑같이 금지**다 (§산출 형식 "데이터 표시 결정"). 즉 막연한 입력이라고 해서 더 이상 스펙 경로로 강제하지 않는다 — 직접 생성에서도 추론으로 데이터연결을 박아야 한다. 스펙 경로가 더하는 것은 (a) 사람이 검토 가능한 중간 `.spec.md`, (b) 생성 후 데이터연결을 끝까지 강제하는 **보장 게이트**(`references/spec-evolve/data-connection.md` "★ 생성 후 데이터연결 보장 게이트") 두 가지뿐이다.

> 하네스는 별도 스킬이 아니라 이 스킬의 **선행 단계**다. Phase 1 산출물(`.spec.md`)은 사람이 검토할 수 있는 중간 결과이고, 추론한 가정·provisional 키가 있으면 응답에 1블록으로 표시한 뒤(비블로킹) Phase 2 생성으로 이어간다.

## CLI 진입

> 검증·카탈로그·세션 등은 `flex-scenario` 명령(PATH)으로 호출한다.
>
> ```
> flex-scenario <subcommand> [...args]
> ```
>
> `command not found` 이면 전역 설치본을 node 로 직접 실행:
> ```
> node "$(npm root -g)/@flextudio/scenario/bin/flex-scenario.mjs" <subcommand> [...args]
> ```
> 그래도 안 되면 사용자에게 `npm i -g @flextudio/scenario` 를 요청한다. 본문에 `flex-scenario X` 로 적힌 건 모두 위 호출을 뜻한다.

## 자산 위치 (필요한 것 ↔ Read/Bash 경로)

| 필요한 것 | 경로 |
|---|---|
| 스키마 목록 / 조회 | `.claude/skills/scenario-gen/schemas/index.json`, `schemas/<name>.schema.json` |
| 문서 목록 / 조회 | `.claude/skills/scenario-gen/docs/index.json`, `docs/<rel>.md` |
| 패턴 목록 / 조회 | `.claude/skills/scenario-gen/patterns/index.json`, `patterns/<tier>/<name>.json` |
| 예제 목록 / 조회 | `.claude/skills/scenario-gen/examples/index.json`, `examples/<rel>.json` |
| 카탈로그 | `.claude/skills/scenario-gen/catalog.json` (전체) 또는 Bash: `flex-scenario catalog --section <key>` |
| 디자인 룰 | `.claude/skills/scenario-gen/design-rules.md` |
| 룰 / README | `.claude/skills/scenario-gen/rules.md`, `README.md` |
| contract 정보 | Bash: `flex-scenario contract info` |
| 검증 (fragment / 전체) | Bash: `flex-scenario validate [--schema <name>] <file>` |
| 빌드 시퀀스(세션) | Bash: `flex-scenario session {start,status,finish}` |

## 산출 형식

시나리오는 **현재 작업 폴더(cwd)** 에 쓴다 (예: `./<이름>-scenario.json`). cwd 밖(`/tmp` 등) 금지 — 회수 주체(`session finish`)가 cwd 에서 산출물을 찾는다. 검증 통과 전 임시 파일도 cwd 안에서 쓴다.

**작성 default — short-form 우선** (validate phase 가 raw 로 자동 펼침):

1. **스타일** = `design` 키 short-form (Group/Control 노드). 19개 슬롯 (`font`/`color`/`align`/`w`/`h`/`p`/`m`/`bg`/`border`/`radius`/`elevation`/`flex`/`caption`/`abs`/`opacity`/`itemBg`/`tabHeader`/`fixed`/`surface`) 으로 표현 불가한 경우에만 raw 스타일 escape (`design-rules.md §Raw escape`).

2. **데이터 / 스크립트** = `intent` 키 short-form (정본: `intent-rules.md` / `intent-system.md`). 활성 슬롯·kind:
   - `intent.mock: { CtgX: [{...}, ...] }` — Init 단계 mock 데이터 (scope: `event-script-init`)
   - `intent.script: { kind: 'dialog'\|'updateActive'\|'deleteActive'\|'clearCategory'\|'reloadGroup', ... }` — 표준 idiom (scope: `event-script`)
   intent 가 표현 못 하는 분기/조건이 있을 때만 raw `Action:'Script', Script: "..."` escape (정본: `skill-guides/scripts.md` "raw escape hatch" 표).
   **카테고리 정의 / `Collections` / `Panel.*` 은 스튜디오 자동 재생성** — AI 가 채우지 않음 (`Collections:{}` schema const 고정).

3. examples 에는 `design/` (스타일 short-form) + `intent/` (런타임 short-form) + `basic/` (raw 전용 호환) 세 카테고리. **`design/` + `intent/` 우선 참조**.

**데이터 표시 결정 (정적 vs 동적)** — `[proto]` 차단의 1차 원인. 노드를 만들기 전에 먼저 판정:

- **정적 표시** (고정 문구·캡션·단건 라벨, 반복/선택지 아님) → `Label` (`LabelType:'labeltext'` + `labeltext:'예시값'`). `DataConnection` / `Ckeys` / `LabelCKey` / `UseDataConnection:true` 박지 말 것.
  - ⚠ **정적 회피 금지**: 목록·카드·"~별"·"~내역"·"~목록" 처럼 **반복 성격**이면 정적 Label 을 N개 복제해 끝내지 말 것. 같은 카드를 2~3장 손으로 복제하는 순간 그건 동적 바인딩 신호다 → `DataUsage:"query"` + `intent.mock` 으로 가야 한다. mock 동반의 부담을 피해 정적으로 도망가는 것이 `L1` 류 막연 요청의 대표 실패다. "단건이라 정적" 은 진짜 1건일 때만.
  - ⚠ **M-D 구조 제공 시 목업 필수**: 화면정의서/요청에 Master/Detail(반복 항목) 구조가 명시되면 그 구조의 목업 카테고리(`Ctg*` + Init `intent.mock`)는 **반드시** 생성한다. M-D 인데 `DataConnection`/`Events` 가 0건이면 오답(`references/spec-evolve/mockup.md`).
- **동적 바인딩** (리스트 반복 렌더 · Combo/Search 선택지 · Calendar 데이터) → Group `UseDataConnection:true` + `DataConnection`(`{TargetType:'category', DataUsage, CategoryName}` 객체) + 자식 컨트롤 `Ckeys`/`LabelCKey`. **이때는 반드시 시작 Step.Init 에 `intent.mock: { Ctg<X>: [{...}, ...] }` 으로 그 카테고리 mock 데이터를 동반** — mock 없이 DataConnection/Ckeys 만 박으면 `scenario.DataSources` 가 비어있는 프로토타이핑으로 간주돼 바인딩 노드마다 `[proto]` 로 차단된다 (intent-first: raw `addSector` 보다 `intent.mock` 우선).
- **mock 배치 = named handler** (인라인 배열 금지): `Step.Events.Init` 은 **문자열 핸들러 이름**(`"Init":"Step1Init"`)으로 두고, `scenario.Events` 에 그 핸들러를 정의해 `intent.mock` 을 그 안에 넣는다 — 예: `"Events": { "Step1Init": [{ "Action":"Script", "intent": { "mock": { "CtgX": [{...}] } } }] }`. `Step.Events.Init` 에 배열 `[{...}]` 을 직접 박으면 schema(`Init` 은 string)와 충돌해 불필요한 오류가 난다 — named handler 배치가 정석 (검증 직전 mock 이 raw `addSector` 로 자동 펼쳐져 `[proto]` 통과).
- **예외**: 실제 `scenario.DataSources`(`Fixed`/`Grid`) 가 채워져 있으면 그 바인딩은 정상이므로 mock 없이도 허용된다 (과도하게 정적으로 축소하지 말 것).

## 시퀀스 (이 순서로만)

1. **Bash:** `flex-scenario session start` → `{ build_id }` 발급. 이후 단계 표시용.
2. **Read:** `.claude/skills/scenario-gen/README.md` + `design-rules.md` + `intent-rules.md` — contract 메타 + 스타일/런타임 short-form 어휘 (모두 작음, 첫 호출에 한 번). examples 보다 먼저 읽어 산문 룰이 few-shot 보다 앞서도록.
3. **요청 분석** → 화면 종류 식별 (단순 폼 / list-detail / 다이얼로그 / Tree / Tab / Embed). **분기**: `/flex-spec` 등 **스펙 경로로 진입한 경우에만** 여기로 직행하지 말고 위 "진입 분기" 의 하네스(`references/spec-evolve/README.md`)로 `.spec.md` 를 먼저 만든 뒤 그 스펙을 이 단계 입력으로 삼는다. **기본(직접 생성)은 여기로 바로 온다** — 막연/구조 미제공이어도 멈추지 말고 routing/mockup 추론으로 데이터연결·목업을 직접 세팅한다(빈/정적 회귀 금지는 공통).
4. **Read:** `examples/index.json` → 적합한 example 1개 결정 → `examples/<id>.json` Read. **id 가 `design/...` 으로 시작하는 항목을 우선 선택** (raw 전용인 `basic/...` 는 호환 fallback).
   - **예제는 도메인이 아니라 구조로 고른다.** design 예제의 이름·title 은 구조(`list-filter-2step`, "리스트→상세→입력 (3-step)" 등)이며 `stepCount` / `patterns` / 구조 title 로 화면 종류에 맞는 것을 선택한다. 요청 도메인과 글자가 겹치는 예제를 찾으려 하지 말 것.
   - **예제는 패턴·컨벤션 학습용 참조이지 복사본이 아니다.** 시나리오를 그대로 가져오지 말고 step·텍스트·필드·라벨·항목을 **사용자의 실제 도메인에 맞게 새로 생성**한다. 예제가 요청과 똑같아 보이면 그건 복사 신호가 아니라 "구조만 빌리고 내용은 갈아끼우라"는 신호다.
5. **Read:** `patterns/index.json` → 적용할 패턴 1~2개 → `patterns/<tier>/<name>.json` Read.
6. **시나리오 구성** — schema 본체가 필요하면 `schemas/index.json` 으로 어떤 schema 인지 식별 후 `schemas/<name>.schema.json` Read. `design` 슬롯 형식 의문 시 `schemas/design-system/design.schema.json`. catalog enum 이 필요하면 `catalog.json` Read 또는 `flex-scenario catalog --section controlTypes` 등. **컨트롤 옵션 키가 의문일 때 `skill-guides/control-options.md` Read — 자주 박히는 오해 (`UseComma`/`UseFormat`/`DateFormat` 위치 오류 등) 정답 매핑이 한 표로 박혀 있다.**
7. (**Step 수 ≥ 3 또는 예상 60KB+ 면 필수, 그 외 권장**) **fragment-first** — Step 한 개씩 작성 후 `flex-scenario validate --schema step <fragment-file>` 로 단편 검증, 다음 Step 진행. 한 번에 전체를 Write 하면 (a) 8번에서 polynomial schema fail 폭주(oneOf 회귀), (b) 단일 거대 생성 turn 으로 시간이 폭증하고 실패 시 30KB+ 전체 재작성을 부른다 — 둘 다 fragment-first 가 차단. fragment 가 ok 인 Step 부터 누적 조립 → 마지막 8번 호출은 전체 합본 검증. **이미 쓴 시나리오의 수정은 `Edit`(부분) 로 하고 전체 `Write` 재작성은 금지** (자가검증 루프 6번과 동일 원칙).
8. **Bash:** `flex-scenario validate <scenario-file>` — 전체 검증. 아래 **자가검증 루프**.
9. **Bash:** `flex-scenario session finish --id <build_id>` — 세션 종료. 반환된 `artifact` 경로를 최종 답에 명시한다. **산출 JSON 본문을 `cat`/`Read` 로 다시 읽어 응답에 출력하지 않는다** — 경로만.
10. **Bash:** `flex-scenario create --file <artifact>` — 9번이 반환한 `artifact` 를 서버에 시나리오로 생성. 별도 요청 없이 9번 직후 이어서 호출한다(메타 생성과 시나리오 생성을 한 흐름으로). 응답의 `HTTP <status>` 와 생성 결과(`fScenarioID`/`fScenarioName`)를 최종 답에 함께 보고한다. 미인증이면 `create` 가 로그인을 유도하므로 그 흐름을 따른다. 4xx/5xx(비정상 종료코드)면 본문 메시지를 그대로 보고하고 성공으로 처리하지 않는다.

## ★ 자가검증 루프 (8번 단계의 본체)

`flex-scenario validate` 결과가 `ok:false` 인 채로 절대 종료하지 않는다.

1. `ok:true` → 즉시 9번으로. (validate 의 exit code 0 도 동일한 통과 신호 — stdout 의 `ok:true` 와 일치.)
2. `ok:false` → `errors[]` 를 `instancePath` / 분류 키 (`[no-inner-block]`, `[strict-fields]`, `[v1-only]`, `[no-service]`, `[mock-init]`, `[category-name]`, `[script-allow]`, `[step-nav]`, `[event-ref]`, `[display-key]` 등) 로 묶어 한꺼번에 본다. 첫 5개만 보고 멈추지 말 것.
3. **가장 깊은 `instancePath` 의 `kind:schema` 에러부터.** 분류 키가 보이면 해당 schema 본체 또는 `design-rules.md` 를 Read 해 정의 재확인 후 **한 번에 한 곳만** 수정. `oneOf`("must match exactly one schema in oneOf")·`strict-fields` 에러는 대개 더 깊은 한 개의 위반이 discriminator 를 통해 굴절된 **cascade 노이즈** — 깊은 `schema` 에러를 먼저 풀면 같이 사라진다. 큰 errorCount 에 휘둘리지 말 것(= 보통 한 원인 + 그 cascade). 상세: `skill-guides/failure-discipline.md`.
4. **첫 `ok:false` 또는 같은 에러 2회 → passing example 과 key-diff.** 유사 화면의 example 을 고르되 **반드시 먼저 `flex-scenario validate --no-write <후보 example>` 로 `ok:true` 를 확인**한다 — `ok:false` 인 example 을 baseline 삼지 말 것(현재 `examples/design/` 중 `ok:true` 가 보증된 것은 `reservation-app.json` 한 개). ★ example 검증엔 `--no-write` 필수 — 기본 validate 는 `ok:true` 시 materialized 본문을 입력 파일에 write-back 하므로, 빼먹으면 design short-form 예제가 raw 전개본으로 덮어써져 참조 자산이 변형된다 (write-back 은 **내가 만든 시나리오 파일에만** 허용). 내 실패 노드와 그 example 의 대응 노드를 **키 단위로 diff** 하면 차이는 거의 항상 한 필드다 — validator 내부를 읽기 전에 이 diff 가 원인을 더 빨리 찾는다. (`examples/index.json` 의 `controlTypes`/`stepCount` 로 유사 사례 식별.)
5. 분류 키가 보이면 해당 schema 본체 Read 또는 `design-rules.md` Read 로 정의 재확인 후 수정.
6. 같은 에러가 두 번째 발생하면 비슷한 **구조**의 example 본문을 다시 Read (= 재발 방지). `examples/index.json` 의 `stepCount` / `patterns` / `controlTypes` 로 유사 **구조**를 식별 (도메인 아님). 예제는 구조·컨벤션 참조용 — 내용 복사 아님.
7. **최대 12회 반복.** 12회 후에도 `ok:false` 면 그동안 `errorCount` 가 가장 낮았던 시나리오를 최종 출력으로. 포기하고 설명문만 남기는 행위 금지.
8. **헛도는 신호 → fragment 격리, 전체 재작성 금지.** 같은 에러에서 3회 이상 헛돌거나 **직전 회차 대비 `errorCount` 감소가 10% 미만**이면, 문제 노드를 부분 제거 → `flex-scenario validate --schema <name> <fragment>` 로 좁혀 위치 특정 → 정상 fragment 부터 재조립한다. **전체 시나리오를 통째로 다시 Write 하지 말 것** — rewrite 는 이미 해결한 원인을 새 줄번호로 재도입하는 진단 회피다(`failure-discipline.md`). 부분 수정은 `Edit` 로.

## 절대 금지 (cross-check 분류와 1:1)

- **예제 시나리오 통째 복사 금지** (행동 규칙 — cross-check 아님). 예제는 구조·패턴·컨벤션 **참조**일 뿐이다. step·텍스트·필드·라벨·항목은 사용자의 실제 도메인에 맞게 **재생성**한다. 예제 선택도 도메인 글자 일치가 아니라 구조(`stepCount`/`patterns`/구조 title)로 — 요청과 똑같아 보이는 예제는 복사 신호가 아니라 "구조만 빌리고 내용은 갈아끼우라"는 신호. (절차 정본: §시퀀스 4)
- `Collections: {}` / `ServiceBinding: {}` — 어떤 키도 추가 금지.
- `UseInnerBlock` / `InnerBlockKey` / `RepeatStyle` 사용 금지 → 반복은 `DataConnection.DataUsage:"query"`. (`[no-inner-block]`)
- `DataSourceType` 은 `Fixed` 또는 `Grid` 만. `Service` / `API` / `Collection` 금지. (`[no-service]`)
- 모든 `Group` 에 `UseDataConnection` 명시 — 비연결 그룹도 `"UseDataConnection": false` 를 박을 것. 키 생략 시 스튜디오가 레거시(`UseOldDataConnection:true`)로 처리해 구버전 렌더. (`[group-dc]`, 상세 `docs/group.md` "함정")
- `EmbedScenarioPrefix` 키 자체 금지.
- schema 미정의 키 금지 — strict_fields 항상 ON. 막히면 schema 본체 Read. **단 예외 1건**: `design` 키는 모든 Group/Control 에서 허용 — materialize 단계가 검증 진입 직전에 raw 스타일 필드로 expand 하고 `design` 키 자체는 결과 트리에서 제거하므로 strict 까지 살아남지 않는다 (`group.schema.json`/`control/_base.schema.json` 의 properties 에도 등재됨). 19개 슬롯과 형식은 `design-rules.md` / `schemas/design-system/design.schema.json` 참조. (`[strict-fields]`)
- v1 컨트롤 12종 외 사용 금지 — `catalog.json` 의 `controlTypes` 가 진실원본. (`[v1-only]`)
- 시작 Step.Init 에 사용 카테고리 mock 섹터 (`intent.mock: { CtgX: [...] }` 권장, raw `f.Collection.addSector(..., '<카테고리>')` 도 통과). (`[mock-init]`)
- 정적 표시는 `Label.labeltext`, 동적 바인딩은 `DataConnection`+`Ckeys`+`UseDataConnection:true` 이되 **반드시 시작 Step.Init 에 `intent.mock` 으로 해당 카테고리 데이터 동반**. `DataSources`(Fixed/Grid) 도 mock 도 없이 `DataConnection`/`Ckeys`/`LabelCKey` 를 박으면 차단 — 단 실제 `DataSources` 가 있으면 정상 바인딩 허용. (`[proto]`, 상세 §산출 형식 "데이터 표시 결정")
- 카테고리명 `Ctg` 접두 + PascalCase. (`[category-name]`)
- DataSource 기반 Combo/Search 본체에는 `CtrlDisplayCkey` 또는 `DisplayValue` (비어있지 않은 값) 필수 — 둘 다 비우면 선택 후 본체에 빈 칸. (`[display-key]`)
- Script Action 본문 — **`intent` short-form 우선** (intent-rules.md). intent 펼친 결과 또는 raw 작성 시 화이트리스트: `f.Collection.addSector` / `_c.*` / `Current.step.reload(WithAnimation)` / `f.Content(fid).reload(WithAnimation)` / `f.Date` / `f.Script.load` / `f.MessageBox(type).setTitle().setDescription().addButton/addBtn().show()` / `f.Event(name).runNext|break`. (`[script-allow]`)
- `Ckeys` / `CategoryName` / mock 섹터키 / `intent.categories` ckey / `updateActive.set` 키에 시스템 예약어 금지 — [naming-objects.schema.json](schemas/naming-objects.schema.json) 의 `sectorReservedKeys` (`status`/`isActive`/`length` 등 15개) + `jsReservedWords` (`for`/`class`/`Object`/`prototype` 등 50+개). intent 는 **case-insensitive** 차단 (`Status`/`STATUS`/`Length` 등 변종까지).
- `BackButton.Next` 는 항상 `"None"`.

## ID 규칙

- Step ID: `^Step[1-9][0-9]*$`. `Step0`/`Step01`/`StepMain` 불가.
- Group/Control/BottomButton ID: `^f_[1-9][0-9]*$`. **시나리오 전체에서 유일** (Dialog 자식 포함).
- 한 번 발급한 ID 는 삭제 후에도 재사용 금지.
- `StartSteps` + 모든 `Step.Next` 합집합에 각 Step 정확히 1번 등장.

## Read 우선순위 (효율 가이드)

매번 모든 자산을 Read 하지 말 것. 필요한 경우에만:

1. **항상**: `README.md`, `design-rules.md`, `examples/index.json` (모두 작음, 첫 호출에 한 번씩). `design-rules.md` 는 생성 시 스타일 어휘 + cross-check 키 정의 양쪽 진실원본 — examples 보다 앞에 둬서 산문 룰이 few-shot 보다 우선되도록.
2. **화면 종류 결정 후**: `examples/<id>.json` 1개 (`design/<id>` 우선 선택), `patterns/index.json`, `patterns/<tier>/<name>.json` 1~2개.
3. **schema 의문 시**: `docs/index.json` → 해당 `docs/<rel>.md` 또는 `schemas/<name>.schema.json`. `design` 슬롯 정확한 형식은 `schemas/design-system/design.schema.json`.
4. **enum 확인 시**: `catalog.json` 또는 `flex-scenario catalog --section <key>`.
5. **에러 디버그 시**: `design-rules.md` 재독 (분류 키 ↔ 룰 매핑) + 문제 노드 부근 schema 본체.

`docs/` 의 `*.md` 는 schema 본문보다 사람이 읽기 좋아 모호한 경우 먼저 본다 (예: `docs/scenario.md`, `docs/step.md`, `docs/control/*.md`).