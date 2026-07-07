# Combo

드롭다운 선택. **자식 트리 보유** (`Dialog.Layouts[*].Controls[*]` = ComboList).

## 사용 기준 (vs Search)

- **Combo**: 선택 항목 **8개 이하** + 늘어나지 않는 **고정 목록**. (상태/유형/등급/업종 등)
- **Search**: 항목 8개 초과 또는 동적으로 늘어나는 데이터 (고객/사용자/거래처 등).
- 판단 기준: DataSource = `Fixed` (인라인 Items) → **Combo**, `Collection`/`Service` → **Search**.

## ★ 필수 체크리스트 (생성 전 반드시 확인)

> 모델이 가장 자주 빠뜨리는 항목 — **하나라도 누락 시 schema 에러(`CollectionMapper` 필수) 또는 런타임 빈 콤보**. 자동 보정되지 않으므로(값이 데이터 의존) 생성 시 직접 채운다.
>
> ★ **골격만 만들지 말 것** — 여러 Combo/Search 를 둘 때 각각을 `ControlType` 만 있는 빈 껍데기로 두면 같은 누락이 컨트롤 수만큼 곱으로 폭증한다. 하나를 끝까지 완결(본체 `DataSourceName`+`CtrlDisplayCkey`, 자식 ComboList `Ckeys`+`DataSourceName`+`CollectionMapper`, `scenario.DataSources` 정의)한 뒤 복제하라. (본체 `DataSourceName` 은 materialize 가 자식으로 동기화하지만, 본체조차 비면 보정 불가.) ★ **본체(Dialog 밖)에는 `Ckeys` 를 두지 않는다** — `Ckeys` 는 자식 ComboList 의 속성이다 (`[combo-body-ckeys]`).

**공통 (Fixed·DataSource 모두)**
1. ★ 본체(Dialog 밖)에는 **`Ckeys` 를 두지 않는다** — `Ckeys` 는 자식 ComboList 의 속성이다 (`[combo-body-ckeys]`). 스튜디오 속성 패널에도 본체 Ckeys 입력이 없다(`property-data.js` `createDataSection` 은 `ComboList` 만 등록).
2. 본체 `CtrlDisplayCkey` (또는 비어있지 않은 `DisplayValue:"{=표시Ckey}"`) — 선택 후 표시. 비우면 빈 칸 (`[display-key]`). **고정모드도 예외 없음**.
3. 자식 ComboList `Ckeys: [값키, 표시키]` — value 키 + name 키 **둘 다**.
4. 자식 `SaveValueKey`(값)/`SaveNameKey`(표시) = 저장될 **컬렉션키**(자식 `Ckeys` 중 하나) (`[combo-fixed]`). Items 내부 필드명(`ItemValue`/`ItemName`)을 SaveKey 로 직접 쓰지 말 것 — Items 는 `ItemValue`/`ItemName` 고정 필드이고 런타임이 `ItemValue→SaveValueKey`·`ItemName→SaveNameKey` 로 반영한다. **Fixed 모드엔 `CollectionMapper` 불필요** (DataSource 모드 전용).

**DataSource 모드 (`Collection`/`Service`)** — 자식 ComboList 에 추가:
5. `UseDataSource: true` + `DataSourceName`.
6. `CollectionMapper: { 대상Ckey: 원본필드, ... }` — 콜렉션키 ↔ DataSource 필드 매핑. **`UseDataSource:true` 면 필수** (minProperties ≥ 1). 누락하면 schema 가 막는다 — 비울 수 없다.

**Fixed 모드 (8개 이하 고정)** — 자식 ComboList 에:
7. `UseDataSource: false` + 인라인 `Items: [{ItemName, ItemValue}, ...]`. (누락 시 materialize 가 `Items` 존재를 보고 `false` 로 보정하지만, 명시 권장.)

## 스키마

`control/combo.schema.json` — `controlBase` + `inputBase` + 분기 키 (`ControlType="Combo"`, `DataSourceName`, `Dialog`).

내부 ComboList 는 `_base.schema.json#/$defs/comboListControl` 가 `dialogLayout` 의 if/then 으로 자동 적용.

## 예시 — Fixed Items (인라인 선택지)

