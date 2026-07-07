# InputDate

날짜 입력 + 캘린더 다이얼로그. **자식 트리 보유** — 리프 아님.

## 스키마

`control/input-date.schema.json` — `controlBase` + `inputBase` + 분기 키 (`ControlType="InputDate"`, `DateFormat`, `Dialog`).

## 예시 (단일 일자, dayCalendar)

```jsonc
{
  "ControlType": "InputDate",
  "DateFormat": "YYYY-MM-DD",
  "DisplayValue": "",
  "Ckeys": ["AppDate"],
  "ControlDefaultName": "InputDate1",
  "ControlName2": "InputDate1",
  "Caption": "{{날짜}}",
  "Placeholder": "{{날짜 선택}}",
  "Id": "f_34",
  "isColumnCtrl": false,
  "Dialog": {
    "Layouts": [{
      "ContentsType": "Layout",
      "Controls": [{
        "ControlType": "Calendar",
        "CalendarType": "dayCalendar",
        "SelectType": "SingleDate",
        "SingleDate": { "Ckeys": ["AppDate"] },
        "Id": "f_35"
      }]
    }]
  }
}
```

## InputDate 본체 제한값

### `DateFormat` (제한)

스키마 enum 으로 강제. 빈 문자열 `""` 은 런타임 기본 포맷.

| 값 | 표시 | 짝 CalendarType |
|---|---|---|
| `""` | 런타임 기본 | (모든 타입) |
| `YYYY-MM-DD` | 2026-05-06 | `dayCalendar` |
| `YYYY.MM.DD` | 2026.05.06 | `dayCalendar` |
| `YYYY/MM/DD` | 2026/05/06 | `dayCalendar` |
| `YYYY-MM` | 2026-05 | `monthCalendar` |

> **CalendarType 정합 cross-check (validate.mjs 후검증):**
> - `DateFormat: "YYYY-MM"` 면 자식 Calendar 의 `CalendarType` 은 반드시 `monthCalendar`.
> - `CalendarType: "monthCalendar"` 면 `DateFormat` 은 `""` 또는 `"YYYY-MM"` 만.

## 자식 Calendar 컨트롤 (`Dialog.Layouts[*].Controls[*]`)

`Dialog.Layouts[*].Controls[*]` 의 Calendar 컨트롤이 실제 캘린더 UI. **`CalendarType` / `SelectType` 은 InputDate 본체가 아니라 여기에 위치**.

### 키 / 제한값

| 키 | 비고 |
|---|---|
| `ControlType` | `"Calendar"` (const 고정) |
| `CalendarType` | enum: `"dayCalendar"` / `"monthCalendar"` / `"yearCalendar"` |
| `SelectType` | enum: `"SingleDate"` / `"FromTo"` |
| `SingleDate.Ckeys` | `SelectType="SingleDate"` — 객체 자체는 항상 필수, `Ckeys` 는 조상 Group `UseDataConnection:true` 면 1개 이상·비연결이면 `[]` |
| `StartDate.Ckeys` | `SelectType="FromTo"` — 객체 항상 필수, `Ckeys` 는 데이터연결 컨텍스트면 1개 이상·비연결이면 `[]` |
| `EndDate.Ckeys` | `SelectType="FromTo"` — 객체 항상 필수, `Ckeys` 는 데이터연결 컨텍스트면 1개 이상·비연결이면 `[]` |
| `Id` | `^f_[1-9][0-9]*$` — 시나리오 전체 유일 |

### 스키마 if/then 강제

- `SelectType="SingleDate"` → `SingleDate` **객체는 항상 필수**. `SingleDate.Ckeys` 는 **조상 Group `UseDataConnection:true` 인 데이터연결 컨텍스트에서만 1개 이상 필수**, 비연결(프로토타이핑)이면 `"Ckeys": []` 허용 (`Ckeys` 키 자체는 항상 둘 것).
- `SelectType="FromTo"` → `StartDate` + `EndDate` **객체 모두 항상 필수**. 각 `Ckeys` 도 동일 규칙 — 데이터연결 컨텍스트면 1개 이상, 비연결이면 `[]`.
- `CalendarType ∈ {monthCalendar, yearCalendar}` → `SelectType` 은 `SingleDate` 만 허용 (`FromTo` 는 `dayCalendar` 전용).

> ★ **빈 객체 금지** (`[date]` cross-check) — `SingleDate: {}` / `StartDate: {}` / `EndDate: {}` 처럼 `Ckeys` 누락된 빈 객체는 런타임 `dlgJson.SingleDate.Ckeys` / `dlgJson.StartDate.Ckeys` / `dlgJson.EndDate.Ckeys` 접근 시 TypeError. 분기 키 객체는 항상 `Ckeys: ["..."]` 와 함께 채울 것.

## CalendarType별 분기 요약

