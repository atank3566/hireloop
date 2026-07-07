# InputText

한 줄 텍스트 입력. 모드는 `InputType` 으로 결정.

## 스키마

`control/input-text.schema.json` — `controlBase` + `inputBase` + 분기 키 (`ControlType="InputText"`, `InputType`).

## 예시

```jsonc
{
  "ControlType": "InputText",
  "ControlStyle": "styleInputValueLine",
  "ControlDefaultName": "InputText1",
  "ControlName2": "InputText1",
  "Caption": "{{이름}}",
  "Id": "f_30",
  "Placeholder": "{{이름을 입력하세요}}",
  "InputType": "text",
  "Ckeys": ["UserName"],
  "isColumnCtrl": false,
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "SizeValue": "70", "SizeUnit": "px", "MatchText": false }
}
```

## `InputType` 값 (제한)

스키마 enum 으로 강제. 그 외 값은 검증 실패.

| 값 | 의미 |
|---|---|
| `text` | 일반 텍스트 (기본) |
| `password` | 마스킹 |

> 숫자/이메일/전화 등은 [InputNumber](input-number.md) 또는 [InputMask](input-mask.md) 사용. **1000단위 콤마 (금액) 는 `InputMask` + `InputType:"money"`** (InputNumber 가 아님).

## 데이터 바인딩

`Ckeys` 사용 시 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 필요. 직접 부모가 아닌 조상 Group 도 OK.

## 이벤트 (제한)

`Events` 는 `_base.schema.json#/$defs/inputEventsFull` 적용. `InputEventOrder` enum + EventOrder ↔ 핸들러 일치 강제.

| 이벤트 | 의미 |
|---|---|
| `change` | 입력 완료 (Enter 키 포함). 검색/단일 입력 필드의 즉시 실행에 사용. |
| `input` | 키 입력마다 (실시간 필터링). |
| `focusin` | 포커스 진입. |
| `focusout` | 포커스 이탈. |

```jsonc
{
  "UseEvents": true,
  "Events": {
    "InputEventOrder": ["change"],
    "change": "DoSearch_E"
  }
}
```

> EventOrder 에 등록한 이벤트는 **동명 핸들러 필수** (if/then 강제).
> 예: `"InputEventOrder": ["change","input"]` → `change` + `input` 둘 다 핸들러 정의해야 함.

> **검색/단일 입력 필드 패턴**: `change` 는 Enter 키에도 발생하므로 별도 검색 버튼 없이 즉시 실행 가능. 실시간 필터링은 `input` 사용.

## 함정

- `ControlName2` 누락 = 런타임 에러. `ControlDefaultName` 과 같은 값.
- `isColumnCtrl: false` 항상 명시.
- 필수 입력은 `ControlKey: "Required"` 로 처리 (스크립트 직접 작성 금지).
