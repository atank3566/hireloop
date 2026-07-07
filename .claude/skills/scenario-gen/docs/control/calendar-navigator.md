# CalendarNavigator

> 공식 가이드: <https://docs.flextudio.com/flextudio/scenario/component/control/calendarnavigator>

캘린더 네비게이터 — 월·주·일 단위로 날짜 범위를 이동하면서 선택한 날짜를 컬렉션에 바인딩한다. 사용 형태는 두 가지.

| 형태 | UseTimeTable | 위치 |
|---|---|---|
| **TimeTable 내부 자식** | `true` | `TimeTable.CalendarNavigator.Controls[*]` |
| **독립 컨트롤** | `false` | Group 직접 자식 (래퍼 그룹은 `UseDataConnection: true` 필수) |

## 스키마

`control/calendar-navigator.schema.json` — `controlBase` 위에 분기 키.

## 핵심 속성

| 속성 | 값 | 설명 |
|---|---|---|
| `ControlStyle` | `""` / `"None"` / `"StyleBack"` / `"StyleHalf"` / `"StyleAlignLeft"` | 공식 4종 스타일. |
| `NavigatorType` | `"Month"` / `"WeekPeriod"` / `"Day"` | **공식 3종.** 월/주/일 단위. (`Custom` 은 공식 가이드 미표기 — **AI 생성 사용 금지.** 운영 메타에 보일 수는 있으나 신규 생성 시 enum 차단.) |
| `UseDaySelector` | `true` / `false` | 주간 날짜 선택 바(스와이프 지원). **boolean strict** — 문자열 `"true"`/`"false"` 금지. 값에 따라 바인딩 키가 갈림: `true` → `SingleDate.Ckeys`, `false` → `StartDate.Ckeys` + `EndDate.Ckeys`. |
| `UseTimeTable` | `true` / `false` | 독립 사용 시 `false`. |
| `NavigatorDateFormat` | 공식 10종 (아래) | 헤더 날짜 표시 포맷. |
| `SingleDate.Ckeys` | 배열 | Day 모드 또는 `UseDaySelector=true` 의 단일 날짜 바인딩. |
| `StartDate.Ckeys` / `EndDate.Ckeys` | 배열 | WeekPeriod / Month 모드의 기간 바인딩 (스키마 if/then 으로 두 키 동시 필수). |
| `DefaultValue` | string | 초기 날짜값 (미지정 시 오늘). |

### NavigatorDateFormat — 공식 10종

| 값 | 분류 | 비고 |
|---|---|---|
| `YYYY.MM.DD` / `YYYY/MM/DD` / `YYYY-MM-DD` / `YYYY년MM월DD일` | 일 단위 | Day / WeekPeriod / Month 모두 가능. |
| `YYYY-MM-W` | 주 단위 | **`NavigatorType: "WeekPeriod"` 전용** (스키마 if/then 차단). |
| `YYYY.MM` / `YYYY/MM` / `YYYY-MM` / `YYYY년MM월` | 월 단위 | 보통 Month 모드와 짝. |
| `YYYY년` | 년 단위 | |
| `""` | — | 런타임 기본 포맷. |

## 빈 객체라도 필수인 속성 (런타임 규약)

- `Events`
- `DayArea`
- `DaySetting`
- `SelectDay`
- `UseEvents`

스키마에서 `required` 로 강제. 누락 시 런타임 에러.

## 이벤트

`Events.CalendarNaviEventsOrder` 로 등록. 등록한 이벤트명에 동명 핸들러 필수 (if/then).

| 이벤트 | 발생 시점 |
|---|---|
| `ClickPrevNextBtn` | 이전/다음 버튼 클릭. |
| `OnChangeSwipe` | DaySelector 스와이프로 주 변경. |
| `SelectDay` | DaySelector 에서 날짜 클릭. |

## 예시 — 독립 컨트롤 (WeekPeriod)

```jsonc
{
  "ContentsName": "calNavWrap",
  "ContentsType": "Group",
  "UseDataConnection": true,
  "DataConnection": {
    "TargetType": "category",
    "DataUsage": "default",
    "CategoryName": "CtgCalNav",
    "UseNewSector": true,
    "OnlyIfNoSector": true
  },
  "Id": "f_70",
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "MatchText": true, "SizeValue": "" },
  "Contents": [{
    "ControlType": "CalendarNavigator",
    "ControlDefaultName": "CalNav1",
    "ControlName2": "CalNav1",
    "Caption": "CalNav1",
    "Id": "f_71",
    "NavigatorType": "WeekPeriod",
    "UseDaySelector": true,
    "UseTimeTable": false,
    "Width":  { "SizeValue": 100, "SizeUnit": "%" },
    "Height": { "MatchText": true, "SizeValue": "" },
    "SingleDate": { "Ckeys": ["SelectDate"] },
    "StartDate":  { "Ckeys": ["StartDate"] },
    "EndDate":    { "Ckeys": ["EndDate"] },
    "Events": {
      "CalendarNaviEventsOrder": ["ClickPrevNextBtn", "SelectDay"],
      "ClickPrevNextBtn": "NavChange_E",
      "SelectDay":        "DaySelect_E"
    },
    "DayArea":    {},
    "DaySetting": {},
    "SelectDay":  {},
    "UseEvents":  true,
    "isColumnCtrl": false
  }]
}
```

## 예시 — TimeTable 내부 자식

```jsonc
{
  "ControlType": "TimeTable",
  "UseCalendarNavigator": true,
  "CalendarNavigator": {
    "Controls": [{
      "ControlType": "CalendarNavigator",
      "UseDaySelector": true,
      "UseTimeTable": true,
      "NavigatorType": "Month",
      "Width":  { "SizeValue": 100, "SizeUnit": "%" },
      "Height": { "MatchText": true, "SizeValue": "" },
      "Events": { "CalendarNaviEventsOrder": [] },
      "DayArea": {},
      "DaySetting": {},
      "SelectDay": {},
      "SingleDate": { "Ckeys": ["SelectDate"] },
      "UseEvents": false,
      "Id": "f_72"
    }]
  },
  "...": "..."
}
```

## 데이터 바인딩

- 독립 사용 시 **반드시 래퍼 Group 에 `UseDataConnection: true`** + `DataConnection.CategoryName` 설정. `SingleDate/StartDate/EndDate.Ckeys` 가 그 카테고리의 섹터에 자동 저장.
- TimeTable 내부 사용 시 TimeTable 의 래퍼 Group 카테고리를 공유 (별도 카테고리 불필요).

## 함정

- 빈 객체라도 `Events`, `DayArea`, `DaySetting`, `SelectDay`, `UseEvents` 누락 시 런타임 에러.
- 독립 사용 시 `UseTimeTable: false` 명시 — 누락 시 TimeTable 컨텍스트로 오인.
- WeekPeriod / Month 모드에서 `StartDate.Ckeys` 또는 `EndDate.Ckeys` 누락 → 기간 필터 동작 안 함 (스키마 if/then 으로 차단).
- 날짜 변경 핸들러(`SelectDay`/`ClickPrevNextBtn`)에서 리스트 reload 시 래퍼 Group Id 사용 — 컨트롤 자체 reload 불가.
- **`NavigatorType: "Custom"` 사용 금지** — 공식 가이드 미표기. AI 생성 메타에는 절대 등장 금지 (스키마 enum 으로 차단).
- `NavigatorDateFormat: "YYYY-MM-W"` 는 반드시 `NavigatorType: "WeekPeriod"` 와 짝 (스키마 if/then 으로 차단).
