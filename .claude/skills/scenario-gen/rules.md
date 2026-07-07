# 공통 규칙 (rules.md)

모든 노드(`Scenario`, `Step`, `Group`, `Control`)에 공통으로 적용되는 규칙. 노드별 추가 규칙은 각 `schema/v1/*.md` 참조.

## 1. 식별자(ID) 규칙

### 1.1 ID 형식 (실제 메타 컨벤션)
| 노드 | 위치 | 형식 |
|---|---|---|
| Step | `Steps` 객체의 **키** | `Step` + 1 이상 양의 정수 (`^Step[1-9][0-9]*$`). 예: `Step1`, `Step2`, `Step10`. `Step0`/`StepMain`/`Step01` 불가. |
| Group | `Id` 필드 | `^f_[1-9][0-9]*$` 예: `f_1`, `f_8161`. **`f_0`/`f_01`/`f_abc` 불가**. |
| Control | `Id` 필드 | 동일 |
| BottomButton | `Id` 필드 | 동일 |

**유일성**: Group/Control/BottomButton 의 `Id` 는 **시나리오 전체에서 유일**해야 한다. Step.Contents/FixedContentsTop/FixedContentsBottom 트리 + Step.BottomButtons + InputDate/Combo 의 Dialog 내부 Controls 까지 모두 합쳐서 중복 금지. validate.mjs 의 `checkIdUniqueness()` 후검증.

### 1.2 유일성
- StepId: **시나리오 내** 유일 (Steps 객체는 키 중복 자체가 불가).
- Group/Control/BottomButton의 `Id`: **시나리오 전체** 유일 권장 (실무는 `f_` + 자동증가 번호).
- 한 번 발급된 ID는 노드 삭제 후에도 재사용 금지.

### 1.3 참조 규칙
- Step 간 이동: Step의 `Next` 배열은 **StepId 문자열 배열** (`["Step2", "Step3"]`).
- BottomButton 의 `Next.MoveStepOrder` 도 StepId 배열.
- Step.`Next` 는 **forward-only** — 이전 Step 참조 금지. 뒤로가기는 `BackButton.Next: "None"` 또는 `BottomButton.MoveTo: "Prev"` 사용.

### 1.4 Step Reachability (필수 규칙)
**모든 Step 은 다음 둘 중 하나를 만족해야 한다:**
1. `StartSteps` 배열에 포함되어 있다 (진입 Step), 또는
2. 다른 Step 의 `Next` 배열에 포함되어 있다.

둘 다 아니면 **고아 Step** — 스튜디오 탐색기에 보이지 않고, 런타임에서 진입 경로가 없다. `validate.mjs` 의 `checkStepReachability()` 가 후검증으로 잡아낸다.

> **탭 내부 Step 도 `Next` 에 있어야 한다**: `Tab.Items[].LinkedStepId` 로 띄우는 Step 도 예외 없이 host Step 의 `Next` 에 포함되어야 도달로 인정된다 — `Next` 연결이 없으면 화면에 안 그려진다 (`[reach]` 가 고아로 거부). 탭은 **`Next` 요구를 면제하지 않는다.** 탭이 면제하는 것은 §1.4.1 의 **이동 트리거(`[step-nav]`)** 뿐 — 탭 헤더 클릭 자체가 트리거라 별도 `UseMove`/`BottomButton` 이 불필요하다는 의미다.

추가 cross-reference 규칙:
- `StartSteps[*]` 는 반드시 `Steps` 의 키 중 하나.
- `Step.Next[*]` 도 반드시 `Steps` 의 키 중 하나.
- 각 Step 은 `(StartSteps + 모든 Step.Next 합집합)` 에서 **정확히 1번** 등장 (0번=고아, 2번 이상=순환/다중 진입).

### 1.4.1 Step 이동 트리거 (필수 규칙)
`Step.Next` 에 다음 Step 을 적었으면 **사용자가 그 Step 으로 이동할 트리거**를 반드시 생성해야 한다 (validate.mjs `[step-nav]` 후검증). 다음 셋 중 하나 이상:

1. **BottomButton 채널** — `Step.BottomButtons[*]` 에 `MoveTo:'Next'` + `Next.MoveStepOrder:["StepN", ...]` 로 해당 StepId 포함.
2. **서브그룹 아이템 클릭 이동** — `Contents/FixedContentsTop/FixedContentsBottom` 하위 어딘가의 Group 에 `UseMove:true` + `MoveSteps.MoveStepOrder:["StepN", ...]`. (list 카드, 메뉴 타일 등 클릭으로 다음 Step 호출하는 가장 흔한 패턴.)
3. **컨트롤 직접 이동** — 자손 Control 의 `UseMove:true` + `MoveSteps.MoveStepOrder` (Label/이미지 등 단일 컨트롤 클릭 이동).