```jsonc
{
  "ControlType": "Combo",
  "ControlStyle": "styleInputValueLine",
  "ControlDefaultName": "StatusCombo",
  "ControlName2": "StatusCombo",
  "Caption": "상태",
  "Placeholder": "선택하세요",
  "Id": "f_50",
  "DisplayType": "CtrlDisplayCkey",
  "CtrlDisplayCkey": "StatusName",
  "isColumnCtrl": false,
  "Dialog": {
    "Layouts": [{
      "ContentsType": "Layout",
      "Controls": [{
        "Id": "f_51",
        "ControlType": "ComboList",
        "DlgCtrlType": "Common",
        "Title": "ItemName",
        "Ckeys": ["StatusCode", "StatusName"],
        "SaveValueKey": "StatusCode",
        "SaveNameKey": "StatusName",
        "Items": [
          { "ItemValue": "P", "ItemName": "대기" },
          { "ItemValue": "I", "ItemName": "진행" },
          { "ItemValue": "C", "ItemName": "완료" }
        ],
        "UseDataSource": false,
        "UseEmptyRow": false,
        "UseFirstRow": false,
        "isColumnCtrl": false
      }]
    }]
  }
}
```

## 예시 — DataSource (외부 데이터)

```jsonc
{
  "ControlType": "Combo",
  "CtrlDisplayCkey": "DeptName",
  "DataSourceName": "MyDeptDS",
  "Dialog": {
    "Layouts": [{
      "Controls": [{
        "Id": "f_52",
        "ControlType": "ComboList",
        "DlgCtrlType": "Common",
        "Title": "ItemName",
        "Ckeys": ["DeptCode", "DeptName"],
        "DataSourceName": "MyDeptDS",
        "UseDataSource": true,
        "CollectionMapper": {
          "DeptCode": "ItemValue",
          "DeptName": "ItemName"
        },
        "SaveNameKey": "DeptName",
        "SaveValueKey": "DeptCode",
        "UseEmptyRow": true,
        "EmptyRowName": "선택없음",
        "isColumnCtrl": false
      }]
    }]
  }
}
```

## ComboList 제한값

| 키 | 제한 |
|---|---|
| `ControlType` | const `ComboList` |
| `DlgCtrlType` | const `Common` |
| `isColumnCtrl` | const `false` |

조건부 강제:
- `UseDataSource=true` → `DataSourceName` 필수.

## Combo + ComboList 정합 규칙

- ★ **`Ckeys` 는 자식 ComboList 에만** 둔다 — Combo 본체(Dialog 밖)에는 두지 않는다 (`[combo-body-ckeys]`). 본체 표시는 `CtrlDisplayCkey` 또는 `DisplayValue:"{=표시Ckey}"`.
- ComboList 의 `Ckeys` 는 **value 키와 name 키 둘 다** 포함 (예: `["Code", "Name"]`).
- `SaveNameKey` 가 없으면 선택 후 텍스트 미표시.
- `SaveValueKey` = 주값 저장 키. `SaveValueKey`/`SaveNameKey` 는 **ComboList `Ckeys` 중 하나**여야 한다 (Items 필드명이 아님).
- **Fixed 모드 (`UseDataSource:false` + `Items`)**: `SaveValueKey`/`SaveNameKey` 는 **저장될 컬렉션키**(자식 `Ckeys` 중 하나)다 — `studio-init.js`: `SaveValueKey`="값에 해당하는 컬렉션 키", `SaveNameKey`="이름에 해당하는 컬렉션 키". `Items` 는 **`ItemValue`(값)/`ItemName`(표시) 고정 필드**를 가지며, 런타임이 `Item.ItemValue → 컬렉션[SaveValueKey]`, `Item.ItemName → 컬렉션[SaveNameKey]` 로 반영한다. **`CollectionMapper` 는 두지 않는다 (DataSource 모드 전용)**. SaveKey 가 `Ckeys` 멤버가 아니거나 Items 에 `ItemValue`/`ItemName` 이 없으면 런타임 빈 콤보 (`[combo-fixed]` cross-check).

## ComboList.Title 매핑 규칙

`Title` 은 선택지에 표시될 텍스트의 **원본 데이터 필드명** — ★ **DataSource 모드(`UseDataSource:true`)에서는 필수** (schema if/then + `[ds-key]` cross-check). Title 에 DataSource 키 중 화면에 보여줄 키가 연결되어야 리스트에 명칭이 보인다 — 누락/오타 시 선택지가 빈 칸.

| DataSource 타입 | `Title` 값 |
|---|---|
| Fixed (인라인 Items) | `"ItemName"` |
| Fixed (named DataSource — `DataSources.<name>.FixedItems`) | FixedItems 의 키 (예: `"ItemName"` / `"ItemValue"`) — `[ds-key]` 가 키 존재 검증 |
| Collection (다른 카테고리) | 원본 Ckey (예: `"CompanyName"`) |
| Service (API) | 서비스 반환 필드명 (예: `"fBaseUserName"`) |

## ★ DisplayType / CtrlDisplayCkey / DisplayValue (Combo 본체)

