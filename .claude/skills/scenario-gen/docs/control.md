# Control (인덱스)

화면의 입력/표시 단위. v1 명시 범위는 입력류 12종 + 특수/컨테이너 5종(`Calendar`, `CalendarNavigator`, `Tab`, `Tree`, `Embed`) = 본체 17종 (Dialog 자식 전용 `ComboList`/`List` 별도), 폴더 안에 컨트롤별로 정의가 분리되어 있다. 진실원본은 `catalog.json` 의 `controlTypes`.

## 컨트롤 목록 (v1)

| ControlType | 스키마 | 문서 | 자식 트리 |
|---|---|---|---|
| `InputText` | [control/input-text.schema.json](control/input-text.schema.json) | [input-text.md](control/input-text.md) | — |
| `InputNumber` | [control/input-number.schema.json](control/input-number.schema.json) | [input-number.md](control/input-number.md) | — |
| `InputMask` | [control/input-mask.schema.json](control/input-mask.schema.json) | [input-mask.md](control/input-mask.md) | — |
| `InputDate` | [control/input-date.schema.json](control/input-date.schema.json) | [input-date.md](control/input-date.md) | `Dialog…Calendar` |
| `MultiInputBox` | [control/multi-input-box.schema.json](control/multi-input-box.schema.json) | [multi-input-box.md](control/multi-input-box.md) | — |
| `Combo` | [control/combo.schema.json](control/combo.schema.json) | [combo.md](control/combo.md) | `Dialog…ComboList` |
| `Search` | [control/search.schema.json](control/search.schema.json) | [search.md](control/search.md) | `Dialog…List` |
| `CheckBox` | [control/check-box.schema.json](control/check-box.schema.json) | [check-box.md](control/check-box.md) | — |
| `RadioBox` | [control/radio-box.schema.json](control/radio-box.schema.json) | [radio-box.md](control/radio-box.md) | — |
| `Label` | [control/label.schema.json](control/label.schema.json) | [label.md](control/label.md) | — |
| `ImageBox` | [control/image-box.schema.json](control/image-box.schema.json) | [image-box.md](control/image-box.md) | — (ViewGroup / EditGroup 인라인) |
| `InputFile` | [control/input-file.schema.json](control/input-file.schema.json) | [input-file.md](control/input-file.md) | — |
| `Button` | [control/button.schema.json](control/button.schema.json) | [button.md](control/button.md) | — |
| `Calendar` | [control/calendar.schema.json](control/calendar.schema.json) | [calendar.md](control/calendar.md) | — (InputDate 자식 또는 Group 직접 자식 단독) |
| `CalendarNavigator` | [control/calendar-navigator.schema.json](control/calendar-navigator.schema.json) | [calendar-navigator.md](control/calendar-navigator.md) | — |
| `Tab` | [control/tab.schema.json](control/tab.schema.json) | [tab.md](control/tab.md) | `Tabs[*].Layouts[*]` |
| `Tree` | [control/tree.schema.json](control/tree.schema.json) | [tree.md](control/tree.md) | — |
| `Embed` | [control/embed.schema.json](control/embed.schema.json) | [embed.md](control/embed.md) | — |

[control.schema.json](control.schema.json) 은 디스패처 (oneOf + 위 18종 + `OtherControl` fallback). [control/_base.schema.json](control/_base.schema.json) 에 공통 `controlBase` / `inputBase` / `dialogLayout` / `calendarControl` / `imageBoxViewGroup` / `imageBoxEditGroup` $defs.

## 식별 규칙 (모든 컨트롤 공통)

- 키: `Id` 형식 **`^f_[1-9][0-9]*$`** — `f_` + 1 이상 양의 정수. `f_0` / `f_01` / `f_abc` 불가.
- **시나리오 전체 유일** — Group / Control / BottomButton / 자식 Calendar 의 Id 가 한 시나리오 안에서 중복 금지 (validate.mjs 후검증).
- discriminator: `ControlType` (catalog.json `controlTypes[].value`).

## 공통 필드 (controlBase)

