# RadioBox

라디오 그룹. Fixed `Items` 또는 외부 `DataSource` 두 가지 데이터 소스. `styleTab` 으로 탭 형태 UI 도 가능.

## 스키마

`control/radio-box.schema.json` — `controlBase` + 분기 키 (`ControlType="RadioBox"`, `Items` / `DataSourceName`, `SaveNameKey`/`SaveValueKey`, `ControlStyle`, `Direction`, `UseDataSource`, `UseItemDesign`/`ItemDesign`).

## 예시 — Fixed Items

```jsonc
{
  "ControlType": "RadioBox",
  "ControlStyle": "None",
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "MatchText": true, "SizeValue": "" },
  "ControlDefaultName": "RadioBox1",
  "ControlName2": "RadioBox1",
  "Caption": "{{선택 항목}}",
  "Id": "f_45",
  "Ckeys": ["SelectedValue", "SelectedName"],
  "SaveNameKey": "SelectedName",
  "SaveValueKey": "SelectedValue",
  "Items": [
    { "ItemName": "{{옵션1}}", "ItemValue": "1" },
    { "ItemName": "{{옵션2}}", "ItemValue": "2" },
    { "ItemName": "{{옵션3}}", "ItemValue": "3" }
  ],
  "UseDataSource": false,
  "DefaultValue": "{{옵션1}}",
  "isColumnCtrl": false
}
```

> `DefaultValue` 는 **표시명(RadioBoxItem명) 기준** 문자열. Fixed 모드면 `Items[*].ItemName` 과 매칭, DataSource 모드면 `CollectionMapper` 의 `ItemName` 매핑 대상 필드 값과 매칭. `ItemValue` 가 아님에 유의.

## 예시 — DataSource

```jsonc
{
  "ControlType": "RadioBox",
  "Ckeys": ["DeptCode", "DeptName"],
  "UseDataSource": true,
  "DataSourceName": "DeptListDS",
  "CollectionMapper": {
    "DeptCode": "ItemValue",
    "DeptName": "ItemName"
  },
  "SaveValueKey": "DeptCode",
  "ControlDefaultName": "RadioDept",
  "ControlName2": "RadioDept",
  "Id": "f_46",
  "isColumnCtrl": false
}
```

## 예시 — styleTab (탭 형태)

탭 전환 시 같은 리스트/데이터를 필터링만 하는 경우 Tab 컨트롤 대신 RadioBox 에 `styleTab` 적용.

```jsonc
{
  "ControlType": "RadioBox",
  "ControlStyle": "styleTab",
  "Items": [
    { "ItemName": "{{내 결재}}", "ItemValue": "MY" },
    { "ItemName": "{{내 신청}}", "ItemValue": "REQ" }
  ],
  "Ckeys": ["TabValue"],
  "SaveValueKey": "TabValue",
  "Direction": "horizontal",
  "ControlDefaultName": "TabRadio",
  "ControlName2": "TabRadio",
  "Id": "f_47",
  "isColumnCtrl": false,
  "UseEvents": true,
  "Events": {
    "ContentEvent": ["Click"],
    "Click": "ON_TAB_CHANGED"
  }
}
```

## 제한값

### `ControlStyle`
스키마 enum 으로 강제.

| 값 | 외형 / 용도 |
|---|---|
| `""` / `"None"` | 기본 라디오 |
| `"styleRectangle"` | 사각 카드 라디오 (`UseItemDesign` 과 함께) |
| `"styleTab"` | 탭 형태 — 필터/뷰 전환 |
| `"stylePeriod"` | 기간 선택형 |
| `"styleRadius"` | 라운드 |

### 조건부 강제 (스키마 if/then)

- `UseDataSource=true` → `DataSourceName` 필수.
- `UseItemDesign=true` → `ItemDesign` 필수.
- `UseDataSource=true` → `SaveNameKey` / `SaveNameName` 사용 금지 (Fixed 모드 전용 키). DataSource 모드의 표시명은 `CollectionMapper` 로 매핑.

## DataSource vs Items

★ `UseDataSource` 런타임 default = **false** ([property-data.js:8818](public/javascripts/scenario-studio/property-data.js#L8818)) — 스키마에도 `"default": false` 박힘. ComboList(default=true)와 비대칭이니 헷갈리지 말 것.

| 모드 | 키 | UseDataSource |
|---|---|---|
| Fixed | `Items` + `Ckeys` + `SaveNameKey` + `SaveValueKey` (**셋 다 필수** — 고정데이터라고 생략 금지) | 생략 가능 (default=false). 명시한다면 `false`. |
| External | `DataSourceName` + `CollectionMapper` (표시명은 mapper 안 `ItemName`/`ItemValue` 키로 매핑 — `SaveNameKey` / `SaveNameName` 사용 금지) | `true` 명시 필수 (스키마 if/then 으로 강제). |

> ★ **고정데이터(`UseDataSource:false`)도 `Ckeys`/`SaveNameKey`/`SaveValueKey` 를 무조건 채운다.** 엔진이 `SaveNameKey`/`SaveValueKey` 로 선택 항목의 표시명/값을 Ckeys 에 저장한다 ([radiobox.js:380-381](public/engine/control/radiobox.js#L380-L381)) — 누락 시 선택해도 저장 안 됨. 단 `CtrlDisplayCkey` 는 **RadioBox 엔진이 사용하지 않으므로 넣지 않는다** (Combo/Search 본체 전용). 자세히는 [rules.md §5.5.1](../../../rules.md#551-고정데이터-컨트롤의-저장-키-필수-ckeys--savenamekey--savevaluekey).

스튜디오 패널은 `controlMeta.UseDataSource` truthy 검사로 분기 ([studio-panel-cat.js:1129](public/javascripts/scenario-studio/studio-panel-cat.js#L1129)) — 운영 메타에 문자열 `"true"` 가 있으면 truthy 라 동작하지만 `"false"` 는 JS truthy 라 의도와 반대로 DataSource 모드로 인식되는 코드 경로가 있다. **AI 생성에는 boolean 만**.

`CollectionMapper` 는 외부 데이터 필드를 `ItemName` / `ItemValue` 로 매핑:
```jsonc
"CollectionMapper": {
  "ItemName": "원본필드명",
  "ItemValue": "원본키필드"
}
```

또는 Ckeys 직접 매핑 형태도 사용:
```jsonc
"CollectionMapper": {
  "DeptCode": "ItemValue",
  "DeptName": "ItemName"
}
```

## 이벤트 (제한)

EventOrder 키 없이 `Click` 핸들러 직접. `Events` 는 `_base.schema.json#/$defs/directClickEvents`.

```jsonc
{
  "UseEvents": true,
  "Events": { "Click": "ON_TAB_CHANGED" }
}
```

`Click` — 선택이 변경되면 발화.

## 함정

- `SaveValueKey` 누락 시 저장 동작 안 함.
- `styleRectangle` 은 `UseItemDesign: true` + `ItemDesign` 과 함께 써야 카드 디자인 적용.
- 외부 데이터인데 `UseDataSource: false` 또는 `DataSourceName` 누락 → 항목 안 보임.
- `Ckeys` 사용 시 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 필요.
