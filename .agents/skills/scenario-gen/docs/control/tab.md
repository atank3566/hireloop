# Tab

> 공식 가이드: <https://docs.flextudio.com/flextudio/scenario/component/control/tab>

탭 컨트롤. 각 `Items[].LinkedStepId` 로 **다른 Step 의 전체 UI** 를 탭 내부에 렌더링한다.

## 어떤 케이스에 쓰는가

| 상황 | 추천 |
|---|---|
| 같은 리스트를 **필터만 변경** (내 결재/내 신청 등) | **RadioBox + ControlStyle:"styleTab"** (RadioBox.md 참조) |
| 탭마다 약간의 컨텐츠 show/hide | RadioBox + styleTab |
| **탭마다 완전히 다른 화면 레이아웃** | **Tab 컨트롤 + 별도 Step** |

탭 전환 시 화면이 거의 통째로 바뀌는 경우에만 Tab 컨트롤을 쓴다.

## 스키마

`control/tab.schema.json` — `controlBase` + Tab 분기 키.

## 필수 / 핵심 속성

| 속성 | 비고 |
|---|---|
| `ControlType` | const `"Tab"`. |
| `Height` | **반드시 `{ SizeValue: "100", SizeUnit: "%", MatchText: false }`**. 고정 px 면 LinkedStep 콘텐츠가 잘림. |
| `Items[]` | 탭 항목 배열 (`minItems: 1`). 각 항목 `ItemName / ItemValue / LinkedStepId` 필수. |
| `Items[].LinkedStepId` | 이 탭이 선택되었을 때 렌더할 Step Id. **자기 자신 Step 금지** (무한 재귀). |
| `Items[].Events.Click` | 탭 클릭 시 실행할 이벤트 (선택). |
| `Ckeys` | 선택 탭의 ItemValue 저장 키 (선택). |
| `DefaultValue` | **초기 선택 탭값** — `Items[].ItemValue` 와 일치하는 항목이 선택 상태로 시작. (`""`/미지정 → 첫 항목.) string strict. |
| `TabHeader` / `SelectTabHeader` / `TabHeaderItem` / `SelectTabHeaderItem` | 헤더 디자인 (선택). |

## 초기 선택값 — `DefaultValue`

| 값 | 동작 |
|---|---|
| `""` / 미지정 | 첫 번째 `Items` 항목 자동 선택. |
| `Items[].ItemValue` 중 하나와 일치 | 해당 항목 선택 상태로 시작. |
| `Items[].ItemValue` 와 어느 것도 일치 안 함 | 운영 메타에서는 fallback 으로 첫 항목 — **AI 생성 시 반드시 Items[].ItemValue 중 하나와 동일하게**. |

`Ckeys` 와 함께 쓰면, 부모 Group 의 카테고리 필드(=`Ckeys[0]`) 초기값이 `DefaultValue` 로 set 되고, 이후 사용자가 다른 탭을 누르면 그 항목의 `ItemValue` 가 같은 ckey 에 저장.

### ⚠️ DefaultValue 로 초기 선택된 LinkedStep 도 Step 이벤트 미실행

`DefaultValue` 가 가리키는 항목의 `LinkedStepId` 가 진입과 동시에 렌더되지만, **그 Step 의 `Init` / `Loaded` / `OnBackLoaded` / `OnLeave` / `OnForeground` / `ScrollEnd` 은 모두 실행되지 않는다** (Tab 컨트롤 일반 제약 — 아래 "Tab 내부 Step 의 동작 제약" 동일).

| 시점 | 무엇이 일어나는가 | 어디서 처리하는가 |
|---|---|---|
| Tab 진입 + `DefaultValue` 매칭 항목 렌더 | LinkedStep UI 만 그려짐, Step 이벤트 미발생 | **부모 Step(Tab 이 있는 Step) Init** 에서 모든 카테고리/리스트 로딩 |
| 사용자가 다른 탭 클릭 | 새 LinkedStep UI 렌더, Step 이벤트 미발생 | `Items[].Events.Click` 핸들러에서 reload / 필터 변경 |

