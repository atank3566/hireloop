# INTENT — 슬롯 / Scope 카탈로그

> `intent:{ <slot>: ... }` 진입점의 슬롯 정의 + 호스트 scope 매트릭스. design-system 의 `DESIGN.md` 와 짝.
> 이 파일이 진실원본 — `intent.schema.json` 의 enum 도, `materialize.mjs` 의 디스패처도 여기서 끌어온다.

## 형태

```jsonc
{
  // ... 호스트 노드의 다른 필드들 ...
  "intent": {
    "<slot>": ...                  // mock / script / categories
  }
}
```

- `intent` 키는 펼침 후 트리에서 **제거**된다 — strict-fields 통과를 위해.
- 펼침 결과는 호스트 노드의 다른 필드들과 **머지** 된다 (디자인 시스템의 `applyDesign` 동일 정책).
- 알려지지 않은 슬롯/kind / 허용되지 않은 scope 는 `materialize` 에러로 보고하고 펼침 skip.

---

## Scope 카탈로그

펼침이 허용되는 호스트 위치를 분류한 enum. `materialize.mjs` 의 `inferScope(node, path)` 가 추론한다.

| Scope | 의미 | 추론 단서 | 사용 예 |
|---|---|---|---|
| `scenario-root` | 시나리오 루트 메타 | `path === "$"` | `Categories` / `Collections` 정의 (Phase 4) |
| `event-script-init` | **Step.Events.Init** 의 `Action:'Script'` | path 가 `$.Steps.<id>.Events.Init[N]` + `Action:'Script'` | mock 데이터 (`addSector` 만 허용되는 단계) |
| `event-script` | 그 외 모든 Events 의 `Action:'Script'` (Step의 Loaded/Click 등, Group/Control 의 Events 포함) | path 가 `.Events.<other>[N]` + `Action:'Script'` | 일반 idiom — `updateActive` / `dialog` / `clearCategory` / `reloadGroup` / `deleteActive` |
| `load-script` | `{% ... %}` LoadScript 본문 | (트리 노드 아님 — placeholder) | 추후 LoadScript 안에서도 함수형 short-form 도입 시 사용. 현재는 미구현 |
| `filter-script` | `ParamBlock.Filters[].Script` 본문 | path 가 `.Filters[N]` + `Script` 키 | 추후 필터 short-form. 현재는 미구현 |
| `group` | Group 노드 자체 (`ContentsType:'Group'`) | node-based fallback | 추후 Group 단위 short-form (예: DataConnection 단축) |
| `control:<Type>` | 구체 컨트롤 노드 | `ControlType:'<Type>'` (node-based fallback) | 추후 컨트롤별 short-form |
| `unknown` | 위 모두 해당 안 됨 | — | 모든 슬롯에서 거부 |

### Scope 강제 규칙

각 슬롯은 `allowedScopes` 화이트리스트를 갖는다. 트리 walk 중 발견된 `intent.<slot>` 의 호스트 scope 가 화이트리스트 외면 → `kind:'intent', phase:'wrong-scope'` 에러로 거부 + 허용 scope 목록 안내. 펼침은 skip.

추론 우선순위:
1. **path 기반** — `.Events.<name>[N]` 매치가 있으면 event-script-init / event-script.
2. **node 기반 fallback** — path 매치 실패 시 `ContentsType:'Group'` / `ControlType:'X'` 로 fallback.
3. **둘 다 매치 실패** → `unknown`.

---

## 슬롯 ⨯ Scope 매트릭스

| Slot | 활성 Phase | 허용 Scope | 펼침 결과 |
|---|---|---|---|
| `mock` | **Phase 2 (활성)** | `event-script-init` | host Action 의 `Script` 본문 → `f.Collection.addSector(...)` 라인들 |
| `script` | **Phase 3b (활성 — 5 kind)** | `event-script`, `event-script-init` | host Action 의 `Script` 본문 → kind 별 정형 idiom |

> **`categories` 슬롯은 도입 후 폐기** — `scenario.Collections` 와 `Panel.{Category, CategoryOrder, Collection.Ckeys}` 모두 스튜디오가 자동 재생성하므로 AI 단에서 카테고리 정의를 박을 필요 없음. 카테고리 사용 사실은 `intent.mock` 의 카테고리명 + `DataConnection.CategoryName` 으로 cross-check 가 자동 추출.

