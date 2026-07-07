# scenario-gen — 생성 오리엔테이션

flextudio meta-contract v1 화면 시나리오 JSON 을 만드는 스킬의 **생성 관점 전용** 안내.
(컨트랙트 내부 구조·폴더 레이아웃·엔진 호환은 생성과 무관하므로 제외 — 필요 시 repo 루트 `README.md`.)
권위 절차는 `SKILL.md`, 스타일 어휘는 `design-rules.md`, 런타임 short-form 은 `intent-rules.md`.

## ★ 생성 결정 규칙 (노드를 만들기 전에 먼저 판정)

생성 오류의 대부분은 아래 결정을 건너뛰어 발생한다. 컨트롤/그룹을 쓰기 전에 판정할 것.

- **A. 데이터 표시 — 정적 vs 동적** (`[proto]` 차단 1차 원인):
  - 정적 문구·단건 라벨 → `Label` (`LabelType:'labeltext'` + `labeltext:'값'`). `DataConnection`/`Ckeys`/`LabelCKey` 박지 말 것.
  - 리스트 반복·Combo/Search 선택지·Calendar 데이터 → Group `UseDataConnection:true` + `DataConnection`(**객체** `{TargetType:'category', DataUsage, CategoryName}`) + 자식 `Ckeys`/`LabelCKey`. **이때 반드시 시작 Step.Init 에 mock 동반** — `Step.Events.Init:"<핸들러>"`(문자열) + `scenario.Events.<핸들러>` 안에 `intent.mock:{ Ctg<X>:[{...}] }`. (인라인 배열 Init / named 핸들러 밖 intent.mock 금지.)
  - 예외: 실제 `scenario.DataSources`(`Fixed`/`Grid`) 가 있으면 mock 없이도 정상 바인딩.
- **B. 작성 형식 — short-form 우선**:
  - 스타일 → `design` 키 (Group/Control). 표현 불가 시에만 raw escape. 상세 `design-rules.md`.
  - 데이터/스크립트 → `intent` 키 (`mock`/`script`). 상세 `intent-rules.md`. 펼침 후 raw 는 화이트리스트 검사.
  - 반복 렌더링 → `DataConnection.DataUsage:'query'` (`UseInnerBlock`/`RepeatStyle` 금지).
- **컨트롤 선택**: v1 15종만(아래 범위). 컨트롤별 필수/옵션·흔한 오해(InputType↔MaskType, LabelType, 버튼 Click, InputFile Module, Fixed Combo SaveNameKey)는 `skill-guides/control-options.md`.
- **모든 Group 에 `UseDataConnection` 명시**(비연결도 `false`). `Collections`/`ServiceBinding` 은 `{}` 고정.

상세 작성 순서·자가검증 루프·실패 복구는 `SKILL.md` 와 `skill-guides/failure-discipline.md`.

## v1 컨트랙트 범위

### 노드
- **Step**: `StepView` (`""`/`SlideUp`/`PopUp`), `StepSub`
- **Group**: 단일 (Layout 흡수). DataConnection 5종 (`default`/`new`/`update`/`detail`/`query`)
- **Control 15종**: `InputText`, `InputNumber`, `InputMask`, `InputDate`, `MultiInputBox`, `Combo`, `Search`, `CheckBox`, `RadioBox`, `Label`, `ImageBox`, `InputFile`, `Tree`, `Tab`, `Embed`

### 범위 외 (부분 통과)
- 그 외 ControlType (`Button`/`Calendar`(단독)/`ComboList`(단독)/`List`(단독)/`Signature`/`Line` 등) — `OtherControl` fallback 으로 통과만.
- ServiceBinding/Events 핸들러/DataSources 상세, LoadScript/Event Script DSL 검증.

v1 은 범위 외 노드도 `additionalProperties:true` 로 받아넘기므로 **부분 검증**은 통과한다.

## 검증 (자가검증 루프의 도구)

CLI 진입은 `flex-scenario` (PATH). command not found 면 `node "$(npm root -g)/@flextudio/scenario/bin/flex-scenario.mjs" ...`.

```bash
flex-scenario validate <scenario.json>              # 전체 시나리오 (schema + 모든 cross-check)
flex-scenario validate --schema <ref> <fragment>    # 단편(Group/Control/DataSource) — cross-check 없이 schema 만
flex-scenario validate --no-write <file>            # 검증만 (materialized write-back 안 함)
```

`<ref>` 4형태: file key(`control/input-text.schema.json`) · `$id` · shorthand(`input-text`/`group`) · 부분 문자열(단일 매칭). `#/$defs/<name>` JSON Pointer 도 가능.

```bash
flex-scenario validate --schema input-text fragment.json
flex-scenario validate --schema group group-fragment.json
flex-scenario validate --schema 'data-sources#/$defs/dataSource' ds.json
```

**에러 읽기**: `errorCount` 는 볼륨(한 원인의 cascade). `kind:schema` 를 가장 깊은 `instancePath` 부터, `oneOf`("must match exactly one schema")·`strict-fields` 는 대개 cascade 노이즈. 태그(`[proto]`/`[mock-init]`/`[date]`/`[ds-key]`/`[combo-fixed]`/`[group-dc]`/`[step-nav]`/`[event-ref]`/`[display-key]` …) ↔ 룰 매핑은 `design-rules.md`, 복구 규율은 `skill-guides/failure-discipline.md`. fragment-first 로 좁히고 한 번에 한 곳만 고친다.