> **CRITICAL:** "`DefaultValue` 가 있으니 그 Step 의 `Init` 이 한 번은 돌겠지" — **돌지 않는다.** 초기 데이터 로딩까지 모두 부모 Step Init 에서 끝내라. `DefaultValue` 항목에 대응하는 `Items[].Events.Click` 은 사용자가 *명시적으로 그 탭을 다시 누른* 경우에만 동작 (자동 미발화).

```jsonc
{
  "ControlType": "Tab",
  "Ckeys":        ["MenuType"],
  "DefaultValue": "HOME",
  "Items": [
    { "ItemName": "HOME",   "ItemValue": "HOME",   "LinkedStepId": "Step2" },
    { "ItemName": "COFFEE", "ItemValue": "COFFEE", "LinkedStepId": "Step4", "Events": { "Click": "Query_CategoryMenu" } }
  ],
  "...": "..."
}
```

→ 진입 시 `HOME` 탭이 선택된 상태로 시작, `Step2` UI 가 렌더. 이때 `Step2.Events.Init` 은 **호출되지 않음**. `HOME` 의 데이터가 필요하면 Tab 이 있는 부모 Step 의 `Init` 에서 같이 로딩.

## 부모 / 형제 제약

- Tab 의 부모 Group 도 **Height 100%** 여야 한다.
- Tab 은 해당 Step Contents 의 **유일한 컨트롤**. 같은 레벨에 다른 컨트롤을 두면 100% 높이에 밀려 보이지 않는다 — 필터/검색바 등 부가 UI 는 각 LinkedStep 내부에 배치.
- **조상 Group 에 `UseMove:true` 금지** (`[tab-move]`) — 탭을 감싸는 어떤 조상 Group 이든 `UseMove:true` 가 있으면 탭 헤더 클릭이 그 Group 의 Step 이동을 트리거해 **탭 전환 대신 화면이 넘어가 버린다.** 탭 안에서 다른 화면 이동이 필요하면 각 LinkedStep 내부 Button/Label 컨트롤로 처리. validate.mjs / core 의 `checkTabAncestorMove()` 가 후검증 (`strict_tab_move:false` 로 비활성).

## ★ Tab 내부 Step 의 동작 제약 (공식 가이드 인용)

> "탭 컨트롤은 일반 스텝에서 제공하는 기능이 적용되지 않습니다. 따라서 **스텝버튼을 그려주지 않으며 스텝 이벤트도 실행되지 않습니다.** 서브시나리오 스텝은 탭 컨트롤에서 보여줄 수 없습니다."
> — flextudio 공식 문서 (Tab)

이로부터 따라오는 실무 규칙:

| 항목 | 동작 | 설계 시 적용 |
|---|---|---|
| **StepButton (스텝 하단 버튼)** | 그려지지 않음 | 저장/취소 등 액션은 LinkedStep 내부에 일반 Button/Label 컨트롤로 배치. |
| **Step Events** (`Init` / `Loaded` / `OnBackLoaded` / `OnLeave` / `OnForeground` / `ScrollEnd`) | **모두 미실행** | LinkedStep 의 Init 에 데이터 로딩 로직 두면 동작하지 않음 → **부모 Step (Tab 이 있는 Step) 의 Init** 에서 모든 카테고리/리스트를 한 번에 로딩. |
| **카테고리 초기화** | LinkedStep Init 미실행 → `removeCategory + createCategory` 패턴 사용 불가 | 카테고리 초기화/추가 로직 역시 부모 Step Init 에 통합. |
| **서브시나리오 Step** | 표시 불가 | `LinkedStepId` 에 `StepType: "StepSub"` 인 Step 지정 금지. |
| **데이터 변경 트리거** | LinkedStep 진입 자체로는 발생 안 함 | 탭 전환 시 동작이 필요하면 **`Items[].Events.Click`** 에 핸들러를 두고, 그 안에서 reload/필터 변경. |
| **Reachability** | LinkedStep 도 host Step 의 `Next` 에 있어야 함 | `Items[].LinkedStepId` 로 띄우는 Step 도 host Step 의 `Next` 에 포함되어야 도달로 인정 (`[reach]`). **`Next` 연결이 없으면 화면에 안 그려진다.** 탭은 `Next` 요구를 면제하지 않음 — 면제하는 건 아래 이동 트리거(`[step-nav]`)뿐. |
| **이동 트리거** | LinkedStep 은 `UseMove`/`BottomButton` 트리거 불요 | `Step.Next` 타깃이 탭으로 연결돼 있으면 탭 헤더 클릭이 곧 트리거 — `[step-nav]` 가 `Items[].LinkedStepId` 를 트리거 후보로 인정. |