---

## Slot: `mock` (Phase 2 — 활성)

### Shape

```jsonc
{
  "Action": "Script",
  "intent": {
    "mock": {
      "<CategoryName>": [ { <fieldKey>: <value>, ... }, ... ],
      ...
    }
  }
}
```

### 펼침 규칙

각 카테고리의 각 섹터 객체가 **한 줄의 `f.Collection.addSector(...)` 호출**로 펼쳐진다.

```jsonc
// 입력:
{
  "Action": "Script",
  "intent": {
    "mock": {
      "CtgEmployee": [
        { "fName": "홍길동", "fAge": 30 },
        { "fName": "김철수", "fAge": 25 }
      ],
      "CtgDept": [
        { "fName": "개발팀" }
      ]
    }
  }
}

// 펼친 후:
{
  "Action": "Script",
  "Script": "f.Collection.addSector({fName: \"홍길동\", fAge: 30}, 'CtgEmployee')\nf.Collection.addSector({fName: \"김철수\", fAge: 25}, 'CtgEmployee')\nf.Collection.addSector({fName: \"개발팀\"}, 'CtgDept')"
}
```

- 카테고리는 객체 키 순서대로 emit (호출 순서 결정).
- 같은 카테고리 안 섹터는 배열 순서대로.
- 호스트 Action 의 `Script` 가 이미 있으면 펼침 결과를 **앞에 prepend** (mock 은 init 단계라 우선).
- 빈 배열 (`[]`) → 펼침 0 라인.

### Scope 강제

`mock` 은 `event-script-init` (Step.Events.Init 의 `Action:'Script'`) 에서만 허용. 그 외 위치(예: Loaded / Click) 에 박으면 `wrong-scope` 에러 — Init 외 단계에서 mock 을 박는 건 Step 흐름 모델 위반.

### 가드

- **카테고리명** — `^Ctg[A-Z][A-Za-z0-9]*$` (cross-check `[category-name]` 과 정렬). 위반 시 `mock-category-name` 에러.
- **섹터 객체 형태** — `{ key: value, ... }`. 배열/null/문자열은 `mock-sector-shape` 에러.
- **섹터 키 형식** — `^[A-Za-z][A-Za-z0-9_]*$` (JS 식별자). 위반 시 `mock-sector-key-format` 에러.
- **예약어 키** — `_SUID` / `_mSUID` / `for` / `class` / `length` / `if` / `else` / `new` / `delete` / `return` 차단. 위반 시 `mock-sector-key-reserved` 에러.
- **빈 mock** (`{}` 또는 빈 배열) — 에러 아님. 펼침 결과 빈 문자열.

### LLM 작성 시 권장

```jsonc
// ✅ Init Action 에 mock 만:
{ "Events": { "Init": [ { "Action": "Script", "intent": { "mock": { "CtgList": [...] } } } ] } }

// ✅ mock + 후속 reload 분리:
{ "Events": { "Init": [
  { "Action": "Script", "intent": { "mock": { "CtgList": [...] } } }
] } }
// (reload 는 Loaded 핸들러에서 — Init 에서 reload 는 [script-allow] 가 차단)

// ❌ Click 핸들러에 mock — wrong-scope 거부:
{ "Events": { "Click": [ { "Action": "Script", "intent": { "mock": {...} } } ] } }
```

---

## Slot: `script` (Phase 3b — 활성: 6 kind)

### Shape

```jsonc
{
  "Action": "Script",
  "intent": {
    "script": { "kind": "<kindName>", ... kindProps }
  }
}
```

### Kind 매트릭스