`Step.Next` 만 적고 트리거를 안 만들면 사용자는 영원히 그 Step 에 도달할 수 없다. AI 가 N 개 Step 을 만들 때 list-detail / 메뉴-진입 패턴이라면 list 카드 Group 에 `UseMove:true` 가 거의 항상 필요. `strict_step_nav:false` 로 비활성화 가능 (운영 메타 검증).

> **탭 연결 Step 은 이동 트리거를 면제받는다** — `Step.Next` 타깃이 같은 Step 안의 `Tab.Items[].LinkedStepId` 로 연결돼 있으면, 탭 헤더 클릭이 곧 진입 트리거이므로 `UseMove`/`BottomButton` 을 따로 만들 필요가 없다. **단 `Next` 에는 여전히 포함되어야 한다**(§1.4 — 그게 없으면 안 그려짐). `checkStepNavigationSources` 가 `Items[].LinkedStepId` 를 트리거 후보로 인정한다.

#### 탭을 감싸는 Group 에 UseMove 금지 (`[tab-move]`)

`Tab` 컨트롤의 **조상 Group** 에 `UseMove:true` 가 있으면, 탭 헤더 클릭이 그 Group 의 Step 이동을 트리거해 **탭 전환 대신 화면이 통째로 넘어가 버린다**. 따라서 탭을 감싸는 어떤 조상 Group 에도 `UseMove` 를 두지 말 것. 탭 안에서 다른 화면으로 이동이 필요하면 각 LinkedStep 내부의 Button/Label 컨트롤로 처리한다. validate.mjs / core 의 `checkTabAncestorMove()` 가 후검증으로 잡음 (`strict_tab_move:false` 로 비활성).

#### MoveSteps 객체 shape

`UseMove:true` 와 짝지어 쓰는 `MoveSteps` 는 단순 배열이 아니라 **순서 배열 + StepId 별 옵션 객체** 가 같은 레벨에 공존하는 구조. property-data.js `createMoveStepArea` 가 `moveSteps[stepId]` 로 접근하므로 옵션 객체가 누락되면 런타임 `TypeError`.

```jsonc
{
  "UseMove": true,
  "MoveSteps": {
    "MoveStepOrder": ["Step2", "Step3"],
    "Step2": { "Condition": "", "MoveTo": "Next" },
    "Step3": { "Condition": "{% return f.Sector('CtgCart').length > 0 %}", "MoveTo": "Next" }
  }
}
```

- `MoveStepOrder`: 후보 StepId 배열. 위에서부터 조건 통과하는 첫 항목으로 이동.
- 각 StepId 키: 동일 객체에 `^Step[1-9][0-9]*$` 패턴 키로 옵션 객체 추가.
  - `Condition`: 이동 조건식 (빈 문자열 `""` = 무조건).
  - `MoveTo`: `"Next"` \| `"Prev"` \| `"Prev_ReStart"` \| `"Init"`.
  - (선택) `Direction`, `IsIgnoreRequired`, `IsRequired`, `IsRestored`.
- 스튜디오가 새로 생성할 때 초기값은 `{ Condition: "", MoveTo: "Next" }`. AI 생성도 같은 기본값으로 시작.

Label / Group 의 `UseMove` 도 동일한 `MoveSteps` 구조를 사용한다. BottomButton 의 `Next` 객체는 별개 shape (위 4.1.1 본문 BottomButton 채널 참조).

**PopUp / SlideUp Step 도 동일 규칙 적용:**
- 같은 시나리오 내 PopUp/SlideUp 호출은 `Current.step.moveToNext('StepN', true)` — `f.Frame.popUp()` 은 다른 시나리오 호출용이므로 사용 금지.
- 부모 Step 의 `Next` 에 PopUp/SlideUp Step ID 포함 필수.
- PopUp 안에서 다른 Step 으로 `moveToNext` 하면 그 대상도 어딘가 Next 체인에 포함 필요. 예: `Step2 → Step3(PopUp) → Step4` 흐름이면 `Step2.Next = ["Step3"]`, `Step3.Next = ["Step4"]` (또는 `Step2.Next = ["Step3", "Step4"]`).
- BottomButton 의 `Next` 객체는 별개 — 임의 Step 참조 가능 (forward-only 제약 없음).

### 1.5 루트에 없는 필드 (혼동 방지)
다음은 scenarioMeta 루트에 **존재하지 않으므로** 컨트랙트나 AI 생성에서 절대 추가하지 말 것:
- `MetaContractVersion` — 컨트랙트 버전 자체이지 메타 안에 들어가는 값이 아님.
- `ScenarioId` (루트) — 루트 식별자는 따로 없음. (단 **StepSub의 자식 필드** `ScenarioId` — 호출 대상 시나리오 ID — 는 정상.)
- `StartStep` (단수) — 루트에는 항상 **`StartSteps`(복수, 배열)**. 단수 `StartStep` 은 StepSub의 `Protocol.StartStep` 안에서만 등장 (의미: 호출할 서브 시나리오의 시작 Step).