### ⛔ 탭 내부 LinkedStep 에는 Embed 컨트롤 금지 (`[tab-embed]`)

Step 이벤트(`Init`/`Loaded`)가 미실행이므로, **LinkedStep 안에 `Embed` 컨트롤을 두면 초기화/렌더 시점을 잡을 수 없다** (예: 통계 탭에 차트 Embed). Embed 는 보통 Step 의 `Loaded`/`Init` 에서 DOM 을 조작해 초기화하는데, 탭 내부 Step 에서는 그 이벤트가 돌지 않아 **빈 영역만 그려지거나 차트/지도/QR 이 안 뜬다.**

- 탭 내부에 렌더되는 Step(= 어떤 `Items[].LinkedStepId` 의 대상)의 Contents 트리에 `Embed` 가 있으면 `checkTabLinkedStepEmbed()` 가 거부 (`[tab-embed]`, `strict_tab_embed:false` 로 비활성).
- Embed 가 필요한 화면(통계/지도/차트 등)은 **탭이 아닌 별도 Step** 으로 분리하거나, RadioBox+`ControlStyle:"styleTab"` 의 show/hide 로 구성.

> **CRITICAL — LinkedStep 의 Init/Loaded 에 의존 금지:** LinkedStep 안에서 Step Event 가 동작한다고 가정하고 메타를 짜면 데이터가 비어 있는 화면이 그려진다. 모든 초기화는 부모 Step Init + `Items[].Events.Click` 조합으로 분산하라.

## 예시

```jsonc
{
  "ContentsName": "TabWrap",
  "ContentsType": "Group",
  "Height": { "SizeValue": "100", "SizeUnit": "%", "MatchText": false },
  "Width":  { "SizeValue": 100,   "SizeUnit": "%" },
  "UseDataConnection": true,
  "DataConnection": { "TargetType": "category", "CategoryName": "cafeUser" },
  "Id": "f_154821",
  "Contents": [{
    "ControlType": "Tab",
    "ControlStyle": "None",
    "ControlDefaultName": "Tab1",
    "ControlName2": "Tab1",
    "Caption": "",
    "Id": "f_154822",
    "Width":  { "SizeValue": 100, "SizeUnit": "%" },
    "Height": { "SizeValue": "100", "SizeUnit": "%", "MatchText": false },
    "isColumnCtrl": false,
    "Ckeys":        ["MenuType"],
    "DefaultValue": "HOME",
    "Items": [
      { "ItemName": "HOME",   "ItemValue": "HOME",   "LinkedStepId": "Step2", "Events": { "Click": "TapHomeLoaded"      } },
      { "ItemName": "COFFEE", "ItemValue": "COFFEE", "LinkedStepId": "Step4", "Events": { "Click": "Query_CategoryMenu" } },
      { "ItemName": "DRINK",  "ItemValue": "DRINK",  "LinkedStepId": "Step4", "Events": { "Click": "Query_CategoryMenu" } },
      { "ItemName": "BOTTLE", "ItemValue": "BOTTLE", "LinkedStepId": "Step4", "Events": { "Click": "Query_CategoryMenu" } }
    ],
    "TabHeader": {
      "ArrangeItemsStyle": { "UseArrangeItems": true, "ArrangeItemsType": "EqualDistribution" }
    },
    "SelectTabHeader": {},
    "TabHeaderItem":      { "FontStyle": {} },
    "SelectTabHeaderItem":{ "FontStyle": {} }
  }]
}
```

## 디자인 — 헤더 4종 슬롯

탭 헤더 영역의 외형은 4개 디자인 객체로 분리되어 있고, 각각 스코프가 다르다. 슬롯 안의 하위 키는 모두 공용 [style-objects](../style-objects.md) 의 $def 를 그대로 사용.