| kind | props | 펼침 결과 | 정본 |
|---|---|---|---|
| **`dialog`** | `{ type, title, body?, buttons:[{label, event?, moveType?, color?}] }` | `f.MessageBox(type).setTitle().setDescription()?.addButton/addBtn(...).show()` | [f_messagebox.md](../script/f_messagebox.md) |
| **`reloadGroup`** | `{ fid }` | `f.Content(fid).reload()` | [f_content.md](../script/f_content.md) |
| **`clearCategory`** | `{ cat, reload?:fid }` | `f.Collection.removeSector('all', cat)` + 옵션 reload | [f_collection.md](../script/f_collection.md) §3-1 |
| **`deleteActive`** | `{ cat, reload?:fid }` | 가드 2단 + `cur.release()` (완전삭제) + 옵션 reload | [sector.md](../collection/sector.md) §4-4 |
| **`updateActive`** | `{ cat, set:{...}, reload?:fid }` | 가드 2단 + 다중 필드 직접 대입 + 옵션 reload | [_c.md](../collection/_c.md), [scripts.md §A](../../../skill-guides/scripts.md) |
| **`copyStepValues`** | `{ from, to, map:{src→dst}, reload?:fid }` | 가드 4단 + `dst.<k> = src.<k>` 라인 N + 옵션 reload — Step 간 활성 섹터 값 전달 (병목 2-a `{=Field}` 침투 차단) | [sector.md](../collection/sector.md) §4-3 |

### 머지 정책 — raw `Script:` 와 공존

`intent.script` 와 raw `Script:` 가 **같은 Action 안에 공존 가능**. 펼침 결과는 raw `Script` 의 **앞에 prepend** (mock 과 동일 정책 — intent 가 항상 먼저 실행).

```jsonc
// 입력
{ "Action":"Script",
  "Script":"_c.CtgList.activeSector.fStatus = '확정'",
  "intent":{ "script":{ "kind":"dialog", "type":"Completed", "title":"완료", "buttons":[{"label":"확인"}] } }
}

// 펼친 후
{ "Action":"Script",
  "Script":"f.MessageBox('Completed').setTitle('완료').addBtn('확인', null).show()\n_c.CtgList.activeSector.fStatus = '확정'"
}
```

이게 자연 순서 (다이얼로그 표시 → 결과 반영) 와 맞아 떨어지는 경우가 많지만, **prepend 라는 규약은 명시적으로 기억해야 한다**. 다른 순서가 필요하면 Action 을 둘로 쪼개거나 전체를 raw 로 적는다.

### Kind: `dialog` 상세

#### props ↔ f.MessageBox 메서드 1:1 매핑

| props 필드 | f.MessageBox 메서드 | 직렬화 |
|---|---|---|
| `type` | `f.MessageBox(<type>)` | `'Alert'` / `'Error'` / `'Completed'` 단일 따옴표 문자열 |
| `title` (필수) | `.setTitle(<title>)` | `jsString` 이스케이프 (백슬래시·작은따옴표·개행) |
| `body` (옵션) | `.setDescription(<body>)` | 없으면 호출 생략 |
| `buttons[i]` (`moveType` 있음) | `.addButton(MOVETYPE_<X>, label, event\|null)` | 풀 시그니처 |
| `buttons[i]` (`moveType` 없음) | `.addBtn(label, event\|null, color==='sub'?true)` | 약식 |
| (자동) | `.show()` | 항상 종결자 — 종결자 누락 불가능 |

#### 예시 — 3종

**(a) 단순 확인 — 한 버튼**
```jsonc
// intent
{ "intent": { "script": {
    "kind": "dialog", "type": "Completed",
    "title": "완료", "body": "처리되었습니다.",
    "buttons": [ { "label": "확인" } ]
}}}
```
```js
// 펼친 결과
f.MessageBox('Completed').setTitle('완료').setDescription('처리되었습니다.').addBtn('확인', null).show()
```

**(b) 확인/취소 — 두 버튼, 보조 스타일**
```jsonc
{ "intent": { "script": {
    "kind": "dialog", "type": "Alert",
    "title": "삭제하시겠습니까?", "body": "이 작업은 되돌릴 수 없습니다.",
    "buttons": [
      { "label": "확인", "event": "DeleteConfirmEvent" },
      { "label": "취소", "color": "sub" }
    ]
}}}
```
```js
f.MessageBox('Alert').setTitle('삭제하시겠습니까?').setDescription('이 작업은 되돌릴 수 없습니다.').addBtn('확인', 'DeleteConfirmEvent').addBtn('취소', null, true).show()
```

