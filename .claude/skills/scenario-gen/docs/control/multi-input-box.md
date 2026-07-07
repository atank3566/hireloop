# MultiInputBox

여러 줄 텍스트 입력 (TextArea). Enter 로 줄바꿈.

## 스키마

`control/multi-input-box.schema.json` — `controlBase` + `inputBase` + 분기 키 (`ControlType="MultiInputBox"`).

## 예시

```jsonc
{
  "ControlType": "MultiInputBox",
  "ControlStyle": "styleInputValueLine",
  "ControlDefaultName": "MultiInput1",
  "ControlName2": "MultiInput1",
  "Caption": "{{비고}}",
  "Id": "f_40",
  "Placeholder": "{{내용을 입력하세요}}",
  "Ckeys": ["Remarks"],
  "Maxlength": "500",
  "isColumnCtrl": false,
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "SizeValue": "120", "SizeUnit": "px", "MatchText": false }
}
```

## 이벤트 (제한)

`Events` 는 `_base.schema.json#/$defs/inputEventsFull` 적용 (InputText 와 동일 4종). `InputEventOrder` enum: `change` / `input` / `focusin` / `focusout`. EventOrder ↔ 핸들러 일치 강제.

```jsonc
{
  "UseEvents": true,
  "Events": {
    "InputEventOrder": ["change", "focusout"],
    "change":   "ON_TEXT_CHANGED",
    "focusout": "ON_TEXT_BLURRED"
  }
}
```

## 데이터 바인딩

`Ckeys` 사용 시 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 필요.

## 함정

- 기본 Height 는 `120px` — 다른 Input 계열(70px) 보다 큼.
- `InputType` 없음 — 항상 일반 텍스트 멀티라인.
- 줄바꿈 문자(`\n`) 그대로 저장됨.