| 슬롯 | 스코프 | 사용 키 |
|---|---|---|
| `TabHeader` | 헤더 **컨테이너** (아이템들을 감싸는 띠) | `ArrangeItemsStyle` / `Padding` / `Margin` / `BorderStyle` / `BgStyle` |
| `SelectTabHeader` | 선택 상태 컨테이너 | 동일 (보통 비워둠 — 선택 강조는 `SelectTabHeaderItem` 에서) |
| `TabHeaderItem` | **각 항목**(미선택) | `FontStyle` / `Padding` / `Margin` / `BorderStyle` / `BgStyle` |
| `SelectTabHeaderItem` | 선택된 항목 | `FontStyle` / `BgStyle` / `BorderStyle` (보통 Padding/Margin 은 TabHeaderItem 값 상속) |

### `ArrangeItemsStyle` (TabHeader/SelectTabHeader 전용)

| 키 | 값 | 의미 |
|---|---|---|
| `UseArrangeItems` | boolean | 정렬 옵션 사용 여부 |
| `ArrangeItemsType` | `"MatchText"` / `"EqualDistribution"` / `"Fixed"` | 항목 너비 정책 — 텍스트 폭에 맞춤 / 균등 분배 / 고정 |
| `ArrangeItemsAlign` | `"Left"` / `"Center"` / `"Right"` / `"Between"` | 컨테이너 안 정렬 |

### 디자인 풀 폼 예시 (운영 메타 실사용 형태)

```jsonc
{
  "ControlType": "Tab",
  "ControlStyle": "None",
  "ControlName2": "Tab1",
  "Caption": "Tab1",
  "Id": "f_4187",
  "Width":  { "SizeValue": "100", "SizeUnit": "%" },
  "Height": { "SizeValue": "400", "SizeUnit": "px" },
  "isColumnCtrl": false,
  "Items": [
    { "ItemName": "", "ItemValue": "", "LinkedStepId": "undefined" }
  ],
  "TabHeader": {
    "ArrangeItemsStyle": {
      "UseArrangeItems":   true,
      "ArrangeItemsType":  "MatchText",
      "ArrangeItemsAlign": "Left"
    },
    "Padding":     { "UseAuto": true },
    "Margin":      { "UseAuto": true },
    "BorderStyle": { "Useborder": true },
    "BgStyle":     { "UseBackground": true }
  },
  "SelectTabHeader": {},
  "TabHeaderItem": {
    "FontStyle":   { "UseFont": true },
    "Padding":     { "UseAuto": true },
    "Margin":      { "UseAuto": true },
    "BorderStyle": { "Useborder": true },
    "BgStyle":     { "UseBackground": true }
  },
  "SelectTabHeaderItem": {
    "FontStyle":   { "UseFont": true },
    "BgStyle":     { "UseBackground": true },
    "BorderStyle": { "Useborder": true }
  }
}
```

> `Use*` 류 boolean 은 strict — 문자열 `"true"`/`"false"` 금지 (JS truthy 함정). 운영 메타에 잔존 string 형태가 있으면 boolean 으로 마이그레이션. property-data.js `EditControl(EDITOR_CTRL.CHECKBOX)` 진실원본.

## 이벤트

Tab 본체에는 별도 Events 객체가 없고, **각 `Items[].Events.Click`** 으로 항목별 핸들러를 둔다. (validate.mjs 의 control event cross-check 도 항목 단위로 동작.)

## 후검증 (validate.mjs `[tab]`)

스키마로 표현 불가한 cross-reference 는 `validate.mjs` 의 `checkTabLinkedSteps()` 가 검증. 실패 시 `[tab]` 태그로 보고.

| 검증 | 조건 | 메시지 형태 |
|---|---|---|
| LinkedStepId 존재 | `Items[].LinkedStepId` 가 `scenario.Steps` 에 정의됨 | `references unknown Step` |
| 자기 참조 금지 | `Items[].LinkedStepId` ≠ host Step Id | `references its own host Step — infinite recursion` |
| StepSub 금지 | 가리키는 Step 의 `StepType ≠ "StepSub"` | `points to a StepSub — subscenario Step cannot be rendered inside Tab` |
| DefaultValue 매칭 | `DefaultValue` 가 `""` 가 아니면 `Items[].ItemValue` 중 하나와 일치 | `does not match any Items[].ItemValue` |

