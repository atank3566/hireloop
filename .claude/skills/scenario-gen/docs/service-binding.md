# ServiceBinding (service-binding.schema.json)

`scenarioMeta.ServiceBinding` — 서비스 호출 정의 맵. 키는 서비스 식별자, 값은 SystemID/ModuleID 등 호출 정의.
DB / 외부 API 호출은 이 맵의 항목을 통해 이루어진다. `Events.X[*].Action='Service'` 의 `ServiceBinding` 필드가 이 맵의 키를 참조한다.

> **참고 문서**: [docs.flextudio.com — Event 와 Service](https://docs.flextudio.com/flextudio/concept/eventservice). 흐름: Event 호출 → Service 호출 → DB 조회 → 결과를 컬렉션 카테고리에 저장 → Step 재로드.
> **schema ↔ md 동기화**: 본 md 의 표/필드는 `service-binding.schema.json` 과 1:1 일치해야 한다. 실 샘플 99 항목 통계 기반.

---

## 1. 핵심 규칙 — 스킬 생성 시 비어있는 객체 강제

```jsonc
"ServiceBinding": {}      // 스킬 생성 — 항상 빈 객체
```

- AI 가 생성하는 메타에는 `ServiceBinding` 항목을 박지 말 것.
- 서비스 호출 (`Action: 'Service'` / `'API'`) 도 같이 금지.
- 데이터 샘플은 `DataSources` 의 `Fixed` / `Grid` 만 사용.
- 검증: `[no-service]` (`strict_no_service:true` 기본). 운영 메타 검증은 `false` 로 비활성.

서비스 구성은 **운영 단계에서 사용자/스튜디오가 직접 추가**. AI 가 임의로 SystemID/ModuleID/SQL 이름을 만들어 박으면 실제로 존재하지 않는 서비스 참조가 되어 런타임 실패.

---

## 2. 키 규칙

| 항목 | 규칙 |
|---|---|
| 키 패턴 | `^[A-Za-z_][A-Za-z0-9_]*$` (영문/숫자/언더스코어, 첫 글자 영문/언더스코어) |
| 실 샘플 예 | `Query_Menu`, `Save_Cart`, `getList`, `chooseIdea`, `BookingEventQuery`, `UsualCostAppQuery_S`, `WkVactionAppSave_S`, `Delete_MenuLike` |
| 네이밍 관례 | 동작_대상 (`Query_*` 조회, `Save_*` 저장, `Delete_*` 삭제, `*_S` 접미사 = Service 표기) — 강제 아님 |

---

## 3. 항목 형태

```jsonc
"ServiceBinding": {
  "VactionDaysQuery_S": {
    "SystemID":         "Other",
    "SystemType":       "FlexSQL",
    "ModuleID":         "VactionDaysQuery",
    "ServiceName":      "VactionDaysQuery",
    "SQLServiceName":   "VactionDaysQuery",
    "MajorVersion":     2,
    "ExternalDB":       "",
    "UsePKey":          false,
    "UseParamBlock":    true,
    "UseResultBlock":   true,
    "UseInnerBlock":    false,
    "UseSearch":        false,
    "UseBundle":        false,
    "NotSeperateInnerBlock": false,
    "SetCategory":      "CtgVactionDays",
    "fEvent":           "",
    "fEventKey":        "",
    "BeforeScript":     "",
    "ResultScript":     "",
    "Method":           "",
    "Url":              "",
    "RequestHeader":    {},
    "ParamScript":      "",
    "SelectTable":      "",
    "SPList":           [],
    "UseTable":         false
  }
}
```

### 3.1 핵심 필드

| 필드 | 타입 | 의미 / 비고 |
|---|---|---|
| `SystemID` | string | 시스템 식별자. 실 샘플: `Flextudio` (자체) / `Other` (커스텀) / `FlexSQL` |
| `SystemType` | string | 시스템 종류 (`FlexSQL` / `Firestore` / `FlexAutoQuery` / `GoogleSheet`) |
| `ModuleID` | string | 모듈 식별자 (필수) |
| `ServiceName` | string | 서비스 이름 — `Action:'Service'` 의 `ServiceName` 과 매칭 |
| `SQLServiceName` | string | FlexSQL 사용 시 등록된 SQL 서비스 이름 |
| `MajorVersion` | integer (≥1) | 서비스 버전. 정수만 허용 (소수/문자열 금지). 보통 1 또는 2 |
| `ExternalDB` | string | 외부 DB 식별자 |
| `UseTable` | boolean | 테이블 직접 사용 (FlexAutoQuery) |
| `SelectTable` | string\|object | FlexAutoQuery 대상 테이블 |
| `SPList` | array | 스토어드 프로시저 목록 (FlexAutoQuery) |

### 3.2 토글 필드

| 필드 | 의미 |
|---|---|
| `UsePKey` | Primary Key 사용 |
| `UseParamBlock` | 파라미터 블록 사용 |
| `UseResultBlock` | 결과 블록 사용 |
| `UseInnerBlock` | 내부 블록 (반복) 사용 |
| `UseSearch` | 검색 모드 |
| `UseBundle` | 번들 호출 |
| `NotSeperateInnerBlock` | 내부 블록 분리 안 함 |

### 3.3 결과/스크립트 필드

| 필드 | 의미 |
|---|---|
| `SetCategory` | 결과 반영 대상 카테고리 이름 (`Ctg<Name>`) |
| `BeforeScript` | FlexSQL Before Script — 호출 전 전처리 (param 가공 등) |
| `ResultScript` | FlexSQL After Script — 결과 후처리 (반환 데이터 가공) |
| `ParamScript` | 파라미터 스크립트 (외부 API) |
| `fEvent` / `fEventKey` | 이벤트 연결 키 |

### 3.4 외부 REST API 필드 (HTTP 호출)

| 필드 | 의미 |
|---|---|
| `Method` | HTTP 메서드 — `GET` / `POST` / `PUT` / `DELETE` / `PATCH` / `""` |
| `Url` | 호출 대상 URL |
| `RequestHeader` | 요청 헤더 객체 (`{ "Authorization": "...", "Content-Type": "application/json" }`) |

---

## 4. 지원 시스템 (flextudio-guide §6.6 ~ §6.8)

| 시스템 | 설명 | 비고 |
|---|---|---|
| **FlexSQL** | 워크스페이스 콘솔에서 등록한 쿼리 호출 | Business 플랜 이상. FlexDB / MySQL / Azure MSSQL 지원. Before/After Script 로 전후처리 |
| **FlexAutoQuery** | FlexSQL 없이 FlexDB CRUD 자동 구성 | 자동생성 테이블만. 기본 컬럼: `DataSeq`, `CreateDate`, `CreateUserID`, `UpdateDate`, `UpdateUserID`, `TenantID` |
| **Firestore** | Google Firestore 직접 연동 | |
| **GoogleSheet** | 구글 시트 데이터 사용 | |
| 외부 REST API | `Method` + `Url` + `RequestHeader` 로 호출 | |

---

## 5. Action ↔ ServiceBinding 연결

`Action.ServiceBinding` 필드는 두 가지 형태가 가능:

### 5.1 String 참조 — `scenario.ServiceBinding` 의 키 지목 (권장)

```jsonc
"ServiceBinding": {
  "VactionDaysQuery_S": {
    "SystemID": "Other", "ModuleID": "VactionDaysQuery", "MajorVersion": 2,
    "UsePKey": false, "UseParamBlock": true, "UseResultBlock": true
  }
},
"Events": {
  "loadVactionDays": [
    {
      "Action":         "Service",
      "ServiceBinding": "VactionDaysQuery_S",   // ← scenario.ServiceBinding 의 키
      "ServiceName":    "VactionDaysQuery",
      "SystemID":       "Other",
      "Version":        2,
      "ParamBlocks":    [
        { "CategoryName": "userInfo", "UseFilter": true,
          "Filters": [{ "FilterType": "Status", "Status": ["active"] }] }
      ],
      "ResultBlocks":   [
        { "TargetType": "replace", "CategoryName": "vactionDays" }
      ]
    }
  ]
}
```

### 5.2 Inline 객체 — Action 안에 직접 박는 형태 (실 FlexSQL 패턴)

```jsonc
"Events": {
  "showReceiveWho": [
    {
      "Action": "Service",
      "Version": 2,
      "SystemID": "FlexSQL",
      "ServiceBinding": {                         // ← inline ServiceBinding
        "SystemID":             "FlexSQL",
        "SetCategory":          true,
        "ModuleID":             "Default",
        "UsePKey":              true,
        "UseInnerBlock":        true,
        "UseParamBlock":        true,
        "UseResultBlock":       true,
        "NotSeperateInnerBlock":true,
        "ExternalDB":           true,
        "SQLServiceName":       "메인화면:showReceiveWho",
        "MajorVersion":         1
      },
      "UseCategory": true,
      "ParamBlocks": [
        { "UseFilter":true, "CategoryName":"", "Filters":[{"FilterType":"Status","Status":["active"]}] }
      ],
      "ResultBlocks": [
        { "TargetType":"replace", "CategoryName":"showReceiveWho" }
      ]
    }
  ]
}
```

이 형태에서는 `scenario.ServiceBinding` 맵에 별도 등록 없이 인라인으로 동작한다. FlexSQL `SQLServiceName`(`Scenario:ServiceName` 콜론 표기) 직접 호출 시 흔함.

### 5.3 ParamBlocks / ResultBlocks 형식

자세한 형식은 [`events.md §2.3.1 / §2.3.2`](events.md) 참조.

| 항목 | 형식 |
|---|---|
| ParamBlock | `{ CategoryName, UseFilter, Filters[], UserData[], UserFilterOption }` |
| ResultBlock | `{ TargetType: category\|replace\|add\|merge, CategoryName, PKeys[] (merge 시), IsNotDelete }` |
| InnerBlock | `{ InnerBlockKey }` |

> 본 항목은 **운영 메타** 에서의 형식 정의이며, 스킬 생성에서는 `[no-service]` 가 Service / API Action 자체를 거부한다.

---

## 6. 검증 후크 정합

| Tag | 위치 | 동작 |
|---|---|---|
| `[no-service]` | `validators.mjs` `checkNoService` | (a) ServiceBinding 비어있는 객체만, (b) Action='Service'/'API' 거부, (c) DataSourceType:'Service'/'API' 거부 |
| `[strict-fields]` | strict Ajv 패스 | 위 표에 없는 필드명을 박으면 거부 |

---

## 7. 운영 메타 검증

```bash
node validate.mjs --strict-no-service=false path/to/operational.json
```

이 모드에서 ServiceBinding 항목 / Service / API 액션 / DataSource 'Service'/'API' 모두 통과.
