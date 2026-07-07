# Step

화면 단위 노드. `Scenario.Steps[StepId]` 의 값. `StepType` + `StepDialogType` 분기.

## 식별

- 위치: `Scenario.Steps[StepId]` 의 **키**
- StepId 형식: `^Step[1-9][0-9]*$` 예: `Step1`, `Step2`, `Step10`. **0 시작 불가, 영문/언더스코어 불가, `Step0` 도 불가** (1부터 시작).
- discriminator: `StepType` (`StepView` | `StepSub`) + `StepDialogType` (StepView 변종)

## StepType / StepDialogType 매트릭스

| StepType | StepDialogType | 의미 |
|---|---|---|
| (누락) | — | 런타임이 `StepView` 로 처리. AI 생성 시는 명시 권장. |
| `StepView` | `""` | 일반 풀스크린 화면 |
| `StepView` | `"SlideUp"` | 바텀시트 슬라이드업 |
| `StepView` | `"PopUp"` | 중앙 팝업 (Width/Height 권장) |
| `StepSub` | — | 다른 시나리오 임베드. **개발 모드에서 설정**. UseBackButton/UseBottomButton/UseEvents 가 자동 false 강제됨. |

## 공통 필드

| 키 | 타입 | 비고 |
|---|---|---|
| `StepType` | enum | 🔴 필수 |
| `StepDialogType` | enum `""\|"SlideUp"\|"PopUp"` | StepView 변종 |
| `StepName` | string | 내부 표시명 |
| `StepTitle` | string | 상단 헤더 타이틀 (UseStepHeader=true 일 때 표시, 다국어 `{{}}` 권장) |
| `UseStepHeader` | boolean | 상단 헤더 사용 토글 |
| `Contents` | Group[] | 메인 (스크롤 영역) |
| `FixedContentsTop` | Group[] | 탭/검색/필터 전용 |
| `FixedContentsBottom` | Group[] | 액션바 전용 |
| `Padding` | spacing | `Btm` 키 사용. **키 누락 시 런타임 기본값 `padding: .5rem 1.25rem 0 1.25rem` 적용** |
| `BgStyle` | bgStyle | 배경 색/이미지. 토글 OFF 시 키 자체 누락 |
| `UseBackButton` | boolean | 뒤로가기 토글 (디자인/데이터 탭 공통) |
| `BackButton` | object | `{ Next: "None"\|StepId, IsRestored: bool }`. UseBackButton=true 시 동반 등장 |
| `Next` | string[] | StepId 배열, **forward-only** |
| `UseBottomButton` | boolean | |
| `StepButton` | object | 하단 버튼 영역 스타일 묶음 |
| `BottomButtons` | BottomButton[] | 하단 버튼 채널 |
| `UseEvents` | boolean | |
| `Events` | object \| `[]` | UseEvents=true→object, false→`[]`. **누락 금지** |
| `StepRow`, `StepCol` | number | 그리드 좌표 |

> **타입 정책**: 모든 boolean/number는 strict 타입 (true/false/숫자). 일부 디버그/직렬화 출력에서 `"true"`/`"1"` 처럼 문자열로 보일 수 있으나 메타 안 실제 값은 boolean/number. AI 생성 시 반드시 strict 타입으로 작성.

## 디자인 탭 ↔ 메타 매핑

스튜디오 디자인 탭의 각 항목이 어떤 메타 키로 저장되는지:

| 디자인 탭 UI | 메타 키 | 비고 |
|---|---|---|
| 이동할 스텝 (읽기 전용) | `Steps` 객체의 키 자체 | StepId 표시 |
| 스텝명 | `StepName` | string |
| 상단 헤더 사용하기 | `UseStepHeader` | boolean |
| 상단 헤더 타이틀 | `StepTitle` | UseStepHeader=true 일 때만 입력 가능 |
| 뒤로가기 사용하기 | `UseBackButton` (+ `BackButton`) | **데이터 탭과 공통**. true 시 `BackButton: { Next: "None", IsRestored: true }` 자동 동반 |
| 다이얼로그 타입 | `StepDialogType` | "사용안함" → `""`, "슬라이드업" → `"SlideUp"`, "팝업" → `"PopUp"` |
| 배경 (체크박스 + 색) | `BgStyle: { UseBackground: true, BgColor: "..." }` | 체크 OFF 시 `BgStyle` 키 자체 누락 |
| 패딩(T,R,B,L) | `Padding: { UseAuto, All, UseEach, Top, Right, Btm, Left, SizeUnit }` | 체크 OFF 시 `Padding` 키 자체 누락 → 런타임 기본 `padding: .5rem 1.25rem 0 1.25rem` 적용 |
| (하단 그리드 좌표 표시) | `StepRow`, `StepCol` | number |

