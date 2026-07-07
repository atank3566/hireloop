# Events (events.schema.json)

`scenarioMeta.Events` — 시나리오 레벨 이벤트 핸들러 맵. 키는 핸들러 이름, 값은 Action 객체 배열.
Step / Group / Control / BottomButton 의 `Events` 안에서 핸들러 값으로 참조한다 (cross-check `[event-ref]` 와 정합).

> **참고 문서**: [docs.flextudio.com — Event 와 Service 구동 방법](https://docs.flextudio.com/flextudio/concept/eventservice), [flextudio-guide §6.5–6.8](../../../flextudio-ai-studio/docs/flextudio-guide.md).
> **schema ↔ md 동기화**: 본 md 의 표/enum 은 `events.schema.json` 과 1:1 일치해야 한다. 실 샘플 35 개 (`flextudio-ai-studio/scenario_sample*/`) 통계 기반.

---

## 0. Event–Service 흐름 (큰 그림)

flextudio 의 데이터 흐름은 **Event → Service → Collection → 화면 반영** 순서로 흐른다 (docs.flextudio.com 의 게시물 등록 화면 예시 기준):

```
[1] Step 진입 / Click / Change 등 트리거
       ↓
[2] Event 핸들러 실행 (scenario.Events.<name>[*])
       ├─ Action: 'Script'       → JS 직접 실행
       ├─ Action: 'LinkedEvent'  → 다른 핸들러 호출
       ├─ Action: 'Service'      → ServiceBinding 호출 ⇒ DB / 외부 API
       └─ Action: 'API'          → 외부 시스템 호출
       ↓
[3] Service 가 ParamBlocks 로 보낸 데이터 수신, 결과 반환
       ↓
[4] ResultBlocks 의 TargetType 에 따라 컬렉션 카테고리에 결과 반영
       (category / replace / add / merge)
       ↓
[5] f.Content('f_xxx').reload() 또는 Current.step.reload() 로 화면 갱신
```

**스킬 생성에서는** [3] 의 Service / API Action 과 [4] 의 ParamBlocks/ResultBlocks 는 사용하지 않는다 — `[no-service]` 가 차단. AI 는 Script / LinkedEvent 만 사용해서 화면 동작 + 샘플 데이터 컬렉션 조작을 표현하고, 서버 호출은 운영 단계에서 사용자가 추가.

### 0.1 스킬 생성 모드의 데이터 출처 — 시작 Step.Init 의 mock 섹터

외부 Service/API 가 차단된 스킬 생성 모드에서는 화면이 그릴 데이터의 **유일한 출처가 시작 Step (`StartSteps[0]`) 의 `Events.Init` 핸들러에서 박는 mock 섹터**. 작성 패턴/제약/예시는 [목업 데이터](mockup-data.md) 문서에서 단일 진실원본으로 다룬다.

`[mock-init]` 검증이 정합을 강제 — 시나리오에서 사용되는 모든 카테고리(`DataConnection.CategoryName`) 에 대해 시작 Step 의 Init 핸들러가 `f.Collection.addSector({...}, '<카테고리>')` 호출을 1회 이상 포함해야 통과. `LinkedEvent` 로 위임된 보조 핸들러도 추적.

---

## 1. 시나리오 이벤트 핸들러 맵 형태

```jsonc
"Events": {
  "Init":         [ { "Action": "Script", "Script": "Current.step.set('UserName', '홍길동');" } ],
  "userCheck":    [
    { "Action": "Script",      "Script": "if(f.Setting.UserId === '') Current.step.moveToNext('Step9', true);" },
    { "Action": "LinkedEvent", "EventName": "getList" }
  ],
  "getList":      [ { "Action": "Script", "Script": "f.Content('f_3').reload();" } ]
}
```

- 키 = 핸들러 이름. 호출자(Step/Group/Control/BottomButton) 의 `Events.<eventKey>` 값으로 이 이름을 적는다.
- 값 = `Action` 배열. 위에서 아래로 순차 실행. `IsSkip:true` 면 건너뜀.
- 사용 안 할 핸들러는 **키 자체 누락**.

### 1.1 핸들러 이름 규칙

| 항목 | 규칙 |
|---|---|
| 패턴 | `^[A-Za-z_][A-Za-z0-9_.]*$` (영문/숫자/언더스코어/점) |
| 실 샘플 예 | `Init`, `Loaded`, `OnBackLoaded`, `OnLeave`, `Click`, `change`, `userCheck`, `getList`, `STEP1_Query_E`, `Step6Init`, `Chart.js`, `loadMapScript`, `setTimer`, `tabSelect`, `SaveBookingEvent` |
| 공백 / 한국어 / 특수문자 | 금지 |

---

## 2. Action 4분기 (`Action` discriminator)

| Action | 필수 필드 | 실 샘플 빈도 | 생성 허용 |
|---|---|---|---|
| `Script` | `Script` | 624 회 | **O** |
| `LinkedEvent` | `EventName` | 239 회 | **O** |
| `Service` | (아래 §2.3) | 116 회 | ✗ — `[no-service]` |
| `API` | `ModuleID` | 28 회 | ✗ — `[no-service]` |

### 2.1 Script Action

```jsonc
{
  "Action": "Script",
  "Script": "Current.step.moveToNext('Step2', true);",
  "EventName": "(선택) 디버그용 메모",
  "IsSkip":   false
}
```

> **Script 본문 표기** — JSON 문자열 한 줄로 박고 줄바꿈은 `\n` 이스케이프로 표현. JS `+` 연결로 여러 줄 작성 금지 (JSON 파싱 실패).
> ```jsonc
> // ✓ 정상
> { "Action": "Script", "Script": "if (cond) return;\nf.Content('f_3').reload();" }
>
> // ✗ 잘못 — + 연결 / raw newline
> { "Action": "Script", "Script": "if (cond) return;" + "f.Content('f_3').reload();" }
> ```

> **AI 생성 시 — intent short-form 우선** (validate phase 가 raw 로 자동 펼침):
>
> | 의도 | intent 표기 |
> |---|---|
> | Init mock 데이터 | `intent.mock: { CtgX: [{...}, ...] }` |
> | 활성 섹터 일괄 갱신 | `intent.script: { kind:'updateActive', cat, set:{...}, reload? }` |
> | 활성 섹터 삭제 | `intent.script: { kind:'deleteActive', cat, reload? }` |
> | 카테고리 비우기 | `intent.script: { kind:'clearCategory', cat, reload? }` |
> | 그룹 재렌더 | `intent.script: { kind:'reloadGroup', fid }` |
> | 모달 다이얼로그 | `intent.script: { kind:'dialog', type, title, body?, buttons:[...] }` |
>
> 정본: [runtime/v1/intent-system/INTENT.md](../../runtime/v1/intent-system/INTENT.md). 아래 표는 **intent 미지원 / 운영 메타 호환** 시 raw 표기 참고용.

스크립트 안에서 사용 가능한 런타임 API (raw 표기):

| 영역 | 호출 예 | 의미 |
|---|---|---|
| Step 이동 | `Current.step.moveToNext('Step2', true)` | 같은 시나리오 안 PopUp/SlideUp 포함 모든 Step 이동 |
| Step 재로드 | `Current.step.reload()` | 현재 Step 재로드 |
| 그룹 reload | `f.Content('f_3').reload()` | DataConnection 그룹 데이터 갱신 |
| 그룹 스크롤 | `f.Content('f_3').Scroll.toSector(_c.activeSector)` | 카테고리 활성 섹터로 스크롤 |
| 컬렉션 set | `Current.step.set('field', value)` | 활성 섹터 필드 갱신 |
| 컬렉션 read | `_c.<Category>.activeSector.<key>`, `_c.<Cat>[0].<key>` | 섹터 값 읽기 |
| 컬렉션 변경 | `_c.<Category>.removeCategory()` / `createCategory()` / `addSector` | 카테고리 갱신 |
| 사용자 정보 | `f.Setting.UserId`, `f.Setting.UserName`, `_base.User.fBaseUserNo`, `_base.Company.fBaseCompanyID` | 컨텍스트 변수 |
| 날짜 | `f.Date().format('YYYY-MM-DD')` | 날짜 포매팅 |
| 메시지 박스 | `f.MessageBox('Alert').setTitle('확인').setDescription('본문').addBtn('확인','eventName',null).show()` | 모달 다이얼로그. **종결자는 `.show()`** (`.send()` 아님). 본문 setter 는 `setDescription`. `addBtn` 두 번째 인자는 **이벤트명 문자열** 또는 `null` — inline function 금지. 풀 시그니처는 `addButton(MOVETYPE_*, label, executeM)` |
| 필수 체크 | `f.checkRequired()` | 필수 입력 체크 |
| 외부 스크립트 로드 | `f.Script.load('https://.../chart.bundle.min.js', null, null)` | CDN 스크립트 로드 — **정적 URL 은 `Scenario.StyleURLs` 등록 우선**, `f.Script.load` 는 동적 URL 등 한정 |
| LoadScript 전용 | `Load.control.controlkey('hid'\|'dis'\|'')`, `Load.layout.style('...')`, `Load.control.font.color('#...')`, `Load.sector.<field> = ...` | LoadScript 안에서만 사용 |

#### 2.1.1 스킬 생성 모드 — 화이트리스트 (`[script-allow]`)

> 위 표는 **운영 메타** 호환을 위한 풀 레퍼런스. **스킬 생성 모드** 에서 Script 본문에 출력 가능한 진입점은 [runtime/v1/script/scenario-gen-rules.md](../../runtime/v1/script/scenario-gen-rules.md) 의 화이트리스트로 좁혀진다 — `[script-allow]` 가 정적 분석으로 차단.

**허용된 진입점 (모든 핸들러)**

| 진입점 | 용도 |
|---|---|
| `f.Collection.addSector({...}, '카테고리')` | 새 섹터 추가 — **인자 순서 고정: 객체 먼저, 카테고리 마지막** (유일 허용된 `f.Collection.*`) |
| `_c.카테고리[n].키 = 값` / `_c.카테고리.activeSector.set(...)` / `sector.release()` 등 | 컬렉션 직접 변형 (삭제는 `release()` 완전삭제 — `.delete()` 는 deleted 잔존으로 금지) |
| `Current.step.reload(isPositionReset?)` / `Current.step.reloadWithAnimation()` | 스텝 전체 재렌더 |
| `f.Content(fid).reload()` / `f.Content(fid).reloadWithAnimation()` | 그룹 부분 재렌더 |
| `f.Date().format('YYYY-MM-DD')` 등 | 날짜 포맷팅 |
| `f.Script.load('https://.../foo.js', null, null)` | CDN 스크립트 (Init 에서는 금지) |
| `f.MessageBox(type).setTitle(...).setDescription(...).addButton(MOVETYPE_*, label, executeM).show()` | 모달 다이얼로그 — 종결자 `.show()` (Init 에서는 금지). 정본: [runtime/v1/script/f_messagebox.md](../../runtime/v1/script/f_messagebox.md) |
| `f.Event(name).runNext()` / `.break()` | 다음 핸들러 호출/중단 (Init 에서는 금지) |

> **⚠ `addSector` 작성 규칙** (상세: [mockup-data.md](mockup-data.md) "addSector 작성 규칙")
> 1. **인자 순서** — `addSector({...}, '카테고리')`. 뒤집은 `addSector('카테고리', {...})` 는 `[mock-init]` 통과 못 하고 섹터도 안 박힘.
> 2. **카테고리 단위로 묶기** — 한 카테고리의 여러 섹터는 Script 액션 **하나**에 `\n` 으로 모은다. 섹터마다 `{Action:Script}` 를 쪼개지 말 것. 카테고리 2개 → 액션 2개.
> 3. **가독성** — `addSector` 호출 사이 `\n`, 객체 필드 `\n  ` 들여쓰기 (Ctrl+K+F 수준). 한 줄에 `;` 로 다닥다닥 붙이지 말 것.

> **⚠ 섹터 접근 — 스크립트 위치마다 진입점 다름** (정본: [runtime/v1/collection/_c.md §6.5](../../runtime/v1/collection/_c.md), [runtime/v1/script/scenario-gen-rules.md §2-1.1](../../runtime/v1/script/scenario-gen-rules.md))
> - **이벤트 Script** (`Action:'Script'` 본문 — Init/Loaded/Click/change 등): `_c.<카테고리>[n].키` 또는 `_c.<카테고리>.activeSector.키`
> - **LoadScript** (`{% ... %}` 본문): `Load.sector.<field>` — 그 행의 섹터를 자동 주입. Embed raw HTML 안의 `{% ... %}` 토큰도 동일 컨텍스트 — Embed 의 섹터 값 바인딩은 `{%return Load.sector.<field>; %}` (`{=Field}` 는 치환 안 됨, `[embed-bind]`)
> - **Filter Custom** (`ParamBlock.Filters[].Script`): bare `sector.X` (필터링 대상 섹터 변수)
> - **❌ `_c.Sector` / `_c.sector`** — 어느 위치에서도 가짜 핸들. 카테고리 이름이 실제로 "Sector" 가 아닌 한 존재하지 않음.
> - 이벤트 Script 안에서 `Load.sector.X` 사용 금지, LoadScript 안에서 bare `sector.X` / `_c.<카테고리>...` 사용 금지.

**차단되는 호출 (모든 핸들러)**

- `f.Collection.{updateSector|moveCategory|removeCategory|createCategory|filter}` — 단건 변경/카테고리 변형은 `_c.*` / `sector.*` 로 (`f.Collection.removeSector` 는 허용 — 특히 `removeSector('all','<Cat>')` 가 카테고리 비우기 표준 idiom)
- `Current.step.{moveToNext|moveToPrev|moveToFirst|moveToParent|restart}` — Step 이동은 메타 (`BottomButton.MoveTo` / `UseMove + MoveSteps`) 채널로 선언적 표현
- `Current.step.{id|prev|from}` 조회 — 분기는 메타에서 별도 Step/Event 로 분리
- `f.Content().{show|hide|addRow|delRow|selectAll|deselectAll|clickPositionFixed|Scroll}` — 표시/숨김은 `TargetSector.Filters`
- `f.Frame.popUp(...)` — 같은 시나리오 PopUp/SlideUp 은 메타 (`StepDialogType`)
- `f.Notification` — 전체 발송 사용 금지
- `f.History.*` — 분기는 메타로

**Init 핸들러 추가 차단** — `Init` 은 mock 섹터 박는 단계이므로 다음도 차단:

- `Current.step.reload(WithAnimation)?()` / `f.Content(fid).reload(WithAnimation)?()` — Init/Loaded 는 reload 시 재실행되지 않으므로 의미 없음. 화면 갱신은 Loaded 또는 사용자 트리거 이벤트
- `f.Event(...).runNext()` / `.break()` — Init 은 단순 mock 생성만
- `f.MessageBox(...)` — 다이얼로그는 사용자 트리거 이벤트에서 (Init 단계는 mock 데이터 박기 전용)
- `f.Script.load(...)` — 외부 스크립트 로드는 Loaded 또는 별도 이벤트

### 2.2 LinkedEvent Action

```jsonc
{
  "Action": "LinkedEvent",
  "EventName": "getList",
  "IsSkip": false,
  "Script": "",
  "UseResultOptions": false
}
```

다른 핸들러를 그대로 호출. `EventName` 은 `scenario.Events` 키 중 하나여야 함 (`[event-ref]`).

### 2.3 Service Action (생성 금지 — 형식 정의)

> ⚠️ const.js `K_EVENT.SERVICE` 에는 아래 필드들도 정의되어 있으나 일반 시나리오에서는 거의 미사용 — 런타임 내부/스튜디오 디버그 전용. AI 생성에서는 사용 안 함.
>
> | 필드 | 용도 |
> |---|---|
> | `useAsync` / `asyncThenScript` / `asyncCatchScript` / `asyncFinallyScript` | 비동기 호출 then/catch/finally 스크립트 — 옵션. 일반 시나리오는 `_fEvent.pause/resume` 동기 흐름 사용 |
> | `Flex-Offline` / `FlexOfflineModeType` (`Queue`\|`Cache`) / `FlexOfflineAfterEvent` | 모바일 오프라인 큐 모드 — 푸시/SubmissionID 기반 라우팅 전용 |
> | `UseFlexSourceID` / `UseFlexSubmissionID` / `Flex-SubmissionID` / `Flex-SourceID` / `Flex-Mapper` | 오프라인 트랜잭션 키 매핑 |
> | `UseTestGround` / `TestScript` | 스튜디오 디버그용 테스트 그라운드 |
> | `UseApiGround` / `ApiModuleId` / `ApiSystemId` / `ApiEvent` / `ApiEventKey` | 스튜디오 API 테스트 그라운드 |
> | `UseTempTable` / `TempTableName` | FlexSQL 임시 테이블 — 운영 한정 |
> | `useCommonTran` / `UseExternal` | 트랜잭션 묶음 / 외부 시스템 토글 — 운영 한정 |


서비스 호출 = **ParamBlocks(보낸다) → DB/외부 → ResultBlocks(반영한다)**.

```jsonc
{
  "Action": "Service",
  "Version": 2,
  "SystemID": "FlexSQL",
  "ServiceBinding": {                   // string 키 또는 inline 객체 둘 다 가능
    "SystemID":        "FlexSQL",
    "SetCategory":     true,
    "ModuleID":        "Default",
    "UsePKey":         true,
    "UseInnerBlock":   true,
    "UseParamBlock":   true,
    "UseResultBlock":  true,
    "NotSeperateInnerBlock": true,
    "ExternalDB":      true,
    "SQLServiceName":  "메인화면:showReceiveWho",
    "MajorVersion":    1
  },
  "ServiceName":  "showReceiveWho",
  "UseCategory":  true,
  "UseInnerBlock":false,

  "ParamBlocks": [ /* 보내는 데이터 — §2.3.1 */ ],
  "ResultBlocks": [ /* 받은 데이터 반영 — §2.3.2 */ ],
  "InnerBlocks":  [ /* 중첩 배열 매핑 — §2.3.3 */ ],

  "IsSkip": false
}
```

**ServiceBinding 필드 두 가지 형태**:
1. **String 참조** — `"ServiceBinding": "VactionDaysQuery_S"` → `scenario.ServiceBinding.VactionDaysQuery_S` 항목 호출. 운영 패턴.
2. **Inline 객체** — 위 예시처럼 SystemID/SQLServiceName 등 직접 박음. FlexSQL 의 SQLServiceName 직접 명시 시 흔함.

#### 2.3.1 ParamBlocks — 보내는 데이터 (`#/$defs/paramBlock`)

각 블록은 "어느 카테고리의 어떤 섹터를 어떤 필터로 보낼지" 정의. 카테고리별로 1개씩 배열에 추가.

```jsonc
"ParamBlocks": [
  {
    "CategoryName": "questionList",     // 보낼 카테고리 이름 ('' = 컬렉션 루트)
    "UseFilter":    true,
    "Filters": [
      { "FilterType": "Status", "Status": ["active"] }
    ],
    "UserFilterOption": false
  },
  {
    "CategoryName": "",
    "UseFilter":    false,
    "UserData": ["CompanySeq", "EmpSeq", "BaseDate"]   // _base/_c 에서 직접 키 추출
  }
]
```

| 필드 | 타입 | 의미 |
|---|---|---|
| `CategoryName` | string | 보낼 카테고리. `''` 이면 컬렉션 루트/기본 컨텍스트 |
| `UseFilter` | boolean | true → Filters 배열로 섹터 필터링 |
| `Filters` | array | 필터 배열 (UseFilter:true 일 때 필수) |
| `UserData` | array<string> | 사용자/시스템 컨텍스트에서 추출할 키 이름 (예: `CompanySeq`, `EmpSeq`, `LanguageSeq`, `BaseDate`, `IsOut`) |
| `UserFilterOption` | boolean | (실 샘플 모두 false) |
| `ParamItems` | array | (레거시) 명시적 키-값 매핑 |

##### Filter 4종 (data-objects.schema.json#/$defs/sectorFilter 와 동일)

| FilterType | 형태 | 의미 |
|---|---|---|
| `Status` | `{ FilterType:'Status', Status:['active', ...] }` | 섹터 상태 필터. 값: `active` / `inactive` / `select` / `old` / `new` |
| `Condition` | `{ FilterType:'Condition', ConditionOperators:'==', ConditionKey:'memSeq', ConditionValue:'{%_c.userInfo[0].memSeq%}' }` | 키-값 비교. Operators: `==` / `!=` / `>` / `<` / `>=` / `<=` 등 |
| `Custom` | `{ FilterType:'Custom', Script:'return sector.X == Y;' }` | 커스텀 스크립트 (sector 변수 사용 가능) |
| `Parent` | `{ FilterType:'Parent', DCParentKey:'surveySeq', DCChildKey:'surveySeq' }` | 부모 카테고리의 키와 매칭되는 섹터만 |

#### 2.3.2 ResultBlocks — 받은 데이터 반영 (`#/$defs/resultBlock`)

각 블록은 "결과를 어느 카테고리에 어떻게 반영할지" 정의.

```jsonc
"ResultBlocks": [
  { "TargetType": "replace",  "CategoryName": "userInfo" },
  { "TargetType": "add",      "CategoryName": "questionList" },
  { "TargetType": "merge",    "CategoryName": "menuList",   "PKeys": ["MenuSeq"] },
  { "TargetType": "category", "CategoryName": "schedule", "IsNotDelete": true }
]
```

| 필드 | 타입 | 의미 |
|---|---|---|
| `TargetType` | enum | `category` / `replace` / `add` / `merge` |
| `CategoryName` | string | 반영 대상 카테고리 |
| `PKeys` | array<string> | merge 모드에서 병합 기준 키 (필수) |
| `IsNotDelete` | boolean | replace 시 누락 섹터 보존 토글 |

##### TargetType 4종

| TargetType | flextudio-guide 용어 | 동작 |
|---|---|---|
| `category` | (카테고리 자체) | 카테고리 정의 자체를 결과로 교체 |
| `replace` | **덮어쓰기** | 카테고리의 모든 섹터를 결과로 교체. IsNotDelete:true 면 결과에 없는 기존 섹터 보존 |
| `add` | **추가** | 결과 섹터를 카테고리 끝에 append (기존 유지) |
| `merge` | **병합** | PKeys 기준 — 같은 PKey 값 = 갱신, 없는 PKey = 추가 |

#### 2.3.3 InnerBlocks — 중첩 결과 매핑 (`#/$defs/innerBlock`)

결과 객체 안의 특정 필드가 자식 배열일 때 그 필드 이름을 등록. 부모 row 1 개당 자식 array 가 따라오는 패턴.

```jsonc
"InnerBlocks": [
  { "InnerBlockKey": "dayData" },
  { "InnerBlockKey": "scheduleData" },
  { "InnerBlockKey": "WkDateList" }
]
```

| 필드 | 타입 | 의미 |
|---|---|---|
| `InnerBlockKey` | string | 결과 객체에서 자식 배열인 필드 이름 |

> ⚠️ **Group 의 `UseInnerBlock` 과는 별개 개념**. 메타 트리에서의 InnerBlock 반복 (Group 자식 반복) 은 `[no-inner-block]` 으로 차단되지만, 여기 Service.InnerBlocks 는 결과 데이터 구조 매핑 — 운영 메타에서만 등장하므로 `[no-service]` 가 함께 차단한다.

### 2.4 API Action (생성 금지)

> **참고**: [docs.flextudio.com — API 호출](https://docs.flextudio.com/flextudio/scenario/dev-mode/event/api). 스튜디오 UI 의 **이벤트 → API 추가** 가 메타에서는 `Action: 'API'` + `SystemType: 'CustomSystem'` 으로 박힌다. `fEventKey` 가 docs 의 "Event Config Key" 항목이며, 각 값은 `{% %}` [대체 스크립트](https://docs.flextudio.com/flextudio/concept/alternative) 로 동적 치환 가능.

```jsonc
{
  "Action": "API",
  "ModuleID":      "13be8848-501d-4fa4-a0c7-e5a5b0bcb5e6",
  "ServiceName":   "GetUserList",
  "SystemID":      "New_05",
  "SystemType":    "CustomSystem",
  "UseCategory":   true,
  "UseParamBlock": true,
  "UseResultBlock":true,
  "UsePKey":       true,
  "SetCategory":   true,
  "NotSeperateInnerBlock": true,
  "fEventKey":     ["fBaseCompanyID", "fBaseUserNo", "url", "mapping"],
  "fEvent": {
    "fBaseCompanyID": "{%_base.Company.fBaseCompanyID%}",
    "fBaseUserNo":    "{%_base.User.fBaseUserNo%}",
    "url":            "{%_base.flextudio.serviceUrl%}",
    "mapping":        "member/userinfo"
  },
  "ParamBlocks":  [],
  "ResultBlocks": [ { "TargetType":"replace", "CategoryName":"userInfo" } ]
}
```

| 필드 | 의미 |
|---|---|
| `ModuleID` | 외부 시스템 모듈 식별자 (FlexAutoQuery 는 GUID) |
| `SystemType` | `FlexAutoQuery` / `CustomSystem` 등 |
| `fEventKey` | fEvent 객체에서 사용할 키 이름 배열 |
| `fEvent` | 키 → 템플릿 표현식 (`{%_base.X.Y%}`, `{%_c.Cat[0].field%}`, 또는 정적 문자열) |

ParamBlocks / ResultBlocks 형식은 Service Action 과 동일.

---

## 3. 호스트별 이벤트 키 (실 샘플 기준)

각 호스트의 `Events` 안에서 사용 가능한 키. 35 시나리오 통계.

| 호스트 | EventOrder 키 | 사용 가능 이벤트 이름 | 비고 |
|---|---|---|---|
| Step | `StepEventOrder` | `Init`, `Loaded`, `OnBackLoaded`, `OnLeave`, `OnForeground`, `ScrollEnd` | `OnForeground` 는 모바일 한정 |
| BottomButton | (없음) | `Click` | UseEvents 토글 없이 Click 핸들러만 두면 동작 |
| Group | `ContentEvent` | `Click`, `ScrollEnd` | UseMove 와 상호배타 |
| InputText | `InputEventOrder` | `change`, `input`, `focusin`, `focusout` | 모두 소문자 |
| MultiInputBox | `InputEventOrder` | `change`, `input`, `focusin`, `focusout` | 동일 |
| InputNumber | `InputEventOrder` | `change` 만 | input/focusin/focusout 미지원 |
| InputMask | `InputEventOrder` | `change` 만 | 동일 |
| InputDate (자식 Calendar 안) | `DateOrder` | `DialogClose` | 본체 Events 금지 |
| Combo (자식 ComboList 안) | `ComboOrder` | `change`, `DialogClose` | 본체 Events 금지 |
| Search (자식 List 안) | `SearchOrder` | `change`, `Delete`, `DialogClose` | 본체 Events 금지 |
| CheckBox | `CheckBoxOrder` (선택) | `Click` | EventOrder 없이 Click 만 두는 패턴이 더 흔함 |
| RadioBox | (직접) | `Click` | |
| Label | (직접) | `Click` | `UseClickEvent: true` 토글 |
| Calendar (단독) | (직접) | `Click` | |
| ImageBox | `ImageEventOrder` | `Click` | `change` 도 일부 등장 |
| InputFile | `InputFileOrder` | `change` | 파일 추가/제거 |
| Tree | `TreeOrder` | `Click`, `Selected`, `Checked` | PascalCase 필수 |
| CalendarNavigator | `CalendarNaviEventsOrder` | `ClickPrevNextBtn`, `SelectDay` | 독립 사용 시 |

각 호스트의 `Events.<key>` 값은 **scenario.Events 의 핸들러 이름 문자열**. 검증: `[event-ref]`.

### 3.1 EventOrder 의 의미

`StepEventOrder: ["Init", "Loaded"]` → 그 핸들러들이 정의되어 있고 실제 호출됨. EventOrder 누락 + 핸들러 키만 있으면 호출 안 됨.

### 3.2 Step `Events` 키 항상 존재 규칙

```jsonc
"Events": { "StepEventOrder": ["Init"], "Init": "userCheck" }   // UseEvents:true
"Events": []                                                      // UseEvents:false
```

`Events` 키 자체 누락 시 런타임 에러.

### 3.3 Combo / Search / InputDate 본체 이벤트 금지

본체에 `UseEvents` / `Events` 두지 않음. 자식 ComboList / List / Calendar (`Dialog.Layouts[0].Controls[0]`) 안에 둔다. 검증: `[event]`.

---

## 4. ServiceBinding (`scenario.ServiceBinding`)

서비스 호출 정의 맵. 자세한 형식은 [`service-binding.md`](service-binding.md) 참조.

**스킬 생성에서는 비어있는 객체 `{}` 만 허용** — `[no-service]` 가 차단.

---

## 5. 템플릿 표현식

ParamBlock.Filters / API.fEvent 등에서 사용하는 동적 값 표현식:

| 형태 | 의미 |
|---|---|
| `{%_c.<Cat>[0].<field>%}` | 컬렉션 카테고리 첫 섹터의 필드 값 |
| `{%_c.<Cat>.activeSector.<field>%}` | 카테고리 활성 섹터의 필드 값 |
| `{%_base.User.<key>%}` | 로그인 사용자 정보 (`fBaseUserNo`, `fBaseUserName` 등) |
| `{%_base.Company.<key>%}` | 회사 정보 (`fBaseCompanyID` 등) |
| `{%_base.flextudio.serviceUrl%}` | 시스템 변수 |
| `{=<CollectionKey>}` | (Caption / labeltext 안에서) 컬렉션 키 바인딩 |
| `{{key}}` | (Caption / labeltext 안에서) 다국어 매핑 |
| `{% return JS %}` | (Caption / labeltext 안에서) 스크립트 표현식 |

---

## 6. 검증 후크 정합

| Tag | 위치 | 동작 |
|---|---|---|
| `[event]` | `validators.mjs` `checkDialogEventPlacement` | Combo/Search/InputDate 본체에 Events/UseEvents 두면 거부 |
| `[event-ref]` | `validators.mjs` `checkEventReferences` | Step/BB/Group/Control 의 Events 핸들러 값 + LinkedEvent.EventName 이 scenario.Events 키로 정의되어 있는지 |
| `[no-service]` | `validators.mjs` `checkNoService` | (a) ServiceBinding 비어있는 객체만, (b) Action='Script'/'LinkedEvent' 만, (c) DataSourceType:'Service'/'API' 차단. `strict_no_service:false` 로 비활성 |
| `[strict-fields]` | strict Ajv 패스 | enum/properties 외 키 차단. `_base.schema.json` 의 inputEventsFull / groupEvents 등 $defs 와 결합 |
| `[script-allow]` | `validators.mjs` `checkScriptAllowlist` | Script Action 본문 정적 분석 → [runtime/v1/script/scenario-gen-rules.md](../../runtime/v1/script/scenario-gen-rules.md) 화이트리스트만 통과. 차단 진입점: `f.Frame.popUp` / `f.Notification` / `f.History.*` / `Current.step.{moveTo*\|restart\|id\|prev\|from}` / `f.Content().{show\|hide\|addRow\|delRow\|selectAll\|deselectAll\|clickPositionFixed\|Scroll}` / `f.Collection.{updateSector\|moveCategory\|removeCategory\|createCategory\|filter}` (`removeSector` 는 허용). **Init 핸들러는 추가로** `Current.step.reload` / `f.Content().reload` / `f.Event(...)` / `f.MessageBox` / `f.Script.load` 도 차단. `strict_script:false` 로 비활성 |
| `[mock-init]` | `validators.mjs` `checkMockInit` | `StartSteps[0]` 의 Step.Events.Init 핸들러가 시나리오 안에서 사용되는 모든 카테고리 (`DataConnection.CategoryName` + `TargetSector.CategoryName`) 에 `f.Collection.addSector({...}, '<카테고리>')` 호출을 포함해야 함. LinkedEvent 로 호출되는 보조 핸들러도 함께 추적. `strict_mock_init:false` 로 비활성 |
| `[tab-move]` | `validators.mjs` `checkTabAncestorMove` | `Tab` 컨트롤의 조상 Group 에 `UseMove:true` 가 있으면 거부 — 탭 헤더 클릭이 그 Group 의 Step 이동을 트리거. `strict_tab_move:false` 로 비활성 |
| `[tab-embed]` | `validators.mjs` `checkTabLinkedStepEmbed` | `Tab.Items[].LinkedStepId` 로 띄우는 Step 의 Contents 트리에 `Embed` 컨트롤이 있으면 거부 — 탭 내부 Step 은 Step 이벤트 미실행이라 Embed 초기화 시점을 못 잡음. `strict_tab_embed:false` 로 비활성 |
| `[group-dc]` | `validators.mjs` `checkGroupUseDataConnection` | 모든 Group 에 `UseDataConnection` 키 명시 강제 — 누락 시 스튜디오가 `UseOldDataConnection:true` 자동 생성(레거시 렌더). 스튜디오 defaults(`applyGroupDefaults`) 가 선반영. `strict_group_dc:false` 로 비활성 |
| `[embed-render]` | `validators.mjs` `checkEmbedRender` | `<canvas>`/빈 id 컨테이너 Embed 는 host Step 의 `Loaded`/`Init` 핸들러에 `document.getElementById` 등 실제 렌더 코드가 있어야 함 — 라이브러리 로드만으로는 안 그려짐(빈 영역). `strict_embed_render:false` 로 비활성 |

---

## 7. 운영 메타 검증 모드

```jsonc
{
  "name": "validate_scenario",
  "arguments": {
    "scenario": {…},
    "strict_no_service": false      // Service / API / ServiceBinding 통과
  }
}
```

이 모드에서는 ParamBlocks / ResultBlocks / InnerBlocks 도 schema 검증을 거치며 (검증은 그대로 작동), 단지 `[no-service]` 가 비활성화되어 운영 메타가 통과한다.
