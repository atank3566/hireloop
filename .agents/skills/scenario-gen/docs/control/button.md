# Button

액션 트리거 전용 컨트롤. **입력 없음**. `ButtonName`(텍스트) + `ImageStyle`(아이콘) 단독 또는 조합으로 표현.

## 스키마

`control/button.schema.json` — `controlBase` + 분기 키 (`ControlType="Button"`, `ButtonName`, `ButtonValueCKey`, `ButtonValue`, `ImageStyle`, `UseClickEvent`).

## 표시 모드

| 구성 | 의미 |
|---|---|
| `ButtonName` 만 | 텍스트 버튼 |
| `ImageStyle.UseImage=true` + `ButtonName=""` | 아이콘 전용 버튼 |
| `ButtonName` + `ImageStyle.UseImage=true` | 아이콘 + 텍스트 |

## 예시 — 텍스트 버튼 + 클릭 이벤트

```jsonc
{
  "ControlType": "Button",
  "ControlStyle": "styleRectangleMain",
  "ControlDefaultName": "BtnSubmit",
  "ControlName2": "BtnSubmit",
  "Caption": "BtnSubmit",
  "Id": "f_20",
  "ButtonName": "{{확인}}",
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "SizeValue": "44", "SizeUnit": "px", "MatchText": false },
  "UseClickEvent": true,
  "Events": { "Click": "SUBMIT_E" },
  "isColumnCtrl": false
}
```

## 예시 — 아이콘 전용 버튼

```jsonc
{
  "ControlType": "Button",
  "ControlStyle": "styleCircleBackPoint",
  "ControlDefaultName": "BtnSearch",
  "ControlName2": "BtnSearch",
  "Caption": "BtnSearch",
  "Id": "f_21",
  "ButtonName": "",
  "Width":  { "SizeValue": "38", "SizeUnit": "px", "MatchText": false },
  "Height": { "SizeValue": "38", "SizeUnit": "px", "MatchText": false },
  "ImageStyle": {
    "UseImage": true,
    "IsLineIcon": true,
    "Img": "B_000_017",
    "ImageColor": "var(--colorWhite)",
    "ImageSize": "18"
  },
  "BgStyle":     { "UseBackground": true, "BgColor": "var(--colorMain)" },
  "BorderStyle": { "Useborder": true, "BorderSize": "0", "SizeSet": "All", "BorderRadius": "6", "RadiusSet": "All" },
  "UseClickEvent": true,
  "Events": { "Click": "STEP1_Query_E" },
  "UseFixedSize": true,
  "isColumnCtrl": false
}
```

## 예시 — 값 저장 버튼 (`ButtonValueCKey` + `ButtonValue`)

```jsonc
{
  "ControlType": "Button",
  "ControlDefaultName": "BtnAgreeY",
  "ControlName2": "BtnAgreeY",
  "Caption": "BtnAgreeY",
  "Id": "f_22",
  "ButtonName": "{{동의}}",
  "ButtonValueCKey": "AgreeFlag",
  "ButtonValue": "Y",
  "UseClickEvent": false,
  "isColumnCtrl": false
}
```

→ 클릭 시 카테고리의 `AgreeFlag` ckey 에 `"Y"` 가 저장. `UseClickEvent` 없이도 동작 (이벤트는 추가 핸들러 실행용).

## `ButtonName` 바인딩 표현식

Label `labeltext` 와 동일 규약. `Load.sector` 사용 불가.

```
"ButtonName": "{=FieldName}"                                   // 직접 바인딩
"ButtonName": "{=$FieldName}"                                  // 천단위 콤마 자동
"ButtonName": "{{삭제}} ({=Count})"                             // i18n + 바인딩
"ButtonName": "{% return f.numFormat('{=Price}').format() %}"  // JS 실행
```

## 데이터 바인딩 — `ButtonValueCKey` + `ButtonValue`

| 키 | 타입 | 의미 |
|---|---|---|
| `ButtonValueCKey` | string | 클릭 시 값을 저장할 **카테고리 필드명** (ckey). 빈 문자열=저장 안 함. |
| `ButtonValue` | string | 클릭 시 `ButtonValueCKey` 에 저장될 **정적 값**. 표현식/바인딩 미지원. |

**동작**: 사용자가 버튼을 누르면 카테고리의 `ButtonValueCKey` 필드값이 `ButtonValue` 로 set 된다. 이후 다른 컨트롤이 같은 ckey 를 읽으면 새 값을 받는다.

**대표 패턴** — Y/N 토글 한 쌍:
```jsonc
{ "ButtonName": "{{동의}}",     "ButtonValueCKey": "AgreeFlag", "ButtonValue": "Y" }
{ "ButtonName": "{{비동의}}",   "ButtonValueCKey": "AgreeFlag", "ButtonValue": "N" }
```

**전제조건**: 상위 Group 계층 어딘가에 `UseDataConnection: true` + `DataConnection` 필요 (다른 ckey 바인딩 컨트롤과 동일 규칙).

## 클릭 이벤트

| 모드 | 키 | 비고 |
|---|---|---|
| 이벤트 | `UseClickEvent: true` + `Events: { Click: "EVENT_NAME" }` | 핸들러 호출 |
| 값 저장 | `ButtonValueCKey` + `ButtonValue` | 이벤트 핸들러 없이도 작동 |

`Events` 는 `_base.schema.json#/$defs/buttonEvents` 가 적용 — `Click` 핸들러만.

## Caption 규칙

Button 의 `Caption` 은 **내부명** (=`ControlDefaultName`). 화면 표시 텍스트는 항상 `ButtonName` 이 결정.

## BottomButton 과의 차이

`Step.BottomButtons[]` 의 항목과는 **별개 컨트롤**.

| 위치 | 키 | 비고 |
|---|---|---|
| `Step.Contents[…].Controls[…]` | `ControlType: "Button"` | 본 스키마 적용 — Step 이동 미지원 |
| `Step.BottomButtons[…]` | `ButtonName` 등 (ControlType 없음) | [bottom-buttons.schema.json](../bottom-buttons.schema.json) 적용 — Step 이동 지원 |

같은 `ButtonName` 키를 쓰지만 컨텍스트와 스키마가 다르므로 혼동 금지. **Step 이동 버튼은 BottomButton 으로**.

## ControlKey 상태 (제한)

Button 은 일부 상태가 미지원 — [control.md §ControlKey 상태](../control.md#controlkey-상태-제한) 표 참조. **`Required` 미지원** (입력 컨트롤 아님 — property-data.js `button()` 의 `status.hideItem(CONTROL_KEY.REQUIRED)`). `Hide` / `Disabled` / `ReadOnly` 는 지원.

## 함정

- `ButtonName` 안에서 `Load.sector` 사용 불가 — `{=Field}` 만.
- 아이콘 전용 버튼은 `ButtonName: ""` + `ImageStyle.UseImage: true`. `ButtonName` 키 자체를 빼지 말 것 (운영 메타 컨벤션).
- `UseClickEvent=true` 이면 `Events.Click` 필수.
- `ButtonValueCKey` 사용 시 상위 Group 계층 어딘가에 `UseDataConnection: true` + `DataConnection` 필요.
- `ButtonValue` 는 **정적 문자열만** — `{=Field}` / `{{i18n}}` 같은 표현식 미지원.
- BottomButton 과 스키마/위치가 다름. `Step.BottomButtons[]` 는 별도 스키마.