**(c) 풀 시그니처 — moveType 분기**
```jsonc
{ "intent": { "script": {
    "kind": "dialog", "type": "Error",
    "title": "오류", "body": "네트워크에 연결할 수 없습니다.",
    "buttons": [
      { "label": "재시도", "event": "RetryEvent", "moveType": "None" },
      { "label": "처음으로", "moveType": "Init" }
    ]
}}}
```
```js
f.MessageBox('Error').setTitle('오류').setDescription('네트워크에 연결할 수 없습니다.').addButton(MOVETYPE_NONE, '재시도', 'RetryEvent').addButton(MOVETYPE_INIT, '처음으로', null).show()
```

#### 가드

| 가드 | 위반 시 phase |
|---|---|
| `type ∈ {'Alert','Error','Completed'}` | `dialog-type-enum` |
| `title` 비어있지 않은 문자열 | `dialog-title-required` |
| `body` 옵션이지만 있으면 문자열 | `dialog-body-type` |
| `buttons` 배열 + 1개 이상 | `dialog-buttons-empty` |
| 각 `buttons[i].label` 비어있지 않은 문자열 | `dialog-button-label` |
| `event` 있으면 비어있지 않은 문자열 (실재성 검사는 `[event-ref]`) | `dialog-button-event-format` |
| `moveType` 있으면 enum 6종 | `dialog-button-moveType-enum` |
| `color` 있으면 `'sub'` 만 | `dialog-button-color-enum` |

#### Cross-check 통합

- 펼침 결과는 `f.MessageBox()...show()` 라인 → `[script-allow]` 의 화이트리스트 통과.
- `event` 인자의 실재성은 기존 `[event-ref]` cross-check 가 펼친 Script 문자열을 검사.
- inline function 콜백은 short-form 의 props shape 자체가 표현 불가 (`{event:'문자열'}` 만) — 구조적으로 차단.

### Kind: `reloadGroup`

가장 단순. `f.Content(fid).reload()` 한 줄.

```jsonc
{ "intent": { "script": { "kind": "reloadGroup", "fid": "f_3" } } }
```
```js
// 펼친 결과
f.Content('f_3').reload()
```

가드: `fid` 가 `^f_[1-9][0-9]*$` 패턴이 아니면 `reloadGroup-fid-format`.

### Kind: `clearCategory`

카테고리 비우기 표준 idiom + 옵션 reload.

```jsonc
{ "intent": { "script": {
    "kind": "clearCategory",
    "cat": "CtgOrderHistory",
    "reload": "f_3"
}}}
```
```js
// 펼친 결과
f.Collection.removeSector('all', 'CtgOrderHistory')
f.Content('f_3').reload()
```

- `reload` 생략 시 한 줄만 emit.
- `cat` 은 `Ctg` 접두 + PascalCase 필수.

### Kind: `deleteActive`

활성 섹터 완전삭제 — scripts.md §C 권장 패턴 자동 생성 (가드 2단 + `cur.release()` + 옵션 reload).

```jsonc
{ "intent": { "script": {
    "kind": "deleteActive",
    "cat": "CtgCart",
    "reload": "f_5"
}}}
```
```js
// 펼친 결과
if (!_c.CtgCart) return;
const cur = _c.CtgCart.activeSector;
if (!cur) return;
cur.release();
f.Content('f_5').reload();
```

> ★ `cur.delete()` 가 아니라 **`cur.release()`** — `delete()` 는 added 가 아닌 섹터를 deleted 상태로 컬렉션에 남긴다(백엔드 동기화용 표시). 생성 시나리오는 서버 동기화가 없으므로 잔존 deleted 섹터가 집계/반복 루프를 오염시킨다 — 완전삭제 `release()` 가 정본 ([sector.md](../collection/sector.md) §4-4). raw `.delete()` 호출은 `[script-allow]` 가 차단.

`_c.<Cat>.deleteActiveSector()` 같은 가짜 메서드 / 가드 누락 / inline 콜백 모두 short-form 으로는 구조적으로 표현 불가 → 자동 차단.

### Kind: `updateActive`

활성 섹터의 N개 필드 일괄 갱신 — scripts.md §A 권장 패턴 자동 생성 (가드 2단 + 직접 대입 N + 옵션 reload).