### 데이터 탭 — 뒤로가기 세부 설정

`UseBackButton: true` 시 등장하는 `BackButton` 객체의 데이터 탭 매핑:

| 데이터 탭 UI | 메타 키 | 값 |
|---|---|---|
| 라디오 "이전 스텝 이동" | `BackButton.BackButtonMode` | `"Step"` |
| 라디오 "이벤트 실행" | `BackButton.BackButtonMode` | `"event"` |
| 이동할 스텝 (드롭다운, BackButtonMode=Step 일 때) | `BackButton.Next` | `"None"` (직전 스텝) 또는 본인 외 StepId |
| 이벤트명 (BackButtonMode=event 일 때) | `BackButton.BackButtonEvent` | 이벤트 이름 (사용 안 할 때 문자열 `"undefined"`) |
| 콜렉션 이전 상태로 복원하기 (토글) | `BackButton.IsRestored` | boolean |

**`BackButton.Next` 의미 (BackButtonMode=Step 일 때):**
- `"None"` → 직전 스텝(PrevStack)으로 이동.
- `^Step[1-9][0-9]*$` (본인 외 StepId) → 해당 스텝으로 이동.
- **자기 자신 StepId 참조 금지** (validate.mjs 후검증으로 거부).

**`BackButtonMode: "event"`** 의미:
- `BackButtonEvent` 의 이벤트가 실행되고, 그 이벤트가 동작 제어.
- **별도 추가 뒤로가기 동작 없음** — 이벤트가 책임짐.

전체 BackButton 객체 예시 (Step 모드, 직전 스텝):

```jsonc
"BackButton": {
  "Next": "None",
  "IsRestored": true,
  "BackButtonMode": "Step",
  "BackButtonEvent": "undefined"
}
```

이벤트 모드:

```jsonc
"BackButton": {
  "Next": "None",
  "IsRestored": true,
  "BackButtonMode": "event",
  "BackButtonEvent": "evtBackHandler"
}
```

### 깡통 Step (모든 옵션 OFF, 헤더만 ON) 기본형

```jsonc
{
  "StepName": "",
  "Contents": [],
  "StepType": "StepView",
  "UseBackButton": false,
  "UseStepHeader": true,
  "Next": [],
  "StepCol": 1,
  "StepRow": 0
}
```

### 풀옵션 Step (배경 + 패딩 + 뒤로가기 + 헤더 타이틀)

```jsonc
{
  "StepName": "",
  "StepType": "StepView",
  "UseBackButton": true,
  "BackButton": { "Next": "None", "IsRestored": true },
  "UseStepHeader": true,
  "StepTitle": "ㅇㅇ",
  "Next": [],
  "StepCol": 1,
  "StepRow": 0,
  "Padding": { "UseAuto": true, "All": "0", "UseEach": false, "SizeUnit": "%" },
  "BgStyle":  { "UseBackground": true, "BgColor": "var(--colorOrange)" },
  "Contents": []
}
```

## 다이얼로그 (StepDialogType) 추가 필드

`StepDialogType` 값에 따라 추가로 등장 가능한 키들. **schema 가 분기로 강제** — SlideUp/PopUp 가 아닌 Step 에 이 키들이 등장하면 검증 fail.

| 키 | `""` (일반) | `"SlideUp"` | `"PopUp"` |
|---|:---:|:---:|:---:|
| `hideDlgHeader` (boolean) | ✗ | ✓ | ✓ |
| `useDim` (boolean) | ✗ | ✓ | ✓ |
| `dimTransp` (number, 0~1) | ✗ | ✓ | ✓ |
| `bgTransparent` (boolean) | ✗ | ✓ | ✓ |
| `Height` (sizeObject) | ✗ | ✓ | ✓ |
| `Width` (sizeObject) | ✗ | **✗** | ✓ |
| `PopupPosition` (string) | ✗ | **✗** | ✓ |

### SlideUp 예시