> **`[reach]`** — `Items[].LinkedStepId` 로 띄우는 Step 도 **host Step 의 `Next` 에 포함되어야** 도달로 인정된다(탭은 `Next` 요구를 면제하지 않음). `Next` 연결이 없으면 안 그려지고 `[reach]` 가 고아로 거부.
>
> **`[step-nav]` (core `checkStepNavigationSources`)** — `Step.Next` 타깃이 같은 Step 안의 `Tab.Items[].LinkedStepId` 로 연결돼 있으면 이동 트리거 충족으로 인정 (탭 헤더 클릭이 트리거). 즉 탭 연결 Step 에는 `UseMove`/`BottomButton` 을 따로 안 만들어도 됨.
>
> **`[tab-move]` (core `checkTabAncestorMove` / validate.mjs)** — Tab 의 조상 Group 에 `UseMove:true` 가 있으면 거부. `strict_tab_move:false` 로 비활성.
>
> **`[tab-embed]` (core `checkTabLinkedStepEmbed` / validate.mjs)** — `Items[].LinkedStepId` 로 띄우는 Step 의 Contents 트리에 `Embed` 컨트롤이 있으면 거부. `strict_tab_embed:false` 로 비활성.

## 함정

- **Height 100% 누락** — `48px` 같은 고정 높이를 주면 헤더만 보이고 LinkedStep 콘텐츠가 사라진다.
- **`LinkedStepId` 자기 참조** — Tab 이 들어있는 Step 자신을 가리키면 무한 재귀(`Maximum call stack size exceeded`). validate.mjs `[tab]` 차단.
- **부모/형제 레이아웃 미준수** — 부모 Group Height 가 100% 가 아니거나, 같은 레벨에 다른 컨트롤이 있으면 콘텐츠 영역이 깨진다.
- **LinkedStep Step Event 미실행** — 위 "Tab 내부 Step 의 동작 제약" 참조. 데이터 로딩/초기화는 부모 Step Init 에 두고, 탭 전환 시 동작이 필요하면 `Items[].Events.Click` 활용.
- **`DefaultValue` 진입에서도 Step Event 미실행** — 초기 선택된 LinkedStep 의 `Init`/`Loaded` 가 한 번이라도 돌 것이라 가정하지 말 것. 모든 초기 로딩은 부모 Step Init 에서 끝낼 것. `DefaultValue` 와 매칭되는 항목의 `Items[].Events.Click` 도 자동 발화하지 않음(사용자 클릭 시에만).
- **`DefaultValue` 값 불일치** — `Items[].ItemValue` 중 어느 것과도 일치하지 않는 `DefaultValue` 는 운영 메타에서는 첫 항목 fallback 으로 동작하지만 의도치 않은 동작 — AI 생성 시 반드시 일치하는 ItemValue 로.
- **StepButton 미렌더** — LinkedStep 에 BottomButton 정의해도 그려지지 않음. 저장/취소는 LinkedStep 내부 컨트롤로 직접 그릴 것.
- **샘플 데이터 위치** — Tab + LinkedStep 구조의 모든 샘플 데이터(리스트, 필터 등)는 **부모 Step (Tab 이 있는 Step) 의 Init** 에서 한 번에 로딩. LinkedStep 의 Init 에 두면 탭 전환마다 `removeCategory + createCategory` 로 데이터가 초기화된다 (Init 자체가 미실행이므로).
- **서브시나리오 Step 사용 금지** — `LinkedStepId` 에 `StepType: "StepSub"` 인 Step 지정 금지.
- **조상 Group UseMove 금지** — 탭을 감싸는 Group 에 `UseMove:true` 가 있으면 탭 클릭이 Step 이동을 트리거. `[tab-move]` 차단. 위 "부모/형제 제약" 참조.
- **탭 내부 LinkedStep 에 Embed 금지** — Step 이벤트 미실행으로 초기화 시점을 못 잡아 차트/지도 등이 안 뜬다. `[tab-embed]` 차단. 위 "탭 내부 LinkedStep 에는 Embed 컨트롤 금지" 참조.
- 단순 필터 전환에는 RadioBox + `ControlStyle: "styleTab"` 사용 — Tab 컨트롤은 화면 자체가 바뀌는 경우 전용.
