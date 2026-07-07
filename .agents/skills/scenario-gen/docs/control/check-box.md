# CheckBox

체크박스. `Items[]` 로 다중 항목 / 단일 토글 모두 지원. 옆 텍스트는 `Items[].ItemName`.

## ★ 필수 체크리스트 (생성 전 반드시 확인)

> CheckBox 가 `SaveValueKey` 로 값을 **저장**하면 데이터 바인딩 3종 세트(조상 Group 데이터연결 + `scenario.DataSources` + 컨트롤 키)가 필요하다 ([data-sources.md](../data-sources.md) `[dsref]`/`[proto]` 절). 모델이 자주 빠뜨려 `[bind]`/`[proto]` 로 막힌다.

1. **조상 Group 데이터연결** — CheckBox 를 감싸는 Group(또는 상위)에 `"UseDataConnection": true` + `DataConnection`. 없으면 `[bind]` "uses SaveValueKey but no ancestor Group has UseDataConnection:true + DataConnection".
2. **`scenario.DataSources` 비어있지 않게** — 저장형 컨트롤이 있는 시나리오는 최소 1개 `Fixed`/`Grid` DataSource 보유. 비면 `[proto]` "scenario.DataSources is empty".
3. **저장 안 할 거면** — `SaveValueKey`/`Ckeys` 를 빼고 감싸는 Group 에 `"UseDataConnection": false` 명시(순수 표시 토글).

## 스키마

`control/check-box.schema.json` — `controlBase` + 분기 키 (`ControlType="CheckBox"`, `Items`, `SaveValueKey`, `ControlStyle`).

## 예시 — 단일 토글

```jsonc
{
  "ControlType": "CheckBox",
  "ControlStyle": "None",
  "Items": [
    { "ItemName": "{{안전장비 확인}}", "ItemValue": "1", "ItemValueDel": "0" }
  ],
  "Width":  { "MatchText": true, "SizeValue": "" },
  "Height": { "MatchText": true, "SizeValue": "" },
  "ControlDefaultName": "CheckBox1",
  "ControlName2": "CheckBox1",
  "Caption": "",
  "Id": "f_36",
  "Ckeys": ["SafetyEquip"],
  "SaveValueKey": "SafetyEquip",
  "isColumnCtrl": false
}
```

## 예시 — 다중 항목 체크리스트

```jsonc
{
  "ControlType": "CheckBox",
  "ControlStyle": "styleSquare",
  "Items": [
    { "ItemName": "{{헬멧}}",    "ItemValue": "1", "ItemValueDel": "0" },
    { "ItemName": "{{안전화}}",  "ItemValue": "1", "ItemValueDel": "0" },
    { "ItemName": "{{안전벨트}}","ItemValue": "1", "ItemValueDel": "0" }
  ],
  "ControlDefaultName": "EquipChecks",
  "ControlName2": "EquipChecks",
  "Caption": "{{안전 장비}}",
  "Id": "f_37",
  "Ckeys": ["EquipList"],
  "SaveValueKey": "EquipList",
  "isColumnCtrl": false
}
```

## 제한값

### `ControlStyle`
스키마 enum 으로 강제.

| 값 | 외형 |
|---|---|
| `""` / `"None"` | 기본 사각 |
| `"styleSquare"` | 사각 (명시) |
| `"styleCircle"` | 원형 |
| `"styleCircleGray"` | 회색 원형 (비활성/보조) |
| `"styleSwitch"` | 토글 스위치 |
| `"styleIconHeart"` | 하트 아이콘 |
| `"styleRadius"` | 라운드 |

### `Items[]` (필수)
최소 1개 이상.

| 키 | 비고 |
|---|---|
| `ItemName` | 옆 텍스트. 빈 문자열 = 미표시. **체크리스트 용도면 `{{}}` 바인딩 필수**. |
| `ItemValue` | 체크 시 저장 값 |
| `ItemValueDel` | 해제 시 값. 기본 `""` |

### `DefaultValue`
체크 상태 초기값. **`type: "boolean"` strict** — `true` / `false` 만. 기본값 **`false`** (미체크 상태로 시작).

| 값 | 의미 |
|---|---|
| `false` (기본) | 해제된 상태로 시작 |
| `true` | 체크된 상태로 시작 |

> `controlBase.DefaultValue` 의 any 타입을 CheckBox 에서 **boolean 으로 strict 제약**. 문자열 `"true"`/`"false"` **금지** — JS 에서 `"false"` 문자열은 truthy 이므로 런타임이 체크됨으로 오인 (`isColumnCtrl` 과 동일한 함정). 운영 메타에 문자열로 들어와도 컨트랙트가 거부한다.

## 이벤트 (제한)

`Events` 는 `_base.schema.json#/$defs/checkBoxEvents` 적용. `Click` 만 지원. `CheckBoxOrder` 는 선택사항(실 샘플 대부분 직접 `Click`).

```jsonc
// 직접 Click (대부분의 실 샘플 패턴)
{ "UseEvents": true, "Events": { "Click": "ON_CHECK_TOGGLED" } }

// CheckBoxOrder 사용 (formal — EventOrder 에 Click 등록 시 동명 핸들러 필수)
{ "UseEvents": true, "Events": { "CheckBoxOrder": ["Click"], "Click": "ON_CHECK_TOGGLED" } }
```

## Caption vs ItemName

- `Caption` = 필드 라벨 (체크박스 묶음 위쪽).
- `Items[].ItemName` = 체크박스 옆 텍스트.

체크리스트 용도에서는 `Caption` 은 비워두거나 그룹 라벨로, `ItemName` 으로 각 항목 텍스트를 표시.

## 함정

- **Width/Height 를 작은 px (예 20px) 로 두지 마라** — 컨트롤은 아이콘 외에 터치 영역을 포함. `MatchText: true` 사용.
- `Items[].ItemName` 빈 문자열이면 옆 텍스트 미표시 — 체크리스트 용도면 누락 주의.
- `SaveValueKey` 누락 시 저장 동작 안 함.
- `Ckeys` 사용 시 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 필요.
