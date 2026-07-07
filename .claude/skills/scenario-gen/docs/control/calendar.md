# Calendar

> 공식 가이드(DatePicker): <https://docs.flextudio.com/flextudio/scenario/component/control/datepicker>

캘린더 컨트롤. 두 가지 사용 형태가 있고, **둘 다 v1 명시 분기**다.

| 형태 | 위치 | 비고 |
|---|---|---|
| **InputDate 자식** | `InputDate.Dialog.Layouts[*].Controls[*]` | 다이얼로그 picker. `CalendarType` / `SelectType` 은 InputDate 본체가 아니라 자식 Calendar 에 위치. |
| **단독** | Group 직접 자식 (`Step.Contents[…].Controls[…]`) | 인라인 캘린더. Group 안에 Control 로 그대로 배치 — OtherControl 이 아닌 `control/calendar.schema.json` 분기 사용. |

본체 정의는 `_base.schema.json#/$defs/calendarControl` 에 있고, 단독·자식 양쪽이 동일 분기를 공유한다 — InputDate 의 자식으로는 `dialogLayout` 의 if/then 으로, 단독으로는 `control/calendar.schema.json` 으로 적용.

## 스키마

`control/calendar.schema.json` — `controlBase` + `calendarControl` 의 합. `ControlType="Calendar"` const.

## CalendarType / SelectType 매트릭스

| CalendarType | DateFormat 짝 | SelectType | Ckeys 위치 |
|---|---|---|---|
| `dayCalendar` | `""` / `YYYY-MM-DD` / `YYYY.MM.DD` / `YYYY/MM/DD` | `SingleDate` 또는 `FromTo` | SingleDate.Ckeys 또는 StartDate.Ckeys + EndDate.Ckeys |
| `monthCalendar` | `""` 또는 `YYYY-MM` | `SingleDate` 만 | SingleDate.Ckeys |
| `yearCalendar` | `""` (기본) | `SingleDate` 만 | SingleDate.Ckeys |

스키마 if/then + `[date]` cross-check 강제:

- `SelectType="SingleDate"` → `SingleDate` **객체는 항상 필수**. `SingleDate.Ckeys` 는 **조상(또는 자기) Group 이 `UseDataConnection:true` 인 데이터연결 컨텍스트에서만 1개 이상 필수** — 비연결(프로토타이핑) 캘린더면 `"Ckeys": []` 허용. (단 `Ckeys` 키 자체는 항상 둘 것 — `SingleDate: {}` 빈 객체는 런타임 `dlgJson.SingleDate.Ckeys` 접근 시 TypeError.)
- `SelectType="FromTo"` → `StartDate` + `EndDate` **객체 모두 항상 필수**. 각 `Ckeys` 도 동일 규칙 — 데이터연결 컨텍스트면 1개 이상, 비연결이면 `[]`.
- `CalendarType ∈ {monthCalendar, yearCalendar}` → `SelectType` 은 `SingleDate` 만.

> ★ **빈 객체 금지** (`[date]` cross-check) — `SingleDate: {}` / `StartDate: {}` / `EndDate: {}` 처럼 `Ckeys` 누락된 빈 객체는 런타임 `dlgJson.SingleDate.Ckeys` / `dlgJson.StartDate.Ckeys` / `dlgJson.EndDate.Ckeys` 접근 시 TypeError 를 일으킨다. 분기 키 객체는 항상 `Ckeys: ["..."]` 와 함께 채울 것.

## 예시 — InputDate 자식 (가장 일반)

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
        "SelectType": "SingleDate",
        "SingleDate": { "Ckeys": ["AppDate"] },
        "Id": "f_35"
      }]
    }]
  }
}
```

## 예시 — 단독 (인라인 캘린더)

Group `Controls[]` 에 직접 배치. 운영 메타에서는 최소 6키만으로도 등장 (`Width`/`Height`/`isColumnCtrl` 생략 형태).

```jsonc
{
  "ControlType": "Calendar",
  "CalendarType": "dayCalendar",
  "SelectType": "SingleDate",
  "SingleDate": { "Ckeys": [] },
  "ControlName2": "Calendar1",
  "Caption": "Calendar1",
  "Id": "f_4128"
}
```

AI 생성 시에는 controlBase 권장 키 (`ControlDefaultName`/`ControlName2`/`Width`/`Height`) 까지 채워 다음과 같이:

```jsonc
{
  "ControlType": "Calendar",
  "CalendarType": "dayCalendar",
  "SelectType": "SingleDate",
  "SingleDate": { "Ckeys": ["SelectDate"] },
  "ControlDefaultName": "Calendar1",
  "ControlName2": "Calendar1",
  "Caption": "Calendar1",
  "Id": "f_60",
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "MatchText": true, "SizeValue": "" },
  "isColumnCtrl": false
}
```

## 예시 — FromTo (기간 선택, dayCalendar 전용)

```jsonc
{
  "ControlType": "Calendar",
  "CalendarType": "dayCalendar",
  "SelectType": "FromTo",
  "StartDate": { "Ckeys": ["FromDate"] },
  "EndDate":   { "Ckeys": ["ToDate"] },
  "Id": "f_61"
}
```

## 데이터 바인딩

`SingleDate.Ckeys` / `StartDate.Ckeys` / `EndDate.Ckeys` 는 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 이 있어야 동작 (직접 부모 아닌 조상 Group 도 OK).

## 이벤트

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

> InputDate 본체에 `UseEvents`/`Events` 두면 안 됨 — 자식 Calendar 안에 둔다.

## 함정

- **`CalendarType` 위치** — InputDate 본체가 아니라 자식 Calendar.
- `monthCalendar` 면 `DateFormat` 은 `""` 또는 `"YYYY-MM"` 만 (validate.mjs cross-check).
- `FromTo` 는 `dayCalendar` 전용 — 월/년 picker 에서는 if/then 차단.
- `Id` 는 시나리오 전체 유일성 검증 대상.