| CalendarType | DateFormat | SelectType | Ckeys 위치 | 용도 |
|---|---|---|---|---|
| `dayCalendar` | `""` / `YYYY-MM-DD` / `YYYY.MM.DD` / `YYYY/MM/DD` | `SingleDate` 또는 `FromTo` | SingleDate.Ckeys 또는 StartDate.Ckeys + EndDate.Ckeys | 일 picker / 기간 picker |
| `monthCalendar` | `""` 또는 `YYYY-MM` | `SingleDate` 만 | SingleDate.Ckeys | 월 picker |
| `yearCalendar` | `""` (기본) | `SingleDate` 만 | SingleDate.Ckeys | 년 picker |

### 예시 — monthCalendar (단일 월 선택)

```jsonc
{
  "ControlType": "InputDate",
  "DateFormat": "YYYY-MM",
  "Ckeys": ["AppMonth"],
  "Dialog": {
    "Layouts": [{
      "ContentsType": "Layout",
      "Controls": [{
        "ControlType": "Calendar",
        "CalendarType": "monthCalendar",
        "SelectType": "SingleDate",
        "SingleDate": { "Ckeys": ["AppMonth"] },
        "Id": "f_36"
      }]
    }]
  }
}
```

### 예시 — dayCalendar + FromTo (기간 선택)

```jsonc
{
  "ControlType": "InputDate",
  "DateFormat": "YYYY-MM-DD",
  "Dialog": {
    "Layouts": [{
      "ContentsType": "Layout",
      "Controls": [{
        "ControlType": "Calendar",
        "CalendarType": "dayCalendar",
        "SelectType": "FromTo",
        "StartDate": { "Ckeys": ["FromDate"] },
        "EndDate":   { "Ckeys": ["ToDate"] },
        "Id": "f_37"
      }]
    }]
  }
}
```

> InputDate 본체의 `Ckeys` 는 `SingleDate` 모드에서만 의미있음. `FromTo` 모드는 자식 Calendar 의 `StartDate.Ckeys` + `EndDate.Ckeys` 가 실 바인딩 키.

## 데이터 바인딩

`SingleDate.Ckeys` / `StartDate.Ckeys` / `EndDate.Ckeys` 는 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 이 있어야 동작 (직접 부모가 아닌 조상 Group 도 OK).

InputDate 본체의 `Ckeys` 와 자식 Calendar 의 `SingleDate.Ckeys` 는 같은 필드명을 권장 (서로 동기화).

## DisplayType / DisplayValue (InputDate 본체)

InputDate 의 표시는 본질적으로 자식 Calendar 의 `Ckeys` + 본체 `DateFormat` 이 결정 — 본체 `DisplayValue` 는 **빈 문자열 `""`** 두는 패턴이 대다수 (DateFormat 기반 자동 표시).

| 키 | 일반 패턴 |
|---|---|
| `DisplayType` | 생략 (default `"CtrlDisplayCkey"`). |
| `DisplayValue` | `""` 빈 문자열 — 런타임 기본 (DateFormat 적용). |
| `CtrlDisplayCkey` | 생략. (자식 Calendar 의 `SingleDate.Ckeys` 가 표시 필드 역할.) |

선택값을 다른 표현식으로 가공하고 싶으면 `DisplayType: "DisplayValue"` + `DisplayValue: "{=Field}"` 로 명시. inputBase 의 DisplayType 두 모드는 [combo.md DisplayType 섹션](combo.md) 참조.

## 이벤트 (제한)

**InputDate 본체가 아니라 자식 Calendar (`Dialog.Layouts[0].Controls[0]`) 안에 둠.** 본체에 `UseEvents`/`Events` 두면 validate.mjs `[event]` cross-check 로 차단.

`Events` 는 `_base.schema.json#/$defs/dateEvents` 가 적용. `DateOrder` enum: `DialogClose` 만.

```jsonc
{
  "ControlType": "Calendar",
  "UseEvents": true,
  "Events": {
    "DateOrder": ["DialogClose"],
    "DialogClose": "ON_DATE_SELECTED"
  }
}
```

## 함정

- **`CalendarType` 위치** — 본체가 아니라 자식 Calendar 컨트롤. 본체에 두면 무시됨.
- `monthCalendar` 면 `DateFormat: "YYYY-MM"` 으로 맞춰야 일관됨 (validate.mjs 후검증으로 차단).
- `FromTo` 모드는 `dayCalendar` 에서만 사용. 월/년 picker 에는 의미없음 — schema if/then 으로 차단.
- 자식 Calendar 의 `Id` 도 시나리오 전체 유일성 검증 대상.
- `Ckeys` 와 `SingleDate.Ckeys` 가 다르면 양쪽이 서로 다른 필드를 가리키게 되어 동기화 실패 — 같은 값 권장.