```jsonc
{
  "StepType": "StepView",
  "StepDialogType": "SlideUp",
  "hideDlgHeader": true,
  "Height": { "MatchText": false, "SizeValue": 11, "SizeUnit": "%" },
  "useDim": true,
  "dimTransp": 0,
  "bgTransparent": true
}
```

### PopUp 예시 (= SlideUp 의 모든 키 + Width)

```jsonc
{
  "StepType": "StepView",
  "StepDialogType": "PopUp",
  "hideDlgHeader": true,
  "Width":  { "MatchText": false, "SizeValue": 11, "SizeUnit": "%" },
  "Height": { "MatchText": false, "SizeValue": 11, "SizeUnit": "%" },
  "useDim": true,
  "dimTransp": 0,
  "bgTransparent": true,
  "PopupPosition": "Centered"
}
```

## StepSub (서브시나리오) 상세

**개발 모드 → "서브시나리오 연결" 토글 ON 시** Step 이 StepSub 로 전환된다. property-data.js:343-912.

### 자동 강제 필드 (StepSub 진입 시)

```jsonc
{
  "StepType": "StepSub",
  "UseBackButton": false,     // ← 자동 false
  "UseBottomButton": false,   // ← 자동 false
  "UseEvents": false,         // ← 자동 false (Step 이벤트 제한)
  "Protocol": { "Protocol": "Original" },
  "SubBackup": { "UseBackButton": true, "Contents": [] }   // 이전 StepView 상태 백업 (JSON 객체)
}
```

### 개발 모드 UI ↔ 메타 매핑 (전체)

| UI 항목 | 메타 키 | 값 |
|---|---|---|
| 서브시나리오 아이디 | `ScenarioId` | string (예: `"flex\|\|1475_2603111630275"`) |
| 서브시나리오 아이디 (직접입력 모드) | `ScenarioIdText` | string |
| 시작 스텝 아이디 | `Protocol.StartStep` | StepId 문자열 (예: `"Step1"`) |
| 시작 스텝 아이디 (직접입력) | `Protocol.StartStepText` | string |
| Init(처음)으로 돌아갈 시나리오 — **최상위** | `Protocol.InitType: "Original"` | 라디오 옵션 1 |
| Init(처음)으로 돌아갈 시나리오 — **현재** | `Protocol.InitType: "Parent"` | 라디오 옵션 2 |
| Init(처음)으로 돌아갈 시나리오 — **서브** | `Protocol.InitType: "Current"` | 라디오 옵션 3 |
| 호출한 시나리오로 돌아가기 허용 | `Protocol.UseBackButton` | boolean |
| 서브시나리오로 현재 콜렉션 전달 | `Protocol.UseCopyCollectionToSub` | boolean |
| └ Status 필터 | `Protocol.TargetStatusToSub` | `"All"` / `"Active"` / `"Selected"` / `"Last"` / `"Added"` / `"Updated"` / `"Deleted"` (기본 `"All"`) |
| 서브시나리오의 콜렉션으로 대체하기 | `Protocol.UseCopyCollectionToOrigin` | boolean |
| └ Status 필터 | `Protocol.TargetStatusToOrigin` | 위와 동일 enum |
| 서브시나리오 로드 스크립트 | `Protocol.beforeLoadSubScenario` | string (스크립트 본문) |

### Protocol 객체 형태 (전체)

```jsonc
"Protocol": {
  "Protocol": "Original",                    // 레거시 호환 — 보통 "Original" 고정
  "StartStep": "Step1",
  "StartStepText": "",
  "InitType": "Original",                    // Original | Parent | Current
  "UseBackButton": true,
  "UseCopyCollectionToSub": true,
  "TargetStatusToSub": "All",
  "UseCopyCollectionToOrigin": true,
  "TargetStatusToOrigin": "All",
  "beforeLoadSubScenario": "/* JS script */"
}
```

### `SubBackup` 동작

StepSub ↔ StepView 전환 시 이전 상태(예: 기존 StepView 의 `UseBackButton`, `Contents` 등) 를 복원하기 위한 백업. **JSON 객체** 형태로 메타에 저장됨. 스튜디오가 자동 관리 — 직접 편집 금지.

```jsonc
"SubBackup": { "UseBackButton": true, "Contents": [] }
```

### StepSub 제한 사항