```jsonc
{ "intent": { "script": {
    "kind": "updateActive",
    "cat": "CtgList",
    "set": {
      "fStatus": "확정",
      "fApprovedAt": "2024-01-01",
      "fApprovedCount": 3
    },
    "reload": "f_3"
}}}
```
```js
// 펼친 결과
if (!_c.CtgList) return;
const cur = _c.CtgList.activeSector;
if (!cur) return;
cur.fStatus = '확정';
cur.fApprovedAt = '2024-01-01';
cur.fApprovedCount = 3;
f.Content('f_3').reload();
```

> `reload` / `fid` 는 실제 그룹 ID (`f_숫자`) 형태만 허용 — 시스템 ID 발급기와 정합. 의미있는 이름(`f_listGroup` 등) 은 raw 가이드의 placeholder 일 뿐 실제 시나리오에서는 발급된 숫자 ID 사용.

- **set 의 키는 카테고리 정의에 없어도 OK** — 런타임이 동적으로 추가. 형식 검사만 (JS 식별자 + 예약어 차단).
- 값 직렬화: string → `'…'`, number/boolean/null → 그대로, object/array → `JSON.stringify`.
- 다량 변경은 `set` 메서드(`cur.set('k', v)`) 가 아니라 **직접 대입** + 마지막에 한 번만 reload — 깜빡임 최소화.

### Kind: `copyStepValues`

Step 간 활성 섹터 필드 1대1 매핑. 병목 2-a — `{=Field}` 토큰을 script 자리에 박는 raw 사고를 short-form 으로 흡수.

#### 적용 시나리오

이전 Step 의 입력 카테고리(예: `CtgTripBasic` — 기본정보 입력) 에 모인 값을 현재 Step 의 요약/확인 카테고리(예: `CtgTripSummary` — 출장 요약 표시) 로 옮길 때. 같은 컬렉션의 다른 카테고리이므로 `_c.<from>.activeSector` 와 `_c.<to>.activeSector` 둘 다 살아있어야 한다 — 가드 4단.

> **같은 카테고리를 두 Step 이 공유**하는 경우는 이 idiom 이 아니라 단순 `CtrlDisplayCkey` 바인딩으로 해결 — script 자체가 불필요. `copyStepValues` 는 두 카테고리가 다를 때만 의미가 있다.

#### 예시

```jsonc
// 입력 — Step 3 onShow 핸들러에서 Step 1/2 의 값 모음
{ "intent": { "script": {
    "kind": "copyStepValues",
    "from": "CtgTripBasic",
    "to": "CtgTripSummary",
    "map": {
      "fDestination": "fDestCity",
      "fDeptName": "fDeptName",
      "fPurpose": "fPurpose"
    },
    "reload": "f_30"
}}}
```

```js
// 펼친 결과
if (!_c.CtgTripBasic || !_c.CtgTripSummary) return;
const src = _c.CtgTripBasic.activeSector;
const dst = _c.CtgTripSummary.activeSector;
if (!src || !dst) return;
dst.fDestCity = src.fDestination;
dst.fDeptName = src.fDeptName;
dst.fPurpose = src.fPurpose;
f.Content('f_30').reload();
```

#### 가드

| 가드 | 위반 시 phase |
|---|---|
| `from` 이 `^Ctg[A-Z][A-Za-z0-9]*$` | `copyStepValues-from-format` |
| `to` 가 `^Ctg[A-Z][A-Za-z0-9]*$` | `copyStepValues-to-format` |
| `map` 이 객체 + 1개 이상 키 | `copyStepValues-map-shape` / `-map-empty` |
| `map` 값(`dst`) 이 문자열 | `copyStepValues-map-dst-shape` |
| `map` 의 src/dst 키 형식 / 예약어 | `copyStepValues-map-src-key-format` / `-src-key-reserved` / `-map-dst-key-format` / `-dst-key-reserved` |
| `reload` 가 `^f_[1-9][0-9]*$` (옵션) | `copyStepValues-reload-format` |

#### 변환식 매핑이 필요하면

`src.fStart + ' ~ ' + src.fEnd` 처럼 두 필드를 합치거나 가공해야 하는 경우 short-form 으로 표현 불가 — raw `Script:` 본문으로 escape hatch. `copyStepValues` 는 1대1 매핑만 다룬다 (단순성 보존).

### 공통 가드 (5 kind)