## 2. 명칭 규칙

| 노드 | 표시명 키 | 비고 |
|---|---|---|
| Group | `ContentsName` | 탐색기/디버그용. `Name` 아님. |
| Control | `ControlDefaultName` (필수) + `ControlName2` (필수, 같은 값) + `ControlName` (선택) | 셋 중 `ControlName2` 누락 시 런타임 에러. |
| Step | `StepName`, `StepTitle` | StepName=내부, StepTitle=화면 헤더. |
| BottomButton | `ButtonName` | `{{}}` 다국어 권장. |

### 2.1 Caption 규칙 (Control)
- **Input 컨트롤**: 필드명이 필요하면 `"{{필드명}}"` (다국어), 맥락상 명확하면 `""`.
- **Label**: Caption = 내부명(ControlDefaultName과 동일). 화면 표시 텍스트는 `labeltext` 필드.
- **Button**: `"{{버튼명}}"` (다국어).
- **Embed**: 항상 `""`.

### 2.2 텍스트 토큰 (대체텍스트 · 다국어 · 표현식)
두 토큰은 **용도가 다르다 — 혼동 금지**.
- **`{=키}` = 대체텍스트** — 현재 섹터의 컬렉션 키 **값으로 치환**(데이터 바인딩 표시). 예: `"{=CustomerName}"`. 천단위 콤마는 `{=$키}`. `labeltext` / `DisplayValue` 등 **표시 전용** — script 자리(값 전달)에는 쓰지 않는다(직접 대입/`copyStepValues`).
- **`{{키}}` = 다국어(i18n)** — `Language` 매핑에서 **텍스트 치환**. 고정 라벨·버튼명·캡션. 예: `"{{거래처}}"`.
- 혼용 가능: `"{{금액}} {=$Price}{{원}}"` (다국어 + 대체텍스트).
- **`{% return JS %}`** = 스크립트 표현식(조건/포맷 가공).

## 3. 타입 식별 필드 (Discriminator)

| 노드 | 필드 | 값 |
|---|---|---|
| Step | `StepType` | `"StepView"` \| `"StepSub"` |
| Step (변종) | `StepDialogType` | `""` \| `"SlideUp"` \| `"PopUp"` (StepView 일 때만) |
| Group | `ContentsType` | `"Group"` (단일) |
| Control | `ControlType` | catalog.json `controlTypes[].value` 중 하나 |

### 3.1 Control 내부 모드 식별자 (sub-discriminator)

일부 Control 은 `ControlType` 아래에 자체 모드 enum 을 두고, 모드별로 필수 필드가 달라진다. **모드 enum 값을 잘못 적으면 `oneOf` 분기 실패로 검증 에러가 대량 발생** — 정확한 값으로 작성할 것.

| ControlType | 모드 필드 | 허용 값 | 모드별 필수 필드 |
|---|---|---|---|
| `Label` | `LabelType` | `"labeltext"` \| `"LabelCKey"` | `labeltext` (정적 텍스트 모드) 또는 `LabelCKey` (컬렉션 필드 표시 모드) |
| `InputText` | `Type` | `"text"` \| `"password"` \| `"number"` \| `"email"` \| `"tel"` | — (HTML input 타입만 결정, 구조 변경 없음) |

> Label 모드 예: `{ "ControlType": "Label", "LabelType": "labeltext", "labeltext": "결제 금액", ... }` / `{ "ControlType": "Label", "LabelType": "LabelCKey", "LabelCKey": "TotalPrice", ... }`.

## 4. 트리 제약

| 부모 | 자식 키 | 자식 노드 |
|---|---|---|
| Scenario | `Steps` (객체 Map) | Step (값) |
| Step | `Contents` | Group |
| Step | `FixedContentsTop` | Group (탭/검색/필터 전용) |
| Step | `FixedContentsBottom` | Group (저장/취소 등 액션바 전용) |
| Step | `BottomButtons` | BottomButton (Control 아님, 별도 노드) |
| Group | `Contents` | Group \| Control |
| Control(InputDate, Combo) | `Dialog.Layouts[0].Controls` | Control (다이얼로그 자식) |

추가 제약:
- **Step 안에 Step 중첩 불가** — Steps 객체는 시나리오 직속 평면.
- **Control은 Step의 직접 자식이 될 수 없다** — 반드시 Group 안.
- **불필요한 그룹 중첩 금지** — 성능 저하.
- **`UseAbsoluteLayout: true` 컨트롤은 Fixed 영역 배치 금지** (보이지 않음).