- **Step 이벤트 사용 불가** (`UseEvents: false` 강제) — Init/Loaded/OnLeave 등 모두 비활성.
- **뒤로가기 버튼 사용 불가** (`UseBackButton: false` 강제) — 대신 `Protocol.UseBackButton` 으로 호출 시나리오로 돌아갈지 결정.
- **하단 버튼 사용 불가** (`UseBottomButton: false` 강제).
- `Contents` 사용 안 함 — 자체 화면이 없으므로.
- `Next` 사용 안 함.

## BottomButton

별도 스키마로 분리됨. 자세한 정의는 [bottom-buttons.md](./bottom-buttons.md) 참조 (스키마 파일: `bottom-buttons.schema.json`).

요약: `Id`, `ButtonName`, `MoveTo`(Next/None/Prev/Prev_ReStart/Init), `Next` 객체(MoveStepOrder 등), `IsRestored`, `Events.Click`, `LoadScript`, 그리고 Control 급 스타일 키 묶음.

## Step.Next 규칙

1. **모든 non-start Step은 다른 Step의 `Next` 배열에 정확히 1번 등장**해야 함 (스튜디오 탐색기 표시 조건).
2. **Forward-only**: 이전 Step 참조 금지. 뒤로가기는 BackButton 또는 BottomButton.MoveTo 사용.
3. **PopUp/SlideUp Step도 부모 Step의 Next에 포함**: `Current.step.moveToNext('StepN', true)` 로 호출, `f.Frame.popUp()` 은 다른 시나리오용.
4. BottomButton의 `Next` 객체는 별개 — **임의 Step 참조 가능**.

## Step Events 상세 명세

