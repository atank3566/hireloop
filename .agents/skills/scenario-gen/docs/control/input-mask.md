# InputMask

마스크 패턴 입력. `InputType` 으로 시간/통화/날짜/전화 처리.

## 스키마

`control/input-mask.schema.json` — `controlBase` + `inputBase` + 분기 키 (`ControlType="InputMask"`, `InputType`, `MaskType`, `UseNumberOnly`, `UseFixedDecimalPlaces`, `DecimalPlaces`, `RoundingMode`).

## 제한값

### `InputType`
스키마 enum 으로 강제.

| 값 | 의미 |
|---|---|
| `hhmm` | 시간 HH:MM |
| `money` | 통화 (천단위 콤마). `UseNumberOnly: true` 권장 (필수 아님) |
| `yyyymmdd` | 날짜 YYYY-MM-DD |
| `phone` | 전화번호 패턴 |

> `InputType` 은 위 4 enum 만 지원. 4종 외 패턴이 필요하면 다른 컨트롤 (`InputText` + 검증 등) 로 우회.

### `MaskType`
스키마 enum 으로 강제. 마스크 카테고리 표시용. `InputType` 과 정합되어야 함.

| 값 | 짝 InputType |
|---|---|
| `Time` | `hhmm` |
| `Money` | `money` |
| `Date` | `yyyymmdd` |
| `Phone` | `phone` |

## 예시 — 시간

```jsonc
{
  "ControlType": "InputMask",
  "ControlStyle": "styleInputValueLine",
  "ControlDefaultName": "StartTime",
  "ControlName2": "StartTime",
  "InputType": "hhmm",
  "Placeholder": "18:00",
  "Caption": "{{시작시간}}",
  "Id": "f_32",
  "Ckeys": ["StartTime"],
  "isColumnCtrl": false
}
```

## 예시 — 통화

```jsonc
{
  "ControlType": "InputMask",
  "InputType": "money",
  "UseNumberOnly": true,
  "DisplayValue": "",
  "Ckeys": ["Price"],
  "ControlDefaultName": "Price",
  "ControlName2": "Price",
  "Caption": "{{금액}}",
  "Id": "f_33",
  "isColumnCtrl": false,
  "FontStyle": { "UseFont": true, "FontAlign": "flex-end", "FontSize": "14" }
}
```

## 데이터 바인딩

`Ckeys` 사용 시 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 필요.

## 이벤트 (제한)

`Events` 는 `_base.schema.json#/$defs/inputEventsChangeOnly` 적용. **`change` 만 지원** (InputNumber 와 동일). `input` / `focusin` / `focusout` 사용 불가.

```jsonc
{
  "UseEvents": true,
  "Events": {
    "InputEventOrder": ["change"],
    "change": "ON_TIME_CHANGED"
  }
}
```

## 함정

- `money` 는 표시는 콤마 포함, 저장값은 숫자 문자열.
- `hhmm` 은 24시간 형식 — AM/PM 자동 변환 없음.