[control/_base.schema.json#/$defs/controlBase](control/_base.schema.json) 참조.

| 키 | 비고 |
|---|---|
| `Id` | 🔴 |
| `ControlType` | 🔴 |
| `ControlDefaultName` | AI 생성 시 필수 |
| `ControlName2` | **AI 생성 시 필수, ControlDefaultName 과 같은 값**. 누락 시 런타임 에러. |
| `ControlName` | 탐색기 표시명 (선택) |
| `Caption` | Input 계열: `{{필드명}}` 또는 `""`. Label: 내부명(=ControlDefaultName). |
| `ControlStyle` | 스타일 식별자 |
| `ControlKey` | `""` \| `"Required"` \| `"ReadOnly"` \| `"Hide"` \| `"Disabled"` |
| `DataName` | 데이터 바인딩 키 |
| `DefaultValue` | 초기값 |
| `Placeholder` | 힌트 |
| `Maxlength` | 최대 길이 |
| `Ckeys` | string[] — 컬렉션 필드 바인딩 |
| `SaveValueKey` | string — Combo/Search 에서 선택 후 저장할 주값 필드명 (`Ckeys` 중 하나). InputText 등 단일 값 컨트롤도 지원. 사용 시 조상 Group 의 DataConnection 필수 (`Ckeys` 와 동일 규칙) |
| `isColumnCtrl` | **`const false`** — v1 컨트롤은 항상 false 강제 (Sheet 컬럼 모드는 OtherControl) |
| `Width`, `Height` | sizeObject |
| `FontStyle`, `BorderStyle`, `BgStyle`, `CaptionStyle` | 스타일 객체 |
| `Padding`, `Margin` | spacing |
| `Events` | 이벤트 핸들러 맵 (UseEvents / UseClickEvent 와 함께) |
| `LoadScript` | 컴포넌트 로드 직전 실행 |
| `UseAbsoluteLayout` + `AbsolutePosition` | 절대 위치 오버레이 |
| `UseFixedSize` | 부모 Flex 안 고정 크기 |

> **데이터 바인딩 규칙**: `Ckeys` / `SaveValueKey` 사용 컨트롤(`InputText` / `InputNumber` / `InputMask` / `InputDate` / `MultiInputBox` / `Combo` / `Search` / `CheckBox` / `RadioBox` / `Label` `LabelCKey` / `Button` `ButtonValueCKey`)은 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 이 반드시 있어야 한다. 직접 부모가 아닌 조상 Group 이어도 바인딩 동작.

## 입력 공통 필드 (inputBase, InputText / InputNumber / InputMask / InputDate / MultiInputBox / Combo / Search)

[control/_base.schema.json#/$defs/inputBase](control/_base.schema.json) 참조.

| 키 | 비고 |
|---|---|
| `UseEvents` | 이벤트 사용 여부. `Events.InputEventOrder` + 핸들러 명과 함께. |
| `DisplayValue` | 표시용 포맷 값 (money / Date 등). |
| `UseValidate` | 내장 검증 사용. |

지원 이벤트: `change`, `focusin`, `focusout`, `input`. (Sheet 셀 컨트롤에서는 `dblClick` 추가.)

## ControlKey 상태 (제한)

스키마 enum 으로 강제. LoadScript 동적 변경 시 약어(`'hid'`/`'dis'`) 통용.

| 값 | 동작 | 사용 위치 |
|---|---|---|
| `""` | 정상 | meta + LoadScript |
| `"Required"` | 필수 입력 — 런타임 자동 검증 | meta 만 (LoadScript 동적 변경 불가) |
| `"ReadOnly"` | 읽기 전용 | meta + LoadScript |
| `"Hide"` / `"hid"` | 숨김 | meta(`Hide`) + LoadScript(`hid`) |
| `"Disabled"` / `"dis"` | 비활성 | meta(`Disabled`) + LoadScript(`dis`) |

> **CRITICAL**: 필수 입력은 `"ControlKey": "Required"` 로 처리. 수동 검증 Script 작성 금지 — 런타임이 BottomButton Step 이동 시 자동 검증. Script 기반 저장이면 `f.checkRequired()` 사용.

## v1 외 ControlType (OtherControl fallback)

[control/other.schema.json](control/other.schema.json) — `Id` + `ControlType` 만 강제, 나머지는 `additionalProperties: true` 로 통과.

해당 컨트롤: `InputBox`, `Sheet`, `TimeTable`, `Approval`, `Scheduler`, `Image`, `ComboList`(단독), `List`(단독), `Signature`, `Line` 등. 상세 schema 는 v2 후속.

> `Calendar` 는 단독 사용도 자체 schema 분기로 빠져 있다 — [control/calendar.schema.json](control/calendar.schema.json) 참고 (`Calendar` standalone 은 OtherControl 이 아님).

## ★ AI 샘플 생성 금지 키 (CRITICAL)

AI 가 시나리오 메타를 생성할 때 **아래 키들은 생성하지 말 것**. 모두 사용자 수동 설정 / 운영 사후 설정 / PC 전용 등의 사유로 자동 생성에 적합하지 않음. 운영 메타에는 잔존할 수 있어 schema 자체는 통과시키되, validate.mjs 가 `AI_GEN_STRICT=1` 환경변수 시 `[ai-gen]` 태그로 차단.

| 적용 범위 | 금지 키 | 사유 |
|---|---|---|
| 모든 Control + Group (Size 최소/최대) | `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | 사용자 수동 설정 — AI 가 추측할 근거 없음 |
| 모든 Control (FontStyle 자간) | `FontStyle.LetterSpacing` | 사용자 수동 미세 조정 전용 |
| `Label` | `UseFullShape` / `UseTriming` | 사용자 수동 설정 |
| `Label` | `TooltipType` / `TooltipText` / `TooltipCKey` | **PC 전용** — 모바일 시나리오 생성 시 부적합 (label.schema.json 에서 `not.anyOf.required` 로 schema 차단 병행) |
| `ImageBox` (View 모드) | `DefaultViewGroup` | 운영 사후 설정 — placeholder 이미지 경로는 AI 가 추측 금지 |
| 데이터 연결고리 (Calendar 내부 / List 내부 / Tree) | `UseDCLink` / `DCLinkCkey` | 운영 메타 잔존 필드 — 부모-자식 카테고리 매핑은 사용자 수동 설정 |

> **schema 비등재 키**: `properties` 에 아예 등재하지 않은 키는 별도 정책 표가 필요 없다. 스킬 생성의 `strict_fields`(항상 ON) 가 `additionalProperties: true` 를 false 로 뒤집어 자동 reject. (운영 메타 호환을 위해 CLI 기본 경로는 통과시키지만, AI 생성 결과는 strict 검증을 쓰므로 무관.)

### 적용 방식 (3-Tier)

| Tier | 적용 키 | 메커니즘 |
|---|---|---|
| **Hard block (schema)** | Tooltip 3종 | `label.schema.json` 의 `not.anyOf.required` — 스키마 차원에서 차단. 운영 메타에도 등장 금지. |
| **Soft guide (description + cross-check)** | 나머지 모든 키 | 각 schema 의 description 에 "★ AI 생성 시 미포함" 마커 + cross-check `checkAiGenerationForbidden` 가 `[ai-gen]` 태그로 보고. |

### 실행 경로별 차이

| 경로 | 모드 | 비고 |
|---|---|---|
| **스킬 생성** (`flex-scenario validate`) | **항상 strict — 토글 불가** | AI 생성 경로 전용이라 env 게이트 없이 무조건 차단. opts 토글도 없음 (`runAllCrossChecks` 가 `'ai-gen'` 키를 무조건 채움). |
| **운영 메타 검증** (`node validate.mjs ...`) | env 게이트 `AI_GEN_STRICT=1` | 운영 메타 검증과 AI 생성 결과 검증을 동일 도구로 처리하기 위해 env 토글 유지. 기본 OFF — 운영 메타는 통과. |

### 사용 예

```bash
# CLI — 운영 메타 검증 (기본 — AI 금지 키 무시)
node meta-contract/validate.mjs scenario.json

# CLI — AI 생성 결과 검증 (금지 키 차단)
AI_GEN_STRICT=1 node meta-contract/validate.mjs ai-generated.json

# 스킬 생성 — flex-scenario validate (항상 strict, 별도 옵션 없음)
# flex-scenario validate <file>  → errors[].'ai-gen' 자동 포함
```

> **단일 진실원본**: 본 표가 AI 금지 키의 단일 진실원본. 새 금지 키를 추가하려면 ① 해당 schema description 에 "★ AI 생성 시 미포함" 마커 추가, ② 본 표 갱신, ③ `validate.mjs` 의 `AI_GEN_FORBIDDEN_KEYS_*` 상수 갱신 — 3 곳을 함께 손봐야 정합성 유지.

## Caption 규칙

- **Input 컨트롤**: 필드명 필요시 `"{{필드명}}"` (다국어), 맥락상 명확하면 `""`.
- **Label**: Caption 은 내부명 (=`ControlDefaultName`). 화면 표시 텍스트는 `labeltext` 또는 `LabelCKey`.

`CaptionStyle.CaptionPosition`:
- `""` — 스타일이 캡션 자체 렌더 (`styleInputValueLine` 기본)
- `"Left"` — 옆
- `"Top"` — 위 (row 레이아웃)

## 키별 입력값 제한 요약

| 컨트롤 | 키 | 제한 |
|---|---|---|
| 모든 v1 컨트롤 | `isColumnCtrl` | `const false` |
| `InputText` | `InputType` | enum `text` / `password` / `number` / `email` / `tel` |
| `InputNumber` | `InputType` | enum `number` / `decimal` / `password`. 1000단위 콤마(금액) 는 `InputMask` + `InputType:"money"` 사용 |
| `InputMask` | `InputType` | enum `hhmm` / `money` / `yyyymmdd` / `phone` |
| `InputMask` | `MaskType` | enum `Time` / `Money` / `Date` / `Phone` |
| `InputDate` | `DateFormat` | enum `""` / `YYYY-MM-DD` / `YYYY.MM.DD` / `YYYY/MM/DD` / `YYYY-MM` |
| `InputDate.Dialog…Calendar` | `ControlType` | const `Calendar` |
| `InputDate.Dialog…Calendar` | `CalendarType` | enum `dayCalendar` / `monthCalendar` / `yearCalendar` |
| `InputDate.Dialog…Calendar` | `SelectType` | enum `SingleDate` / `FromTo` (FromTo 는 dayCalendar 전용) |
| `Combo.Dialog…ComboList` | `ControlType` | const `ComboList` |
| `Combo.Dialog…ComboList` | `DlgCtrlType` | const `Common` |
| `Search.Dialog…List` | `ControlType` | const `List` |
| `Search.Dialog…List` | `DataSourceName` | required (Search 의 List 는 항상 DataSource 기반) |
| `CheckBox` | `ControlStyle` | enum `""` / `None` / `styleSquare` / `styleCircle` / `styleCircleGray` / `styleSwitch` / `styleIconHeart` / `styleRadius` |
| `CheckBox` | `Items` | required, minItems 1 |
| `CheckBox` | `DefaultValue` | **boolean strict** (`true`/`false` 만), 기본 `false` — 문자열 `"true"`/`"false"` 금지 (JS truthy 함정) |
| `RadioBox` | `ControlStyle` | enum `""` / `None` / `styleRectangle` / `styleTab` / `stylePeriod` / `styleRadius` |
| `Label` | `LabelType` | enum `labeltext` / `LabelCKey` |
| `ImageBox` | `ImageBoxType` | enum `View` / `Edit` |
| `ImageBox.ViewGroup` | `ImageSrcType` | enum `FlexFile` / `Url` / `Base64` / `Upload` |
| `ImageBox.EditGroup` | `ImageSrcType` | const `FlexFile` (Module=`FlexFile` 고정) |

## 이벤트 등록 표 (system-prompt-v2 §7.7 + 실 샘플 기반 강제)

각 컨트롤은 정해진 EventOrder 키 + 정해진 이벤트 집합만 받는다. **컨트롤 종류에 따라 가능한 이벤트가 다르며**, EventOrder 배열에 이벤트를 등록하면 **동명 핸들러 키가 필수**(schema if/then 강제).

스키마 분기:
- `inputEventsFull` — InputText / MultiInputBox (4종 input 이벤트)
- `inputEventsChangeOnly` — InputNumber / InputMask (`change` 만)
- `dateEvents` — InputDate 의 자식 Calendar
- `comboEvents` — Combo 의 자식 ComboList
- `searchEvents` — Search 의 자식 List
- `checkBoxEvents` — CheckBox
- `directClickEvents` — RadioBox
- `labelEvents` — Label
- `buttonEvents` — Button
- `groupEvents` — Group
- `imageBoxEvents` — ImageBox (`ImageEventOrder` + `Click`)
- `inputFileEvents` — InputFile (`InputFileOrder` + `change`)

| 컨트롤 | EventOrder 키 | 지원 이벤트 | 위치 |
|---|---|---|---|
| `Group` | `ContentEvent` | `Click` / `ScrollEnd` | Group 본체 |
| `InputText` | `InputEventOrder` | `change` / `input` / `focusin` / `focusout` | 본체 |
| `MultiInputBox` | `InputEventOrder` | `change` / `input` / `focusin` / `focusout` | 본체 |
| `InputNumber` | `InputEventOrder` | **`change` 만** | 본체 |
| `InputMask` | `InputEventOrder` | **`change` 만** | 본체 |
| `InputDate` | `DateOrder` | `DialogClose` | **자식 Calendar** |
| `Combo` | `ComboOrder` | `change` / `DialogClose` | **자식 ComboList** |
| `Search` | `SearchOrder` | `change` / `Delete` / `DialogClose` | **자식 List** |
| `CheckBox` | `CheckBoxOrder` (선택) | `Click` | 본체 |
| `RadioBox` | (없음 — 직접) | `Click` | 본체 |
| `Label` | (없음 — 직접) | `Click` | 본체 (`UseClickEvent`+`Events.Click`) |
| `Button` | (없음 — 직접) | `Click` | 본체 (`UseClickEvent`+`Events.Click`) |
| `ImageBox` | `ImageEventOrder` | `Click` | 본체 |
| `InputFile` | `InputFileOrder` | `change` | 본체 |

> **CRITICAL — Dialog 컨트롤 이벤트 위치 (Combo / Search / InputDate):** `UseEvents` / `Events` 는 본체가 아니라 **`Dialog.Layouts[0].Controls[0]`** 안에 둬야 한다. 본체에 두면 [event] cross-check 로 차단.

### EventOrder ↔ 핸들러 일치 (schema if/then 강제)

EventOrder 배열에 이벤트를 등록하면 **동명 키의 핸들러가 반드시 존재**해야 한다. 예:

```jsonc
{ "InputEventOrder": ["change", "input"], "change": "E1", "input": "E2" }   // OK
{ "InputEventOrder": ["change", "input"], "change": "E1" }                  // FAIL: input 핸들러 누락
```

### 입력 이벤트 의미 (소문자 — 런타임 규약)

- `change` — 입력 완료 (Enter 키 포함). 검색 필드 + 단일 입력은 `change` 권장.
- `input` — 키 입력마다 (실시간 필터링용). InputText / MultiInputBox 만.
- `focusin` / `focusout` — 포커스 변경. InputText / MultiInputBox 만.

> system-prompt §7.7 표는 PascalCase(`FocusIn`/`FocusOut`)로 표기되어 있으나, 런타임 메타는 모두 **소문자** 사용 — 실 샘플 기준으로 소문자 enum 강제.

## 조건부 강제 (schema `if/then` + validate.mjs 후검증)
- `Calendar.SelectType="SingleDate"` → `SingleDate` 객체 필수
- `Calendar.SelectType="FromTo"` → `StartDate` + `EndDate` 객체 필수
- `Calendar.CalendarType ∈ {monthCalendar, yearCalendar}` → `SelectType="SingleDate"` 만 허용
- `InputDate.DateFormat="YYYY-MM"` ↔ 자식 `Calendar.CalendarType="monthCalendar"` (validate.mjs 후검증)
- `ComboList.UseDataSource=true` → `DataSourceName` 필수
- `List.UseKeywordSearch=true` → `KeywordSearchCkey` 필수
- `RadioBox.UseDataSource=true` → `DataSourceName` 필수
- `RadioBox.UseItemDesign=true` → `ItemDesign` 필수
- `Label.LabelType="labeltext"` → `labeltext` 필수
- `Label.LabelType="LabelCKey"` → `LabelCKey` 필수
- `Label.UseMove=true` → `MoveSteps` 필수
- `Button.UseClickEvent=true` → `Events.Click` 필수
- `Button` 은 `UseMove` / `MoveSteps` 미지원 — `property-data.js` `button()` 진실원본에 없는 키. **AI 생성 시 두지 말 것**. (운영 메타 잔존 호환을 위해 스키마는 미정의 통과.)
- `ImageBox.ImageBoxType="View"` → `ViewGroup` 필수
- `ImageBox.ImageBoxType="Edit"` → `ViewGroup` + `EditGroup` 둘 다 필수
- `ImageBox.ViewGroup.ImageSrcType="FlexFile"` → `FlexKey` + `ckey` 필수
- `ImageBox.ViewGroup.ImageSrcType ∈ {Url, Base64}` → `ImageUrl` 필수
- `InputFile.Attributes.UseCategory=true` → `Attributes.CategoryName` 필수
- `Combo` / `Search` / `InputDate` 본체에 `UseEvents` / `Events` 두지 않음 — 자식 Dialog 컨트롤에만 (validate.mjs `[event]` cross-check)

## 공통 함정

- `ControlName2` 누락 = 런타임 에러. `ControlDefaultName` 과 같은 값으로 함께 작성.
- `isColumnCtrl: false` 항상 명시.
- Input 컨트롤은 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 필요.
- `InputDate` 의 `CalendarType` / `SelectType` 은 본체가 아니라 **자식 Calendar 컨트롤** 에 위치.
- `Label` 의 `labeltext` 안에서는 `Load.sector` 사용 불가 — `{=Field}` 만.
- `Combo` / `Search` 의 ComboList/List `Title` 은 **원본 데이터 필드명** (Fixed=`ItemName`, Collection=원본 Ckey, Service=서비스 반환 필드).
- `Combo` / `Search` 의 본체에 `Events` 두지 않음 — 자식 ComboList/List 안에 둠.
