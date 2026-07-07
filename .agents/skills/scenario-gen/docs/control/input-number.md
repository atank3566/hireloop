# InputNumber

순수 숫자 입력. `InputType` 한 키로 정수/소수/마스킹 구분. **1000단위 콤마 (금액) 는 `InputMask` + `InputType:"money"` 사용** (InputNumber 가 아님).

## 스키마

`control/input-number.schema.json` — `controlBase` + `inputBase` + 분기 키 (`ControlType="InputNumber"`, `InputType`, `Events`).

## 예시

```jsonc
{
  "ControlType": "InputNumber",
  "ControlStyle": "styleInputValueLine",
  "ControlDefaultName": "InputNumber1",
  "ControlName2": "InputNumber1",
  "Caption": "{{수량}}",
  "Id": "f_31",
  "InputType": "number",
  "Ckeys": ["Quantity"],
  "isColumnCtrl": false,
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "SizeValue": "70", "SizeUnit": "px", "MatchText": false }
}
```

## `InputType` 값 (제한)

스키마 enum 으로 강제. 그 외 값은 검증 실패. **콤마/소수점/범위 모두 이 한 키로만 결정**.

| 값 | 의미 |
|---|---|
| `number` | 정수 (콤마 없음, 순수 숫자) |
| `decimal` | 소수점 허용 (콤마 없음) |
| `password` | 마스킹된 숫자 입력 (PIN/패스코드 등) |

## 이벤트 (제한)

`Events` 는 `_base.schema.json#/$defs/inputEventsChangeOnly` 적용. **`change` 만 지원** (실 샘플 기준). `input` / `focusin` / `focusout` 사용 시 enum 검증 실패.

```jsonc
{
  "UseEvents": true,
  "Events": {
    "InputEventOrder": ["change"],
    "change": "CALC_AMOUNT_EVENT"
  }
}
```

> EventOrder 에 `change` 등록 시 `change` 핸들러 키 필수 (if/then 강제).

## 데이터 바인딩

`Ckeys` 사용 시 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 필요.