| 가드 | 위반 시 phase |
|---|---|
| `cat` 이 `^Ctg[A-Z][A-Za-z0-9]*$` | `<kind>-cat-format` |
| `reload` 가 `^f_[1-9][0-9]*$` (옵션) | `<kind>-reload-format` |
| `fid` (`reloadGroup`) 가 fid 패턴 | `reloadGroup-fid-format` |
| `set` (`updateActive`) 객체 + 1개 이상 키 | `updateActive-set-shape` / `-set-empty` |
| `set` 키 형식 / 예약어 | `updateActive-set-key-format` / `-set-key-reserved` |
| `from`/`to` (`copyStepValues`) 카테고리명 | `copyStepValues-from-format` / `-to-format` |
| `map` (`copyStepValues`) 객체 + 1개 이상 매핑 | `copyStepValues-map-shape` / `-map-empty` |
| `map` 의 src/dst 키 형식 / 예약어 | `copyStepValues-map-src-key-*` / `-map-dst-key-*` |

---

## Slot: `categories` — 도입 후 폐기

> Phase 4 에서 도입했다가 폐기. **이유**: `scenario.Collections` 와 `Panel.{Category, CategoryOrder, Collection.Ckeys}` 모두 스튜디오가 운영 시점에 자동 재생성하므로 AI 가 카테고리 정의를 박을 필요 없음. AI 생성 모드에서는 모두 빈 객체로 시작 (`Collections: {}` 은 schema 의 `const:{}` 로 잠금 복원).
>
> **대안**:
> - 카테고리 사용 사실 자체는 `intent.mock` 의 카테고리명 + `DataConnection.CategoryName` / `TargetSector.CategoryName` 으로 cross-check 가 자동 추출 — `[mock-init]` / `[category-name]` 검증은 정상 동작.
> - 컬렉션키 타입은 시스템이 운영 시점에 결정. AI 단에서 type 정보를 미리 박을 필요 없음.

`intent.categories` 키를 시나리오에 박으면 — `unknown-slot` 에러 (허용: `mock` / `script`).

---

## 펼침 단계 순서

```
validate entry (flex-scenario.mjs):
  ① materializeScenario   (pattern + design — schema/v1/patterns/_base.materialize.mjs)
  ② applyIntentToScenario  (intent walker — runtime/v1/intent-system/materialize.mjs)
       ├─ scope 추론 (inferScope)
       ├─ 슬롯별 펼침 디스패치 (KNOWN_SLOTS[slot].expand)
       │     ├─ mock        → expandMock (직접)
       │     ├─ script      → expandScript → kinds/<kind>.mjs registry 디스패치
       │     └─ categories  → expandCategoriesSlot (직접)
       └─ intent 키 제거 + 호스트 노드와 머지
  ③ ajv basic / strict
  ④ cross-checks
```

`_base.materialize.mjs` 와 `runtime/v1/intent-system/materialize.mjs` 는 **책임 분리** — 전자는 컨트롤 트리 (pattern + design), 후자는 런타임 영역 (컬렉션/스크립트/카테고리). 호출자 (validate entry) 가 명시적으로 두 단계 순차 호출.

---

## 새 script kind 추가하기

`intent.script` 의 kind 는 `kinds/<name>.mjs` 파일을 추가하면 자동 등록. dispatcher 코드 수정 불필요.

### 1. 파일 생성

```js
// runtime/v1/intent-system/kinds/myNewKind.mjs

import { jsString, jsValue, CATEGORY_NAME_RE, FID_RE, validateKey } from "./_base.mjs";

export const meta = Object.freeze({
  name: "myNewKind",
  allowedScopes: null,           // null = 슬롯의 allowedScopes 를 따름 (event-script / event-script-init)
  summary: "한 줄 요약 — INTENT.md kind 매트릭스에 표기",
});

export default function expand(props, scopePath) {
  const errors = [];

  // 1) 가드 — props 형식 검사. 위반 시 errors.push({ kind:'intent', phase:'myNewKind-<field>-...', path, message }).
  // 2) 펼침 — 가드 통과 시 raw Script 본문 문자열 생성.
  // 3) return { script: '<펼친 결과>', errors };

  return { script: "...", errors };
}
```

- **파일명 = kind 이름** (확장자 제외). `_` 접두 파일은 무시 (`_base.mjs` 등).
- `default export` 가 펼침 함수 — `(props, scopePath) => { script, errors }`.
- `meta.name` 은 introspection 용 — 파일명과 동일 권장.