### 4.1 Step 콘텐츠 영역 배치 가이드 (FixedContentsTop / Contents / FixedContentsBottom)

영역별 용도:

| 버튼/그룹 유형 | 배치 영역 | 비고 |
|---|---|---|
| 탭 버튼, 필터/검색 바 | `FixedContentsTop` | 상단 고정, 스크롤 무관 |
| 저장/확인/취소/삭제 액션바 | `FixedContentsBottom` | 하단 고정, 스크롤 무관. 또는 `BottomButtons` 채널 |
| 화면 이동 버튼 (대시보드/관리 진입 등) | `Contents` 안 Group | 스크롤 가능 영역에 배치 |
| FAB / 플로팅 액션 버튼 | `Contents` 안 **Height:100% 래퍼** + `UseAbsoluteLayout: true` | Fixed 영역 사용 금지 |

**금지 사항:**
- `FixedContentsTop` 에 일반 네비게이션 버튼/FAB 배치 금지 — 탭/검색/필터 전용.
- `UseAbsoluteLayout: true` 인 컨트롤을 Fixed 영역에 두면 안 보임 (AbsoluteLayout 은 flow 에서 빠지므로 Fixed 영역의 `Height: MatchText` 계산에 포함 안 됨).

## 5. 데이터 바인딩 규칙

### 5.1 UseDataConnection
입력 컨트롤(`InputText`, `InputNumber`, `InputDate`, `InputMask`, `MultiInputBox`, `Combo`, `RadioBox`, `CheckBox`, `Search`)이나 `Ckeys` 를 가진 컨트롤은:
- 자신의 **상위 Group 계층 중 하나 이상** 에 `UseDataConnection: true` + `DataConnection` 이 있어야 한다.
- 직접 부모가 아니어도 됨. 조상 Group 어딘가에만 있으면 동작.

> **모든 Group 은 `UseDataConnection` 을 반드시 명시한다 (`[group-dc]`)** — 비연결 그룹도 `"UseDataConnection": false`. 키를 생략하면 스튜디오(`convertTopLevelDataConnection`)가 레거시로 간주해 `UseOldDataConnection:true` 를 자동 생성하고 구버전 데이터연결 프로퍼티로 렌더한다. 스튜디오 defaults(`applyGroupDefaults`) 가 자동으로 채우지만, defaults 미적용 경로(스킬 CLI 등)에서는 생성 단계에서 직접 박아야 한다. `strict_group_dc:false` 로 비활성.

### 5.2 DataUsage 분기 (`DataConnection.DataUsage`)
| 값 | 동작 | 필수 추가 필드 |
|---|---|---|
| `query` | 그룹 자체가 카테고리 섹터 수만큼 복제 | (UseTargetSector 옵션) |
| `new` | 진입 시 빈 섹터 자동 생성 + 바인딩 | `UseNewSector: true` |
| `update` | activeSector 직접 바인딩 (읽기+쓰기) | `UseTargetSector: true` + `Status:["active"]` |
| `detail` | activeSector 읽기 전용 바인딩 | `UseTargetSector: true` + `Status:["active"]` |
| `default` | 섹터 없으면 생성, 있으면 기존 | `UseNewSector: true` + `OnlyIfNoSector: true` |

### 5.3 query 그룹 강제 규칙
- `Height: { MatchText: true, SizeValue: "" }` 필수
- `ScrollType: "ScrollY"` 필수
- 100% 또는 고정 px Height 금지 (카드 사이 빈 공간 발생)
- `UseEmptyView: "true"` 는 Group 레벨 (DataConnection 밖)
- 헤더/필터/추가버튼 등 1번만 표시할 요소는 query 그룹 **바깥** 비연결 래퍼에 배치

### 5.4 boolean 강제
- `UseNewSector`, `OnlyIfNoSector`, `UseTargetSector` 는 **반드시 boolean `true`**. 문자열 `"true"` 사용 시 런타임 동작 안 함.

### 5.5 Combo / Search 본체 표시 키 필수 (`[display-key]`)

데이터소스를 쓰는 Combo / Search 본체에는 선택값을 본체에 그릴 **표시 키**가 반드시 함께 채워져 있어야 한다 — 둘 다 비우면 선택 후 본체가 빈 칸이 된다.

| 컨트롤 | 조건 | 필수 키 |
|---|---|---|
| `Search` | 항상 (Search 는 늘 DataSource 기반) | `CtrlDisplayCkey` **또는** `DisplayValue` (비어있지 않은 값) |
| `Combo` | 자식 `ComboList.UseDataSource !== false` (`true` 또는 미지정 → 런타임 default=true) | `CtrlDisplayCkey` **또는** `DisplayValue` (비어있지 않은 값) |
| `Combo` | 자식 `ComboList.UseDataSource === false` (Fixed Items) | `CtrlDisplayCkey` (또는 비어있지 않은 `DisplayValue`) **필수** — 고정데이터도 동일하게 채운다 |

