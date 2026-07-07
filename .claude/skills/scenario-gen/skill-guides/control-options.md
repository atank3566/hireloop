# Control Options — 컨트롤별 옵션 매트릭스

> 어떤 컨트롤에 어떤 옵션 키가 허용되는가.
>
> 진실원본: [schema/v1/control/*.schema.json](../schema/v1/control/), [_base.schema.json](../schema/v1/control/_base.schema.json), [design.schema.json](../schema/v1/design-system/design.schema.json).

## ★ 데이터 바인딩 3종 세트 (생성 전 필수 — 가장 자주 빠뜨림)

> 입력/선택 컨트롤이 **값을 저장하거나(`Ckeys`/`SaveValueKey`) 외부 선택지를 쓰면(`DataSourceName`)**, 아래 셋이 **항상 함께** 있어야 한다. 하나라도 빠지면 cross-check 가 막고, 값이 데이터 의존이라 **자동 보정되지 않는다** — 생성 시 직접 채운다. (자가 검증에서 가장 흔히 깨지는 지점. 단순 프로토타입이면 [데이터연결 없이 화면만](#데이터연결-없이-화면만-프로토타입) 참조.)

1. **조상 Group 의 데이터연결** — 컨트롤을 감싸는 Group(또는 상위 Group) 에 `"UseDataConnection": true` + `DataConnection` 객체.
   - 없으면 → `[bind]` "uses SaveValueKey but no ancestor Group has UseDataConnection:true + DataConnection".
2. **`scenario.DataSources` 에 sample 정의** — `DataSourceName` 으로 참조한 **그 이름의 키를 `scenario.DataSources` 에 `Fixed` 또는 `Grid` 로 반드시 생성**. 참조만 하고 정의를 빠뜨리지 않는다.
   - 미정의 참조 → `[dsref]` "DataSourceName='X' is not defined in scenario.DataSources".
   - `SaveValueKey` 를 쓰는데 `scenario.DataSources` 가 통째로 비어있음 → `[proto]` "scenario.DataSources is empty".
   - 운영 타입(`Collection`/`Service`/`API`) 금지 — AI 샘플은 `Fixed`/`Grid` 만 ([data-sources.md](../schema/v1/data-sources.md)).
3. **컨트롤 측 키** — 저장/표시/매핑 키를 컨트롤에 채운다.
   - 입력(InputText/Number/…): `Ckeys` / `SaveValueKey`.
   - 선택(Combo/Search/RadioBox/Tree): `DataSourceName` + 자식의 `DataSourceName` + `CollectionMapper` (UseDataSource:true 면 필수).
   - 날짜(Calendar): `SelectType` 별 페어객체(`SingleDate` / `StartDate`+`EndDate`) 의 **`Ckeys` 를 1개 이상** 채움 — 데이터연결 컨텍스트에서 빈 배열 `[]` 은 `[date]` "must NOT have fewer than 1 items". (비연결이면 `[]` 허용, 단 페어객체 자체는 항상 둘 것.)

**증상 → 빠뜨린 것 빠른 표**

| validate cross-check | 빠뜨린 것 | 고치기 |
|---|---|---|
| `[bind]` | 조상 Group `UseDataConnection`/`DataConnection` | Group 에 데이터연결 부여 (1번) |
| `[dsref]` `is not defined` | `DataSources` 에 그 이름 정의 | 동일 이름 `Fixed`/`Grid` 추가 (2번) |
| `[proto]` `DataSources is empty` | `DataSources` 자체 | 최소 1개 `Fixed`/`Grid` 추가 (2번) |
| `[date]` `fewer than 1 items` | 페어객체 `.Ckeys` 비어있음 | `Ckeys: ["..."]` 채움 (3번) |
| `must have required property 'DataSourceName'` | 자식 ComboList/List 의 `DataSourceName` | 자식에 추가 ([combo](../schema/v1/control/combo.md)/[search](../schema/v1/control/search.md)) |

> ★ **빈 껍데기 컨트롤 금지 (조회 화면).** 조회 화면은 검색조건 Search/Combo 를 여럿 둔다. 각 컨트롤을 `ControlType` 만 있는 골격으로 두면 위 누락들이 **컨트롤 수만큼 곱으로 폭증**한다(Search N개 → ≈4N 에러). **하나를 끝까지 완결한 뒤 복제**하라. materialize 자동 보정은 *본체에 일부 정보가 있을 때만* 작동하고, 정보가 통째로 빈 컨트롤은 손대지 못한다.

> **materialize 가 자동 정규화하는 항목 (직접 신경 안 써도 흡수됨)** — Calendar `SelectType` 어휘(`One`→`SingleDate`), `ScenarioTitle`→`""`, BottomButton 잉여 토글(`UseEvents`/`UseClickEvent`)·`MoveTo='Prev'`→빈 `Prev`·`Next` 슬롯 객체→`""`·`design` expand, Combo 본체→자식 `DataSourceName` 동기화(★ `Ckeys` 는 자식 ComboList/List 에만 두고 본체엔 두지 않음 — `[combo-body-ckeys]`), `DataConnection` shape, `AllowExtensions` 문자열, boolean 문자열. **단 위는 "정보가 있을 때 형태만" 교정** — 없는 데이터(`DataSources` 정의, `CollectionMapper` 매핑값, Search 자식 `DataSourceName`)는 직접 채워야 한다.

### 데이터연결 없이 화면만 (프로토타입)

저장 의도가 없는 순수 표시/레이아웃이면 데이터연결을 만들지 않는다 — 단 **그 Group 에 `"UseDataConnection": false` 를 명시**하고, 컨트롤에서 `SaveValueKey`/`Ckeys`/`DataSourceName` 을 두지 않는다. (Calendar 등 페어객체는 두되 `Ckeys: []`.)

## 모든 컨트롤이 공유 — `controlBase`

`Id` / `ControlType` / `Caption` / `Width` / `Height` / `Padding` / `Margin` / `Ckeys` / `Events` / `DataConnection` / `Maxlength` / `Placeholder` / `DefaultValue` / `design`

## Input 계열이 추가로 공유 — `inputBase`

`InputText` / `InputNumber` / `InputMask` / `InputDate` / `MultiInputBox` / `Combo` / `Search` / `RadioBox` / `CheckBox`:

`CtrlDisplayCkey` / `DisplayValue` / `DisplayType` / `UseValidate` / `UseCondition` / `UseEvents`

## 컨트롤별 고유 옵션

### 입력 — text/number/mask/date

| 컨트롤 | 고유 옵션 |
|---|---|
| `InputText` | `InputType` |
| `InputNumber` | `InputType` |
| `InputMask` | `InputType`, `MaskType`, `UseNumberOnly`, `UseFixedDecimalPlaces`, `DecimalPlaces`, `RoundingMode` |
| `InputDate` | `DateFormat`, `Dialog` |
| `MultiInputBox` | — |

### 선택 — combo/search/radio/check

| 컨트롤 | 고유 옵션 |
|---|---|
| `Combo` | `DataSourceName`, `Dialog` |
| `Search` | `DisplayValue`, `Dialog` |
| `RadioBox` | `Items`, `DataSourceName`, `Direction`, `CategoryName`, `UseDataSource`, `UseCategory`, `UseAlignRight`, `UseDefaultValue`, `UseItemDesign`, `ItemBgStyle`, `ItemDesign`, `SaveNameKey` / `SaveNameName` / `SaveValueKey`, `UniqueKey`, `CollectionMapper`, `AfterScript` |
| `CheckBox` | `CheckBoxType`, `Items`, `SaveValueKey`, `UseAlignRight`, `UseTriming`, `ItemBgStyle` |

### 표시 — label/image/button

| 컨트롤 | 고유 옵션 |
|---|---|
| `Label` | `LabelCKey`, `LabelType`, `labeltext`, `ImageStyle`, `MoveStepOrder`, `MoveSteps`, `UseMove`, `UseClickEvent`, `UseFullShape`, `UseTriming`, `TooltipCKey`, `TooltipText`, `TooltipType` |
| `ImageBox` | `ImageBoxType`, `DefaultViewGroup`, `EditGroup`, `ViewGroup`, `UseDefaultValue`, `UseMultiData` |
| `Button` | `ButtonName`, `ButtonValue`, `ButtonValueCKey`, `ImageStyle`, `UseClickEvent` |

### 복합 — tab/tree/embed/calendar/calendar-navigator/input-file

| 컨트롤 | 고유 옵션 |
|---|---|
| `Tab` | `TabHeader`, `TabHeaderItem`, `SelectTabHeader`, `SelectTabHeaderItem`, `ArrangeItems`, `ArrangeItemsStyle`, `Items`, `ItemName`, `ItemValue`, `LinkedStepId`, `Click` |
| `Tree` | `CategoryName`, `DataSourceName`, `CollectionMapper`, `MapperOrder`, `TreeType`, `NodeId`, `ParentId`, `Title`, `SubTitle`, `Icon`, `SubIcon`, `ThumbNail`, `DCLinkCkey`, `UseDCLink`, `UseExpandAll`, `UseMultiData`, `UseParentAutoSelect`, `UseSearchBar`, `UseSelectAllData` |
| `Embed` | `Embed` |
| `Calendar` | `CalendarType`, `SelectType`, `DayDsKey` |
| `CalendarNavigator` | `NavigatorType`, `NavigatorDateFormat`, `SingleDate`, `StartDate`, `EndDate`, `SelectDay`, `DayArea`, `DayDsKey`, `DaySetting`, `TypeDsKey`, `UseDayArea`, `UseDaySelector`, `UseDaySetting`, `UseTimeTable`, `UseDataConnection`, `OnChangeSwipe`, `ClickPrevNextBtn`, `CalendarNaviEventsOrder` |
| `InputFile` | `Title`, `Description`, `Limit`, `AllowExtensions`, `Directory`, `FileName`, `FolderRoute`, `FlexKey`, `Module`, `Const`, `Attributes`, `SharedTarget`, `InnerCKey`, `ckey`, `CategoryName`, `UseCategory`, `UseClickdownload` |

## 자주 헷갈리는 매핑

| 의도 | 정답 |
|---|---|
| 1000단위 콤마 (금액) | `InputMask` + `InputType:"money"` + `MaskType:"Money"` (★대소문자 정확히 — `money`/`time` 아님; InputType↔MaskType 짝: hhmm↔Time, money↔Money, yyyymmdd↔Date, phone↔Phone) |
| 라벨 표시 종류 (`LabelType`) | 정적 문구 → `LabelType:"labeltext"` + `labeltext:"값"` / 카테고리 필드값 표시 → `LabelType:"LabelCKey"` + `LabelCKey:"키"`. **임의값 금지** (`ckey`/`labelvalue` 등 — 정확값은 `labeltext` 또는 `LabelCKey` 둘뿐) |
| 버튼 클릭 이벤트 | `BottomButton` → `Events:{ "Click":"<핸들러>" }` (★`Events` 안에 — top-level `Click` 아님; 값=`scenario.Events` 핸들러 이름). Step 이동은 `MoveTo:"Next"` + `Next:{ "MoveStepOrder":["StepN"] }` (또는 `Prev`). `Button` 컨트롤 → `UseClickEvent:true` + `Events.Click`. **금지**: top-level `Click`, `ClickEvent`/`SubmitEvent` 임의 키, BottomButton 에 `UseClickEvent` |
| Step 이벤트 키 (`Step.Events`) | 허용 키만: `Init`/`Loaded`/`OnBackLoaded`/`OnLeave`/`OnForeground`/`ScrollEnd` (+`StepEventOrder`). 값은 `scenario.Events` 핸들러 **이름(문자열)** — 임의 키(`SubmitEvent` 등)나 인라인 액션 배열 금지(핸들러 본문은 `scenario.Events` 에) |
| 파일 첨부 (`InputFile`) | `Module` **필수**(기본 `"FlexFile"`; 5종 enum) + Module별 `Attributes` shape (상세 `docs/control/input-file.md`). `AllowExtensions` 는 소문자 확장자 **배열** `["jpg","pdf"]` (콤마 문자열 아님) |
| 날짜 입력 | `InputDate` + `DateFormat` |
| 라벨 문자열 | 컨트롤 본체의 `Caption` |
| 라벨 글자 크기 | `design.caption.text` |
| Group vs Control 분리 | Group 의 `Contents` 배열 아이템 = Control 노드 |
| 이벤트 핸들러 본문 | `scenario.Events` 에 정의 |
| 비연결 Group 명시 | 모든 Group 에 `UseDataConnection: false` 도 명시(생략 금지, `[group-dc]`) → 상세 `group.md` "함정" |
| 날짜 캘린더 Ckeys | 아래 "Calendar — SelectType / Ckeys 결정표" 참조 (페어 객체는 항상, `Ckeys` 채움만 조건부) |

## Calendar — SelectType / 페어객체 / Ckeys / 데이터연결 결정표

`Calendar`(InputDate 자식 또는 단독)의 `SelectType` 별 필수 구조. **페어 객체(`SingleDate`/`StartDate`/`EndDate`)는 항상 필수이고, `Ckeys` 를 채우느냐만 데이터연결 컨텍스트에 따라 갈린다** (`[date]` cross-check = `core/validators.mjs` checkInputDateConsistency).

| SelectType | 필수 페어 객체 | Ckeys — 조상 Group `UseDataConnection:true` | Ckeys — 비연결(프로토타이핑) |
|---|---|---|---|
| `SingleDate` | `SingleDate` (항상) | `["..."]` 1개 이상 필수 | `[]` 허용 |
| `FromTo` (dayCalendar 전용) | `StartDate` + `EndDate` (둘 다 항상) | 각 `["..."]` 1개 이상 | 각 `[]` 허용 |

- `monthCalendar` / `yearCalendar` → `SelectType` 은 `SingleDate` 만.
- `SingleDate: {}` 빈 객체 금지 — `Ckeys` 키는 항상 두되 값만 `[]` / `["..."]` (런타임 `dlgJson.SingleDate.Ckeys` 접근 안전).
- 상세: `schema/v1/control/calendar.md`, `schema/v1/control/input-date.md`.

## Combo / Search / InputDate 의 Dialog 호스트

| 본체 | Dialog 자식 |
|---|---|
| `Combo` | `ComboList` |
| `Search` | `List` |
| `InputDate` | `Calendar` |