Combo 본체에 선택값을 어떻게 표시할지 결정하는 두 가지 모드. ★ **`DisplayType` 미지정 시 default = `"CtrlDisplayCkey"`** ([property-data.js:7054](public/javascripts/scenario-studio/property-data.js#L7054)).

> ★ **본체 표시 키 필수** — Combo 본체는 `CtrlDisplayCkey` 또는 `DisplayValue` (비어있지 않은 값) 가 **반드시 함께 채워져 있어야 한다**. 둘 다 비우면 선택 후 본체가 빈 칸이 된다. **고정데이터(Fixed Items, `UseDataSource:false`)도 예외 없음** — 과거 `DisplayValue: ""` fallback 컨벤션은 폐기. 자세히는 [rules.md §5.5](../../../rules.md#55-combo--search-본체-표시-키-필수-display-key).
>
> (참고: `[display-key]` 후검증은 자식 `ComboList.UseDataSource !== false` 일 때만 자동 차단하고 고정모드는 관대하지만, **생성 시에는 고정모드도 무조건 채운다**. 단, 고정모드에서 `CtrlDisplayCkey` 를 비워두면 materialize 가 자식 `SaveNameKey`(없으면 `SaveValueKey`)로 자동 채워 표시키↔저장키를 연결한다 — `SaveNameKey`/`SaveValueKey` 가 둘 다 비면 채울 원본이 없어 빈 칸이 되므로 자식 SaveKey 는 반드시 채울 것.)

| 모드 | 짝 키 | 의미 |
|---|---|---|
| `"CtrlDisplayCkey"` (default) | `CtrlDisplayCkey: "FieldName"` | 컬렉션 필드값을 그대로 표시. **표시 컬렉션키 등록 필수**. |
| `"DisplayValue"` | `DisplayValue: "{=Field}"` 또는 `"{% JS %}"` | 표현식으로 표시. 여러 필드 조합/조건 포맷. |

두 키(`CtrlDisplayCkey` / `DisplayValue`) 는 **상호배타** — 모드를 정한 다음 그쪽 키만 채우고 다른 쪽은 두지 않는다 (스튜디오가 모드 전환 시 한쪽을 undefined 로 비움).

### 모드 1 — `CtrlDisplayCkey` (default, 컬렉션키 등록 패턴)

데이터소스 연결한 Combo 에서 가장 흔한 패턴. 표시 대상 필드명을 등록.

```jsonc
{
  "ControlType": "Combo",
  "DataSourceName": "DeptListDS",
  "DisplayType": "CtrlDisplayCkey",   // 생략 가능 (default)
  "CtrlDisplayCkey": "DeptName",      // ★ 표시 컬렉션키 등록 (Ckeys 는 자식 ComboList 에)
  ...
}
```

`DisplayType` 키를 생략해도 default 가 `CtrlDisplayCkey` 라 동일 동작 — 이때 **`CtrlDisplayCkey` 키만 채우면 충분**.

```jsonc
{
  "ControlType": "Combo",
  "CtrlDisplayCkey": "DeptName",      // DisplayType 생략 → default 적용
  ...
}
```

### 모드 2 — `DisplayValue` (표현식)

```jsonc
{
  "ControlType": "Combo",
  "DisplayType": "DisplayValue",
  "DisplayValue": "{=DeptName}",                                                    // 정적 바인딩
  // 또는
  "DisplayValue": "{% if('{=name}'==''){return '선택'} else {return '{=name}'} %}"   // JS 가공
}
```

### 고정데이터(Fixed Items + Combo) — 표시 키도 채운다

고정 Combo 도 본체에 `CtrlDisplayCkey` 를 등록(**Ckeys 아님**)하고, 자식 ComboList 에 `Ckeys`/`SaveNameKey`/`SaveValueKey` 를 채운다. **`DisplayValue: ""` 빈 문자열 fallback 컨벤션은 폐기** (과거엔 런타임이 `ComboList.SaveNameKey` 로 자동 표시했지만, 더는 의존하지 않는다).

```jsonc
{
  "ControlType": "Combo",
  "CtrlDisplayCkey": "ItemName",       // ★ 본체 표시 키 (Ckeys 는 두지 않음)
  "Dialog": { "Layouts": [{ "Controls": [{
    "ControlType": "ComboList",
    "Ckeys": ["ItemValue", "ItemName"], // ★ Ckeys 는 ComboList 에만 [값키, 표시키]
    "SaveNameKey": "ItemName",         // ∈ Ckeys — 표시명 저장
    "SaveValueKey": "ItemValue",       // ∈ Ckeys — 값 저장 (누락 시 저장 안 됨)
    "Items": [...],
    "UseDataSource": false,
    ...
  }]}]}
}
```

> 값과 표시가 다르면(예: 저장 `반차오전` / 표시 `반차(오전)`) ComboList `Ckeys: [값키, 표시키]` 두 컬렉션키 + `SaveValueKey: 값키` / `SaveNameKey: 표시키` 로 두고, 각 Item 에 `ItemValue:"반차오전"`·`ItemName:"반차(오전)"` 를 채운다 (CollectionMapper 불필요).

> 운영 메타에는 `DisplayValue: ""` (ComboList.SaveNameKey fallback) 패턴이 남아있지만, **AI 생성에서는 `CtrlDisplayCkey` 를 명시**한다. 자세히는 [rules.md §5.5.1](../../../rules.md#551-고정데이터-컨트롤의-저장-키-필수-ckeys--savenamekey--savevaluekey).

## 이벤트 (제한)

**Combo 본체가 아니라 자식 ComboList (`Dialog.Layouts[0].Controls[0]`) 안에 둠.** 본체에 `UseEvents`/`Events` 두면 validate.mjs `[event]` cross-check 로 차단.

`Events` 는 `_base.schema.json#/$defs/comboEvents` 가 적용. `ComboOrder` enum: `change` / `DialogClose`.

```jsonc
{
  "ControlType": "ComboList",
  "UseEvents": true,
  "Events": {
    "ComboOrder": ["change", "DialogClose"],
    "change": "ON_COMBO_CHANGED",
    "DialogClose": "ON_COMBO_CLOSED"
  }
}
```

## 함정

- ComboList 의 `Title` 에 잘못된 필드명 → 선택지가 빈 칸으로 표시. **DataSource 모드에서 Title 누락도 동일 증상** — schema required + `[ds-key]` 가 차단 (Fixed DataSource 면 FixedItems 키 존재까지 검증).
- `SaveNameKey` 누락 → 선택 후 Combo 에 텍스트 안 보임.
- 8개 초과 / 동적 데이터에는 Combo 사용 금지 (Search 사용).
- `Ckeys` 사용 시 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 필요.

## ★ ComboList.UseDataSource — default=true (RadioBox 와 비대칭)

런타임/스튜디오의 `UseDataSource` 처리 ([property-data.js:7439](public/javascripts/scenario-studio/property-data.js#L7439), [studio-panel-cat.js:1054](public/javascripts/scenario-studio/studio-panel-cat.js#L1054)):

```js
// property-data.js:7439 — 미지정 시 default = true
editControl.value(meta[K.USE_DATASOURCE] != undefined ? meta[K.USE_DATASOURCE] : true);

// studio-panel-cat.js:1054 — UseDataSource truthy OR undefined → DataSource 분기
if (tempControl.UseDataSource || tempControl.UseDataSource == undefined) { /* DataSource */ }
else                                                                     { /* Fixed */ }
```

**핵심:**

- ComboList 의 `UseDataSource` **default = true** (스키마에도 `"default": true` 박힘). RadioBox(default=false) 와 비대칭.
- Fixed Items 모드는 **`"UseDataSource": false`** 를 권장 — 누락하면 default=true 라 DataSource 모드로 인식되어 Items 가 무시되거나 빈 목록이 뜨는 경로가 있다.
- 운영 메타에는 문자열 `"true"`/`"false"` 가 섞여 있을 수 있다 (런타임 `==` 비교로 받음). 다만 `"false"` 문자열은 JS truthy 라 `if(meta.UseDataSource)` 분기에서 의도와 반대로 동작 — **AI 생성에는 boolean 사용**.

### 예시 — Fixed 모드 (사용자 질문 형태 보정)

```jsonc
{
  "ControlType": "Combo",
  "ControlStyle": "None",
  "CaptionStyle": { "CaptionPosition": "" },
  "Width":  { "SizeValue": "100", "SizeUnit": "%" },
  "Height": { "SizeValue": "64",  "SizeUnit": "px" },
  "ControlDefaultName": "Combo1",
  "ControlName2": "Combo1",
  "Caption": "Combo1",
  "Id": "f_1381",
  "isColumnCtrl": false,
  "Dialog": {
    "Layouts": [{
      "Controls": [{
        "ControlType": "ComboList",
        "DlgCtrlType": "Common",
        "Title": "ItemName",
        "Ckeys": [],
        "SaveNameKey": "ItemName",
        "SaveValueKey": "ItemValue",
        "Items": [
          { "ItemName": "옵션1", "ItemValue": "1" },
          { "ItemName": "옵션2", "ItemValue": "2" }
        ],
        "UseDataSource": false,
        "isColumnCtrl": false,
        "Id": "f_1382"
      }]
    }]
  }
}
```

> 사용자가 보여준 운영 메타는 `"UseDataSource": "false"` (문자열) 형태였다. 런타임에서는 동작하지만, 신규 생성 시에는 위 예시처럼 boolean `false` 와 명시적 `Items`/`SaveNameKey`/`SaveValueKey` 를 채워 넣을 것.