> ★ **고정데이터(Fixed Items, `UseDataSource:false`)도 예외 없음** — 과거에는 고정 Combo 에 `DisplayValue: ""` 빈 문자열 fallback (런타임이 `ComboList.SaveNameKey` 자동 표시) 을 허용했으나, **이 컨벤션은 폐기**. 고정/외부 데이터 구분 없이 `CtrlDisplayCkey` (또는 비어있지 않은 `DisplayValue`) 를 무조건 채운다.
> `[display-key]` 후검증(validate.mjs) 은 여전히 고정모드를 검사 대상 외로 둬서 **자동 차단하지는 않는다** (관대). 차단되지 않더라도 생성 시에는 반드시 채울 것.

### 5.5.1 고정데이터 컨트롤의 저장 키 필수 (`Ckeys` / `SaveNameKey` / `SaveValueKey`)

데이터소스 연결 컨트롤(RadioBox / Combo / Search / MultiCheckBox 등) 은 **고정데이터(`UseDataSource:false`) 든 외부데이터든** 선택값을 콜렉션에 저장할 키가 있어야 한다. 누락 시 선택해도 값이 저장되지 않는다.

| 컨트롤 | 고정모드(`UseDataSource:false`) 필수 키 |
|---|---|
| `RadioBox` | `Ckeys` + `SaveNameKey` + `SaveValueKey` — 엔진이 `SaveNameKey`/`SaveValueKey` 로 선택 항목의 표시명/값을 Ckeys 에 저장 ([radiobox.js:380-381](public/engine/control/radiobox.js#L380-L381)). `CtrlDisplayCkey` 는 RadioBox 엔진이 사용 안 함 — 넣지 않는다. |
| `Combo` | `Ckeys` + 본체 `CtrlDisplayCkey` + 자식 `ComboList.SaveNameKey`/`SaveValueKey` |
| `Search` | `Ckeys` + 본체 `CtrlDisplayCkey` + 자식 `List` 의 `Title`/`CollectionMapper` |

> `SaveValueKey` 누락 시 저장 동작 안 함 — 고정데이터라고 생략하지 말 것. `Ckeys` 사용 시 상위 Group 계층에 `UseDataConnection:true` + `DataConnection` 필요 (`[data-conn]`).
>
> ★ **저장 키는 목업/카테고리 데이터의 필드명에 맞춘다** — 엔진이 선택값을 `sector[SaveValueKey]` 에 쓰므로, 목업 데이터를 생성했다면 거기서 쓰는 키와 동일해야 바인딩이 성립한다. 임의 키를 박지 말 것 (segmented-radio 머티리얼라이저도 `saveValueKey`/`saveNameKey` props 로 목업 키를 받는다).
>
> 예외: 선택값을 섹터에 **저장하지 않는** 순수 필터/뷰 토글(예: Click 이벤트로만 화면을 거르는 segmented-radio) 은 저장 키를 생략할 수 있다. 폼 입력(데이터 바인딩)이면 반드시 채운다.

권장 패턴 — `CtrlDisplayCkey` 모드 (default):

```jsonc
{
  "ControlType": "Search",
  "Ckeys": ["EmpNo", "EmpName"],
  "CtrlDisplayCkey": "EmpName",
  "Dialog": { "Layouts": [{ "Controls": [{
    "ControlType": "List",
    "DataSourceName": "EmpListDS",
    "Title": "EmpName",
    "Ckeys": ["EmpNo", "EmpName"],
    "CollectionMapper": { "MapperOrder": ["EmpNo", "EmpName"], "EmpNo": "EmpNo", "EmpName": "EmpName" }
  }]}]}
}
```

`DisplayType` 명시 시 짝 키만 채운다 (상호배타):
- `DisplayType: "CtrlDisplayCkey"` → `CtrlDisplayCkey` 만 (DisplayValue 는 두지 않음).
- `DisplayType: "DisplayValue"` → `DisplayValue: "{=Field}"` 또는 `"{% JS %}"` 만 (CtrlDisplayCkey 는 두지 않음).

후검증 `[display-key]` 가 차단 (기본 strict). `DISPLAY_KEY_STRICT=0` / `strict_display_key:false` 로 비활성 가능.

### 5.6 mock 데이터 ↔ DC 그룹 하위 콜렉션키 짝 규칙

`[mock-init]` 은 **정방향**(카테고리 → 시작 Step.Init 에서 `f.Collection.addSector` 로 mock 섹터 박기)만 강제한다. 그 짝이 되는 **역방향** 도 지킬 것:

> **mock 을 박은 DataConnection 그룹 하위에서, 데이터가 연결되어야 하는 항목들은 콜렉션키(Ckey)가 지정되어 있어야 한다.**

- addSector 가 섹터에 넣은 필드(`fName`, `fPrice` 등)는 그룹 하위 컨트롤이 콜렉션키로 바인딩해야 화면에 그려진다. 바인딩 키 없이 정적 텍스트(`Label.labeltext` / 정적 `Caption`)만 두면 **mock 데이터는 들어가지만 모든 복제 카드가 같은 고정 문구만 반복**하고 데이터는 죽는다.
- 항목별 콜렉션키: `Label`→`LabelType:"LabelCKey"`+`LabelCKey`, Input 7종→`Ckeys`, `Combo`/`Search`→`Ckeys`+`SaveValueKey`/`CtrlDisplayCkey`(§5.5), `CheckBox`/`RadioBox`→`Ckeys`, 값 표시 `Button`→`ButtonValueCKey`.
- 바인딩 대상은 **그 섹터에서 실제로 보여줄/입력받을 필드들** 뿐 — 카드 장식용 정적 라벨까지 전부 바꾸라는 뜻은 아니다.
- 어떤 콜렉션키도 안 쓰는 순수 정적 UI 라면 DataConnection / mock 자체를 두지 말 것 → `[proto]` 모드. 상세는 [schema/v1/mockup-data.md](schema/v1/mockup-data.md) ★ 짝 규칙.
- (현재 후검증 미적용 — 생성 가이드 규칙. `[mock-init]` 정방향과 `[bind]` 조상 검증으로 부분 커버됨.)

## 6. 스타일 객체 규칙

`schema/v1/style-objects.md` 카탈로그 참조. 주요 함정:

- **하단 키 명명**: Padding/Margin/AbsolutePosition은 **`Btm`**. BorderStyle만 `Bottom`.
- **사용 안 하는 방향은 키 자체 생략**. 빈 문자열 `""` 은 미설정 (동작 안 함).
- **calc()** 는 `+`/`-` 좌우 공백 필수.
- **색상 토큰**: `var(--colorBlack)` 또는 `@colorBlack` 형태.

## 7. 이벤트 / 서비스 규칙 (events.schema.json / service-binding.schema.json)

### 7.0 시나리오 이벤트 핸들러 (`scenario.Events`)

`scenario.Events` 는 이벤트 이름 → Action 배열 맵.

| 항목 | 규칙 |
|---|---|
| 이벤트 이름 (키) | `^[A-Za-z_][A-Za-z0-9_.]*$` (영문/숫자/언더스코어/점, 첫 글자 영문/언더스코어). 실 샘플 예: `Init`, `Loaded`, `Click`, `userCheck`, `getList`, `STEP1_Query_E`, `Step6Init`, `Chart.js` |
| 값 | Action 객체 배열 — 위에서 아래로 순차 실행 |
| 빈 핸들러 | 사용 안 할 핸들러 이름은 **키 자체 누락**. `[]` 빈 배열로 두면 동작 정의 0 개 (가능하지만 의미 없음) |

#### Action 종류 (4분기 — `Action` discriminator)
| Action | 필수 필드 | 생성 허용 |
|---|---|---|
| `Script` | `Script` (JS 코드) | **O** — 가장 흔히 사용 |
| `LinkedEvent` | `EventName` (다른 핸들러 이름) | **O** |
| `Service` | `ServiceBinding`, `ServiceName`, `SystemID` | ✗ — `[no-service]` 차단 |
| `API` | `ModuleID` | ✗ — `[no-service]` 차단 |

`Action: 'Script'` 안의 `Script` 필드에서는 런타임 API 호출 가능: `Current.step.moveToNext('StepN', true)`, `f.Content('f_xxx').reload()`, `Load.control.controlkey('hid')`, `f.Date().format('YYYY-MM-DD')`, `f.Setting.*`, `f.checkRequired()`, `f.MessageBox('Alert').setTitle(...).setDescription(...).addButton(MOVETYPE_*, label, executeM).show()` 등 (다이얼로그 종결자는 `.show()`).

### 7.1 호스트별 이벤트 키 (실 샘플 기준)
| 호스트 | EventOrder 키 | 이벤트 이름 enum |
|---|---|---|
| Step | `StepEventOrder` | `Init`, `Loaded`, `OnBackLoaded`, `OnLeave`, `OnForeground`, `ScrollEnd` |
| BottomButton | (없음) | `Click` 단일 |
| Group | `ContentEvent` | `Click`, `ScrollEnd` |
| InputText / MultiInputBox | `InputEventOrder` | `change`, `input`, `focusin`, `focusout` (모두 소문자) |
| InputNumber / InputMask | `InputEventOrder` | `change` 만 |
| InputDate (자식 Calendar 안) | `DateOrder` | `DialogClose` |
| Combo (자식 ComboList 안) | `ComboOrder` | `change`, `DialogClose` |
| Search (자식 List 안) | `SearchOrder` | `change`, `Delete`, `DialogClose` |
| CheckBox | `CheckBoxOrder` (선택) | `Click` |
| RadioBox / Label / Calendar | (직접) | `Click` |
| ImageBox | `ImageEventOrder` | `Click` |
| InputFile | `InputFileOrder` | `change` |

값은 모두 **scenario.Events 의 핸들러 이름 문자열** (`[event-ref]` 후검증).

### 7.2 ServiceBinding (`scenario.ServiceBinding`)

서비스 호출 정의 맵. **스킬 생성 시 비어있는 객체 `{}` 만 허용** — 서비스 구성은 운영 단계에서. `[no-service]` 후검증이 차단 (기본 strict, `strict_no_service:false` 로 비활성).

| 필드 | 의미 |
|---|---|
| `SystemID` | 시스템 식별자 (`Flextudio` / `Other` / `FlexSQL` 등) |
| `ModuleID` | 모듈 식별자 |
| `ServiceName` / `SQLServiceName` | 서비스 이름 |
| `MajorVersion` | 버전 |
| `UsePKey` / `UseParamBlock` / `UseResultBlock` / `UseInnerBlock` | 토글 |
| `SetCategory` | 결과 반영 대상 카테고리 |
| `BeforeScript` / `ResultScript` | FlexSQL Before/After Script |

지원 시스템: FlexSQL / Firestore / FlexAutoQuery / GoogleSheet (flextudio-guide §6.6).

### 7.3 데이터소스 서비스/API 사용 금지

`scenario.DataSources[*].DataSourceType:'Service'\|'API'` 도 생성 금지 (`[no-service]` + 기존 `[sample]`). Sample-safe 한 `Fixed` / `Grid` 만 사용.

### 7.4 Step `Events` 규칙
- `Events` 키는 **항상 존재**해야 한다 (UseEvents=false 여도).
- `UseEvents: true` → `Events: { StepEventOrder: [...], <EventName>: "EVENT_NAME" }`
- `UseEvents: false` → `Events: []` (빈 배열)
- 누락 시 런타임 에러.

## 8. ControlKey 상태 규칙
| 값 | 의미 |
|---|---|
| `""` | 정상 |
| `"Required"` | 필수 입력 (런타임 자동 검증 — Script 직접 작성 금지) |
| `"ReadOnly"` | 읽기 전용 |
| `"Hide"` | 숨김 |
| `"Disabled"` | 비활성 |

LoadScript에서는 `Load.control.controlkey('hid')` 등으로 동적 변경.

## 8.1 InnerBlock 사용 금지 (no-inner-block)

**스킬 생성 시 InnerBlock 패턴은 어떤 형태로도 사용 금지.**
- 금지 필드: `UseInnerBlock`, `InnerBlockKey`, `RepeatStyle` (Group 어디에도 박지 말 것).
- 데이터 반복 렌더링이 필요하면 `DataConnection(DataUsage:'query')` 그룹으로 표현 — 카테고리 섹터 수만큼 그룹이 자동 복제됨 (rules.md §5.3).
- `validate_scenario` 의 `[no-inner-block]` 후검증으로 강제 (기본 strict). 운영 메타 호환을 위해 `strict_no_inner_block:false` 로 비활성 가능.

## 8.2 컬렉션 식별자 예약어 차단 (no-reserved-ckey / no-reserved-category)

**컨트롤 `Ckeys` 와 카테고리 이름은 시스템 게터 / JS 예약어·빌트인과 충돌하면 안 된다 — schema 레벨에서 차단.**

- 정의: [`schema/v1/naming-objects.schema.json`](schema/v1/naming-objects.schema.json) — `ckey` / `ckeyWithSuid` / `categoryName` / `ckeysArray` / `ckeysArrayWithSuid` / `categoryNameOrEmpty`.
- 차단 enum:
  - `sectorReservedKeys` — `_SUID` / `_mSUID` / `block` / `collection` / `innerBlocks` / `keys` / `status` / `isAdded` / `isUpdated` / `isDeleted` / `isSelected` / `isActive` / `isLast` / `outerSector` / `outerBlock`. (`_SUID` 는 `Panel.Collection.Ckeys` 의 시스템 등록 슬롯에서만 예외 허용.)
  - `jsReservedWords` — `for`/`while`/`class`/`new`/`delete`/`return`/`void`/`this`/`super` 등 JS 예약어 + `length`/`toString`/`constructor`/`prototype`/`Object`/`Array`/`Number`/... 등 빌트인.
- 적용 위치 (생성 시 거부):
  - 컨트롤 `Ckeys` — controlBase / calendarControl(SingleDate/StartDate/EndDate) / comboListControl / searchListControl / calendar-navigator(SingleDate/StartDate/EndDate) / tab.
  - `Panel.Collection.Ckeys` (`_SUID` 예외).
  - `Panel.Category` 키 + `Panel.CategoryOrder` 항목.
  - `DataConnection.CategoryName` (TargetSector 안 CategoryName 은 schema 차단 — `properties.CategoryName: false`).
  - `DataSource[Collection].CategoryName`.
  - `paramBlock.CategoryName` (빈 문자열 예외) / `resultBlock.CategoryName` / `resultBlock.PKeys`.
  - `sectorFilter.Condition.ConditionKey`, `sectorFilter.Parent.DCParentKey` / `DCChildKey`.
- 안티패턴 (`CtgNew*`/`CtgEdit*`/`CtgAdd*`/`CtgInsert*`) 및 `Ctg` 접두 컨벤션은 schema 강제 X — validator 경고로만 (정당화 케이스 존재).
- 상세 규칙은 [runtime/v1/collection/naming.md](runtime/v1/collection/naming.md), 시스템 게터 출처는 [runtime/v1/collection/sector.md §6](runtime/v1/collection/sector.md).

## 9. 스키마 미정의 필드 금지 (strict-fields)

**컨트랙트 (`schema/v1/*.schema.json`) 에 정의되지 않은 필드는 메타 생성 시 사용 금지.**
- AI 가 임의로 키 이름을 만들어 박지 못하도록 스킬 생성 흐름 (`validate_scenario` / `validate_fragment`) 에 `strict_fields:true` 가 기본값으로 적용된다.
- 내부 동작: 모든 schema 의 `additionalProperties:true` 를 `unevaluatedProperties:false` 로 뒤집은 별도 Ajv 인스턴스로 추가 검증. allOf/oneOf/$ref 합성 분기를 통과한 키는 "평가됨" 으로 인정되므로, 진짜 미정의 키만 차단.
- 새 필드가 필요하면 컨트랙트(`schema/v1/*.schema.json` 또는 `_base.schema.json`) 에 먼저 추가할 것.
- 운영 메타 검증 등에서 forward-compat 가 필요하면 호출 시 `strict_fields:false` 로 비활성화 가능.

## 10. 알려진 함정

### Step
- `BackButton.Next` 는 항상 `"None"`. `"Prev"` 사용 시 "Prev"라는 이름의 Step을 찾으려 해서 에러.
- `BackButton.IsRestored: true` → 뒤로가기 시 컬렉션 복원 (입력 폼 취소). `false` → 변경 유지.
- StepDialog는 더 이상 별도 StepType이 아님 — `StepView` + `StepDialogType: "SlideUp"|"PopUp"` 로 표현.

### BottomButton
- `MoveTo: "Prev"` → 캐시에서 복원 (Init/Loaded 재실행 안 됨)
- `MoveTo: "Prev_ReStart"` → 처음부터 재시작 (Init/Loaded 재실행). DOM 의존(Chart/Map/Canvas/Timer)이 있으면 `Prev_ReStart`.
- `f.Frame.popUp()` 은 다른 시나리오용. 같은 시나리오 PopUp Step 호출은 `Current.step.moveToNext('StepN', true)`.

### Control
- `ControlName2` 누락 = 런타임 에러. 항상 `ControlDefaultName` 과 같은 값으로 함께 작성.
- `isColumnCtrl: false` 항상 명시 (Sheet 컬럼 모드 외).
- InputDate/Combo 는 **리프 아님** — `Dialog` 자식 트리 보유.
- **`ImageBox` / `InputFile` 은 AI 생성 시 데이터 메타를 생략한 스켈레톤으로 만든다.** 즉 `ImageBox` 의 `ViewGroup` / `EditGroup`, `InputFile` 의 `Ckeys` / `Attributes` (FlexKey / SharedTarget / CategoryName / Limit 등) 는 **빼고 생성**. 작성하더라도 `ImageBox.{ViewGroup,DefaultViewGroup}.{ImgPath,BucketUrl}` 은 **반드시 비어있어야 한다** — `validate.mjs` 의 `[image]` cross-check 가 잡음 (운영 메타 검증 시 `IMAGE_PATH_STRICT=0` 으로 비활성). 카테고리·파일키·공유 범위·이미지 경로·호스팅 URL 등은 스튜디오/사용자가 사후 설정한다. 단 작성한다면 형태가 유효해야 함 (schema if/then 강제). 자세히는 [schema/v1/design-system.md §11](schema/v1/design-system.md).

### Group
- `reload()` 는 Group에만. Control 직접 reload 시 에러.
- DataConnection 그룹은 `reload()` 불가 (동일 Id 그룹 복제 문제).
- 카테고리 이름은 숫자만으로 구성 금지.