> **출처 통합**: [docs.flextudio.com — Step](https://docs.flextudio.com/flextudio/concept/step), `flextudio-ai-studio/system-prompt-v2.md`, runtime: `public/engine/runtime/runtime.js#executeEventOfStep`, const: `public/engine/common/const.js#STEP_EVENT`.

### 1. Step 생애주기 (Lifecycle)

docs.flextudio.com 의 Step 생애주기 + runtime.js 호출 흐름 통합:

```
[1] Init             ← executeEventOfStep('Init') (runtime.js:170, 185)
        ↓
[2] Load             ← Step 안 모든 컴포넌트(Group/Control/StepButton) 생성
        ↓
[3] Loaded           ← executeEventOfStep('Loaded') (runtime.js:549)
        ↓
[4] Ready for Use    ← 사용자 입력 받기 시작
        ↓ (다음 Step 이동 / 뒤로가기 / Foreground / Scroll)
[5] OnLeave          ← executeEventOfStep('OnLeave')   (다른 Step 이동 직전, 1782/1792/1839/1873/1886/1901)
[5] OnBackLoaded     ← executeEventOfStep('OnBackLoaded') (뒤로가기 복원 직후, 2894/3206)
[5] OnForeground     ← executeEventOfStep('OnForeground') (모바일 앱 포그라운드 복귀, 3522)
[5] ScrollEnd        ← Step 영역 스크롤이 끝까지 닿았을 때
```

`docs.flextudio.com — Step` 의 5단계 생애주기 (Init → Load → Loaded → Ready for Use → Leave) 와 1:1 매핑.

### 2. 이벤트 6종 (`STEP_EVENT` const + `ScrollEnd`)

const.js `STEP_EVENT` 와 system-prompt-v2.md §2 Step-level Event Types 통합. `StepEventOrder` enum 도 동일.

| 이벤트 | 발생 시점 | 호출 횟수 | 주 용도 | 모바일 한정 |
|---|---|---|---|---|
| `Init` | Step 로드 직전 (UI 그려지기 전) | Step 진입 시 1회 (`Prev` 복원 시 미실행) | **샘플 데이터 로딩 / 카테고리 생성 / 컬렉션 초기화 (`removeCategory + createCategory + addSector` / `[0].set()`)** | — |
| `Loaded` | Step UI 모두 그려진 후 | Step 진입 시 1회 (`Prev` 복원 시 미실행) | **DOM 의존 셋업** (Chart.js / Naver Map / Canvas 그리기 / 외부 CDN 라이브러리 / Timer 시작) | — |
| `OnBackLoaded` | 뒤로가기로 이 Step 복원 직후 | 매 복귀 마다 (Init/Loaded 와 별개) | 지도 재렌더링 / 리스트 갱신 / 변경된 데이터 새로 조회 | — |
| `OnLeave` | 이 Step 떠나기 직전 (Next 이동 / Back) | Step 이탈 시 1회 | **Cleanup** (`clearInterval` / 이벤트 리스너 해제 / 외부 SDK destroy) | — |
| `OnForeground` | 모바일 앱이 백그라운드 → 포그라운드 복귀 시 | 복귀 시마다 | 데이터 자동 새로고침 (push 받은 후 등) | **모바일 한정** |
| `ScrollEnd` | Step 영역 스크롤이 끝까지 닿았을 때 | 닿을 때마다 | **무한 스크롤 / 페이지네이션** (`LoadPage_E` 패턴) | — |

> ⚠️ const.js 에는 `AfterOfflineEvent` 도 정의되어 있으나 (`STEP_EVENT.AFTEROFFLINE`) 일반 시나리오에서는 거의 미사용 — 오프라인 큐 후처리 전용. AI 생성에서는 사용 안 함.

### 3. 메타 형식

**`Events` 키는 모든 Step 에 항상 존재해야 함** — UseEvents 가 false 여도 빈 배열 `[]` 로 둔다. 누락 시 런타임 에러.

#### 3.1 UseEvents:true — 객체 형태

```jsonc
{
  "UseEvents": true,
  "Events": {
    "StepEventOrder": ["Init", "Loaded", "OnBackLoaded", "OnLeave", "OnForeground", "ScrollEnd"],
    "Init":          "STEP1_Init_E",
    "Loaded":        "STEP1_Loaded_E",
    "OnBackLoaded":  "STEP1_BackLoaded_E",
    "OnLeave":       "STEP1_Leave_E",
    "OnForeground":  "STEP1_Foreground_E",
    "ScrollEnd":     "STEP1_LoadPage_E"
  }
}
```

| 키 | 의미 |
|---|---|
| `StepEventOrder` (enum 배열) | **활성화할 이벤트 enum 목록**. 여기에 들어있는 이벤트만 호출됨. enum: `Init` / `Loaded` / `OnBackLoaded` / `OnLeave` / `OnForeground` / `ScrollEnd` |
| `<EventName>` (string) | 호출할 핸들러 이름 — `scenario.Events` 의 키로 정의된 핸들러 |

> 핸들러 이름은 `scenario.Events` 에 등록된 키여야 함 ([`events.md §1.1`](events.md)). 없으면 `[event-ref]` 후검증 fail.

#### 3.2 UseEvents:false — 빈 배열

```jsonc
{
  "UseEvents": false,
  "Events": []
}
```

#### 3.3 부분 활성화 (가장 흔한 패턴)

```jsonc
"Events": {
  "StepEventOrder": ["Init"],
  "Init":           "STEP1_Init_E"
}
```

`StepEventOrder` 에 빠진 이벤트는 핸들러를 적어두어도 호출 안 됨 — 실수로 누락되면 동작 안 하므로 enum 동기 필수.

### 4. 호출 순서 매트릭스

특정 동작에 따른 이벤트 호출 순서 (runtime.js 추적):

#### 4.1 최초 진입

```
StepN 첫 진입
  → executeEventOfStep('Init')   [runtime.js:170/185]
  → 컴포넌트 생성 (Group/Control/StepButton)
  → loadStep / loadDialog
  → executeEventOfStep('Loaded') [runtime.js:549]
```

#### 4.2 다음 Step 이동

```
StepN → StepN+1
  → StepN: executeEventOfStep('OnLeave')   [_fEvent.push, runtime.js:1782 etc.]
  → _stepStack 에 StepN 백업 (collection / state 보관)
  → StepN+1 진입 ([4.1] 처음부터)
```

#### 4.3 뒤로가기 (`MoveTo: "Prev"` / BackButton 기본)

```
StepN+1 → StepN (Prev)
  → StepN+1: executeEventOfStep('OnLeave')
  → _stepStack 에서 StepN 복원 (collection / DOM 상태 그대로)
  → executeEventOfStep('OnBackLoaded')     [runtime.js:2894/3206]
  → ⚠️ Init / Loaded 는 호출되지 않음 — 캐시 복원
```

> system-prompt-v2.md §3 의 핵심 규칙: **`Prev` 로 돌아갈 Step 이 `Loaded` 에서 DOM 의존 렌더링(Chart.js/Map/Canvas/Timer) 을 하면 빈 화면이 됨** → BottomButton `MoveTo: "Prev_ReStart"` 사용해야 Init/Loaded 가 다시 실행됨.

#### 4.4 Prev_ReStart (재시작)

```
StepN+1 → StepN (Prev_ReStart)
  → StepN+1: executeEventOfStep('OnLeave')
  → StepN 새로 진입 ([4.1] 처음부터: Init → 컴포넌트 생성 → Loaded)
  → OnBackLoaded 미호출 (재시작이지 복귀가 아님)
```

#### 4.5 Foreground 복귀 (모바일)

```
앱이 백그라운드 → 포그라운드
  → executeEventOfStep('OnForeground')     [runtime.js:3522]
  → (현재 Step 의 컬렉션/DOM 유지된 상태)
```

#### 4.6 ScrollEnd

```
사용자 스크롤이 ScrollY 영역 바닥에 도달
  → executeEventOfStep('ScrollEnd')        (지속 발생 — 스크롤 끝에 머무는 동안 반복)
```

### 5. BottomButton MoveTo 와 이벤트 재실행 매트릭스

system-prompt-v2.md §3 BottomButton + const.js `MOVETYPE` 통합:

| MoveTo | 동작 | OnLeave (현재) | Init / Loaded (대상) | OnBackLoaded (대상) |
|---|---|---|---|---|
| `Next` | 다음 Step 이동 | ✓ | ✓ (대상이 첫 진입이면) | — |
| `Prev` | 이전 Step **캐시 복원** | ✓ | **✗** | ✓ |
| `Prev_ReStart` | 이전 Step **재시작** | ✓ | ✓ (재실행) | **✗** |
| `Init` | StartSteps 의 시작 Step 으로 | ✓ | ✓ (재시작) | — |
| `None` | 이동 안 함 (이벤트만) | — | — | — |

> **Chart/Map/Canvas/Timer 가 있는 Step → 돌아갈 때 반드시 `Prev_ReStart`** (system-prompt-v2.md §4323).

### 6. 이벤트별 권장 패턴

system-prompt-v2.md 의 검증된 패턴 모음.

#### 6.1 Init — 샘플 데이터 / 카테고리 초기화

화면이 그릴 mock 데이터는 시작 Step.Init 에서 카테고리 섹터로 박는다. 작성 패턴/제약/`[mock-init]`·`[script-allow]` 검증 규칙은 [목업 데이터](mockup-data.md) 단일 진실원본 참조.

> `_base.User` (`fBaseUserNo` / `fBaseUserName`) 는 자동 세팅 — Init 에서 덮어쓰지 말 것.

#### 6.2 Loaded — DOM 의존 / 라이브러리 사용

외부 라이브러리(Chart 등)는 **`Scenario.StyleURLs` 에 등록**해 진입 시 자동 로드하고(권장), `Loaded` 에서는 DOM 을 잡아 라이브러리 전역을 바로 호출한다.

```jsonc
// Scenario.StyleURLs: ["https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.min.js"]
"STEP1_Loaded_E": [
  { "Action": "Script", "Script": "var ctx = document.getElementById('myChart').getContext('2d');\nnew Chart(ctx, { type:'bar', data: { ... } });" }
]
```

> **Init 이 아닌 Loaded** — DOM 이 그려진 후에 캔버스 접근. (system-prompt-v2.md §4323)
> 라이브러리 로드는 `f.Script.load()` 보다 `Scenario.StyleURLs` 등록을 우선 (정적 URL). `f.Script.load` 는 동적 URL 등 부득이한 경우만. ([control/embed.md](control/embed.md) "외부 라이브러리 연동 패턴" 참조.)

#### 6.3 OnBackLoaded — 데이터 갱신

```jsonc
"STEP1_BackLoaded_E": [
  { "Action": "LinkedEvent", "EventName": "RefreshData_E" }
]
```

지도 재렌더링 / 외부에서 데이터가 바뀌었을 가능성 → 다시 조회.

#### 6.4 OnLeave — Cleanup

```jsonc
"STEP1_Leave_E": [
  { "Action": "Script", "Script": "if (window._myTimer) { clearInterval(window._myTimer); window._myTimer = null; }" }
]
```

#### 6.5 OnForeground — 자동 새로고침 (모바일)

```jsonc
"STEP1_Foreground_E": [
  { "Action": "LinkedEvent", "EventName": "STEP1_Init_E" }
]
```

푸시 알림 받은 후 데이터 동기화 등.

#### 6.6 ScrollEnd — 무한 스크롤

```jsonc
// system-prompt-v2.md §4488
"Events": {
  "StepEventOrder": ["Init", "ScrollEnd"],
  "Init":      "LoadPage_E",
  "ScrollEnd": "LoadPage_E"
},

// scenario.Events
"LoadPage_E": [
  { "Action": "Script", "Script": "if (_c.CtgList.length >= _c.CtgPageInfo[0].total) return;\n_c.CtgPageInfo[0].set('page', _c.CtgPageInfo[0].page + 1);\nf.Content('f_3').reload();" }
]
```

같은 핸들러를 Init + ScrollEnd 양쪽에 거는 게 일반적 패턴.

### 7. 제약 / 함정

#### 7.1 StepSub 는 Step 이벤트 사용 불가

`StepType: 'StepSub'` 면 `UseEvents: false` 자동 강제 → `Events: []`. 서브시나리오 내부의 Step 들이 자체 이벤트 가지므로 외부 호출 의미 없음.

#### 7.2 OpenURL 사용 시 StepEvent 무시

`UseOpenURL: true` 면 `executeEventOfStep` 가 즉시 return (runtime.js:3542-3545). 외부 URL 페이지로 대체되므로 이벤트 호출 불가.

#### 7.3 StepEventOrder ↔ 핸들러 키 동기 필수

`StepEventOrder` 에 안 든 이벤트 핸들러 키는 정의되어 있어도 호출 안 됨. 핸들러 키만 적고 EventOrder 누락하면 조용히 무시됨 — `[strict-fields]` 검증으로도 `Events` 객체 키 자체는 통과 (값 string 이라).

```jsonc
// ✗ 잘못 — Init 핸들러는 안 불림
"Events": { "Init": "X" }

// ✓ 정상
"Events": { "StepEventOrder": ["Init"], "Init": "X" }
```

#### 7.4 Prev / Prev_ReStart 와 Loaded 의존성

Loaded 에서 Chart/Map/Canvas/Timer 등 DOM 의존 작업 → 그 Step 으로 돌아오는 BottomButton 은 `MoveTo: "Prev_ReStart"` (재시작) 필수. `"Prev"` 면 빈 화면. (system-prompt-v2.md §4351)

#### 7.5 Init 이 컬렉션을 리셋하는 경우 moveToFirst 주의

`Current.step.moveToFirst()` 는 시작 Step 으로 돌아가며 Init 재실행 → `removeCategory + createCategory` 가 다시 돌아 사용자 입력 데이터가 날아감. (system-prompt-v2.md §4730)

#### 7.6 Tab + LinkedStep 패턴 — Init 위치

탭이 있는 부모 Step 의 Init 에서 모든 샘플 데이터를 한 번에 로딩. LinkedStep 의 Init 에 넣으면 탭 전환마다 컬렉션이 초기화됨. (system-prompt-v2.md §4627)

#### 7.7 SlideUp 추가 폼 — Init 불필요

DataUsage:`'new'` 가 자동으로 빈 섹터 생성하므로 `Init` 이벤트 자체가 불필요. `UseEvents: false`, `Events: []` 로 둠. (system-prompt-v2.md §4745)

### 8. 검증 후크 정합

| Tag | 검증 내용 |
|---|---|
| `[strict-fields]` | `StepEventOrder` enum 6종 외 값이 들어가면 거부 |
| `[event-ref]` | `Events.<EventName>` 값 + `LinkedEvent.EventName` 이 `scenario.Events` 키로 정의되어 있는지 |
| `[no-service]` | Service / API 액션은 스킬 생성에서 차단 — Step 이벤트 핸들러 안에서도 동일 |

## 함정

- `BackButton.Next` 권장값은 `"None"`. `"Prev"` 사용 시 "Prev"라는 Step을 찾으려 해서 에러. (단 실 메타는 특정 StepId 사용 케이스도 있음 — schema는 string 으로 둠.)
- `BackButton.IsRestored: true` → 뒤로가기 시 컬렉션 복원 (입력 폼 취소). `false` → 변경 유지 (상세 화면 등).
- `MoveTo: "Prev"` → 캐시 복원 (Init/Loaded 미실행). DOM 의존(Chart/Map/Canvas/Timer)이 있으면 `"Prev_ReStart"` 사용.
