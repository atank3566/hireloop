# Label

표시 전용 컨트롤. **입력 없음**. `LabelType` 으로 두 모드.

## 스키마

`control/label.schema.json` — `controlBase` + 분기 키 (`ControlType="Label"`, `LabelType`, `labeltext` / `LabelCKey`, `UseClickEvent`/`UseMove`/`MoveSteps`, `ImageStyle`).

## 모드

| LabelType | 동작 | 필수 추가 키 |
|---|---|---|
| `labeltext` | 정적 텍스트(+바인딩 표현식) | `labeltext` |
| `LabelCKey` | 카테고리 필드값 직접 표시 | `LabelCKey` |

스키마는 `if/then` 으로 LabelType 별 필수키를 강제.

## 예시 — labeltext 모드

```jsonc
{
  "ControlType": "Label",
  "ControlStyle": "styleFontNormal",
  "LabelType": "labeltext",
  "labeltext": "{{표시할 텍스트}}",
  "ControlDefaultName": "Label1",
  "ControlName2": "Label1",
  "Caption": "Label1",
  "Id": "f_10",
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "MatchText": true, "SizeValue": "" },
  "FontStyle": {
    "UseFont": true, "FontColor": "var(--colorGray1)",
    "UseBold": true, "FontSize": "14", "FontAlign": "flex-start",
    "FontWeight": "SemiBold"
  },
  "isColumnCtrl": false
}
```

## `labeltext` 바인딩 표현식

`Load.sector` 는 **`labeltext` 안에서 사용 불가** (LoadScript 에서만 존재). `{=FieldName}` 으로 현재 섹터 필드 직접 참조.

```
"labeltext": "{=FieldName}"                                          // 직접 바인딩
"labeltext": "{=$FieldName}"                                         // 천단위 콤마 자동
"labeltext": "{{총}} {=Hours}{{시간}}"                                // i18n + 바인딩 혼용
"labeltext": "{{금액}} {=$Price}{{원}}"                               // i18n + 콤마 숫자
"labeltext": "{% return '{=AppDate}'.slice(0,4) + '-' + '{=AppDate}'.slice(4,6) + '-' + '{=AppDate}'.slice(6) %}"
"labeltext": "{% return f.numFormat('{=Price}').format() + '원' %}"
```

`{% %}` 안의 `{=Field}` 는 **JS 실행 전에** 실제 값으로 치환된다. 즉 `'{=Price}'` 는 런타임에 `'9500'` 같은 문자열로 바뀐 뒤 JS 가 실행된다.

## 예시 — LabelCKey 모드

```jsonc
{
  "ControlType": "Label",
  "LabelType": "LabelCKey",
  "LabelCKey": "StatusName",
  "ControlStyle": "StyleRadiusLine",
  "ControlDefaultName": "LblStatus",
  "ControlName2": "LblStatus",
  "Caption": "LblStatus",
  "Id": "f_11",
  "Width":  { "MatchText": true },
  "Height": { "MatchText": true, "SizeValue": "" },
  "isColumnCtrl": false
}
```

`labeltext` 키 자체를 두지 않는다. 카테고리 필드값이 그대로 표시.

## 클릭 / 이동 패턴 (Group / Button 과 동일)

| 모드 | 키 |
|---|---|
| 이동 | `UseMove: true` + `MoveSteps: { MoveStepOrder, StepX: { Condition, MoveTo, Direction } }` |
| 이벤트 | `UseClickEvent: true` + `Events: { Click: "EVENT_NAME" }` |

**둘 다 사용 시**: `UseMove` 가 먼저 동작한 뒤 이벤트 실행.

`Events` 는 `_base.schema.json#/$defs/labelEvents` 가 적용 — `Click` 핸들러만.

## Caption 규칙

Label 의 `Caption` 은 **내부명** (=`ControlDefaultName`). 화면 표시 텍스트는 항상 `labeltext` 또는 `LabelCKey` 가 결정.

## 함정

- `labeltext` 안에서 `Load.sector` 사용 불가 — `{=Field}` 만.
- `LabelCKey` 모드면 `labeltext` 키 두지 않음.
- 아이콘 라벨은 `ImageStyle` + (필요시) `labeltext: ""`.
- `LabelCKey` 사용 시 상위 Group 계층 어딘가에 `UseDataConnection` + `DataConnection` 필요 (다른 Input 컨트롤과 동일).

## PC 전용 키 (스키마 차원 차단)

다음 키는 **PC 환경 전용 툴팁 기능**이라 모바일 기준의 시나리오 생성 시 **키 자체를 두지 않는다**.

| 키 | 의미 |
|---|---|
| `TooltipType` | 툴팁 모드 (정적 텍스트 / 카테고리 필드값 등) |
| `TooltipText` | `TooltipType` 이 정적 텍스트 모드일 때의 툴팁 문자열 |
| `TooltipCKey` | `TooltipType` 이 카테고리 필드 모드일 때의 컬렉션 필드명 |

### 차단 정책

- **명세**: `properties` 에 description 으로만 의미를 남김 (참조용).
- **옵션 차단**: `allOf` 의 `not.anyOf.required` 절로 세 키 **존재 자체를 거부**.
  - AI 생성기든 사용자 편집이든 키가 들어가면 검증 실패.
  - 차후 PC 시나리오까지 컨트랙트로 다루게 되면 이 `not` 절만 제거하면 됨 (명세는 유지).

```jsonc
{
  "not": {
    "anyOf": [
      { "required": ["TooltipType"] },
      { "required": ["TooltipText"] },
      { "required": ["TooltipCKey"] }
    ]
  }
}
```

→ `UseFullShape` / `UseTriming` 의 description-only soft 가이드와 달리, Tooltip 3종은 **hard 차단**.