### 2. INTENT.md 의 Kind 매트릭스 추가

위 "Kind 매트릭스" 표에 한 줄 추가 (props / 펼침 결과 / 정본 링크).

### 3. intent.schema.json 의 scriptSlot enum 갱신

```json
"scriptSlot": {
  "properties": {
    "kind": {
      "enum": ["dialog", "reloadGroup", "clearCategory", "deleteActive", "updateActive", "myNewKind"]
    }
  },
  "allOf": [
    ...,
    { "if": { "properties": { "kind": { "const": "myNewKind" } } }, "then": { "$ref": "#/$defs/myNewKindProps" } }
  ]
},

"$defs": {
  ...,
  "myNewKindProps": { ... }
}
```

### 4. (선택) example 추가

`examples/intent/<scenario-name>.json` 에 사용 데모.

이게 전부. materialize.mjs 의 dispatcher 코드는 부팅 시 `kinds/` 를 스캔해서 자동 등록한다.

---

## 예약어 정책 (Phase 5·B)

mock 의 섹터 키 / categories 의 ckey / updateActive 의 set 키 등 **모든 ckey 형 입력**은 다음 두 enum 과 충돌하면 거부된다 — **case-insensitive**:

| Enum | 정본 | 차단 사유 |
|---|---|---|
| `sectorReservedKeys` | [naming-objects.schema.json](../../../schema/v1/naming-objects.schema.json) `$defs.sectorReservedKeys` | Sector 인스턴스의 시스템 게터 (`status`, `isActive`, `_SUID`, `block`, `collection`, `innerBlocks`, `keys`, `isAdded`, `isUpdated`, `isDeleted`, `isSelected`, `isLast`, `outerSector`, `outerBlock`, `_mSUID`) — setter 가 동작 안 함 (런타임 COLLECTION_ESCAPE) |
| `jsReservedWords` | 동 파일 `$defs.jsReservedWords` | JS 예약어 + 빌트인 (`for`, `class`, `Object`, `prototype`, `length`, `toString`, `__proto__` 등 50+개) — 점 표기법 (`_c.Cat.<key>`) 접근 시 빌트인이 우선되어 동작 깨짐 |

### Case-insensitive 강화 — 사용자 우려 반영

schema 의 ajv 검사는 case-sensitive (정확히 `status` 만 차단). 그러나 LLM 이 **`Status`** / **`STATUS`** 같은 변종을 컬렉션키로 박는 사고를 막기 위해, intent walker 는 **모든 enum 항목을 toLowerCase 후 일치 검사**.

```
❌  'Status'  → sector-getter '_status_' 와 충돌 (case-insensitive)
❌  'IsActive' → sector-getter 'isActive' 와 충돌
❌  'Length'  → js-reserved 'length' 와 충돌
❌  'CLASS'   → js-reserved 'class' 와 충돌
✅  'fStatus' → 충돌 없음 (부분 매치는 검사 안 함, 전체 토큰만)
✅  'fName'   → 충돌 없음
```

### 검사 지점

| 슬롯/kind | 검사 대상 | phase prefix |
|---|---|---|
| `mock` | 섹터 객체의 각 키 | `mock-sector-key-format` / `mock-sector-key-reserved` |
| `script.updateActive` | `set` 의 각 키 | `updateActive-set-key-format` / `updateActive-set-key-reserved` |
| `script.copyStepValues` | `map` 의 src/dst 각 키 | `copyStepValues-map-src-key-format` / `-reserved`, `copyStepValues-map-dst-key-format` / `-reserved` |
| `categories` | 각 카테고리의 ckey | `categories-ckey-format` / `categories-ckey-reserved` |

에러 메시지에는 어떤 enum 의 어떤 항목과 충돌했는지 (`matchedAgainst`) 가 함께 출력되어 사용자가 즉시 원인 파악 가능.

### 카테고리명

카테고리명 (`Ctg...`) 은 `Ctg` 접두 + PascalCase 패턴 자체가 jsReservedWords (모두 소문자) 와 거의 충돌하지 않으므로 별도 case-insensitive 검사 안 함. naming.md §3-5 의 schema 강제만 적용.
