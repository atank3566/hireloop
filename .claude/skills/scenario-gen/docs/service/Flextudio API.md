# Flextudio API Service (Flextudio API.schema.json)

`SystemID:'Flextudio API'` (공백 포함) — Flextudio 사용자/메시지/그룹 도메인의 **REST API** 호출. const.js `SYSTEM_ID.FLEXTUDIO_API='Flextudio API'`. `flexApiKey` 인증 기반.

런타임 구현: [`public/system/flextudio/flextudio_api.js`](../../../../public/system/flextudio/flextudio_api.js).

> **스킬 생성에서는 사용 금지** — `[no-service]` 가 차단.
> **`Flextudio` ([`Flextudio.md`](Flextudio.md)) 와 다름!** `flexApiKey` 가 필수, REST 호출 형태. ModuleID 도 다름 (User/Message/Group ↔ GetUserList/QueryMessage/SendMessage).

## 1. ModuleID + SubModuleID 매트릭스

| ModuleID | SubModuleID | HTTP | Path | 의미 |
|---|---|---|---|---|
| `User` | `Query` | GET | `/v1/company/{companyID}/users` | 사용자 목록 조회 (검색/페이지네이션 지원) |
| `User` | `Save` | POST | `/v1/company/{companyID}/users` | 사용자 신규 등록 |
| `User` | `Update` | PATCH | `/v1/company/{companyID}/users` | 사용자 갱신 |
| `User` | `Delete` | DELETE | `/v1/company/{companyID}/users/{...}` | 사용자 삭제 |
| `Message` | `Query` | GET | `/v1/app/message` | 메시지 조회 (읽지 않음 필터 옵션) |
| `Group` | `UserQuery` | GET | `/v1/company/{companyID}/groups/{groupName}/users` | 특정 그룹의 회원 조회 |

> SubModuleID 는 메타에서 별도 `SubModuleID` 필드로 박힌다 (`SB_SUB_MODULE_ID="SubModuleID"`).

## 2. 식별 필드 (필수)

| 필드 | 값 | 비고 |
|---|---|---|
| `SystemID` | `"Flextudio API"` (공백 포함, 고정) | const |
| `ModuleID` | `User` / `Message` / `Group` | enum |
| `SubModuleID` | 위 표 참조 | ModuleID 별 분기 |
| `flexApiKey` | string | **필수** — HTTP 헤더 `x-flex-api-key` 로 전송 |

## 3. 모듈별 추가 속성 (const.js K_FLEXTUDIO_API_PROP)

| 속성 | 적용 모듈 | 의미 |
|---|---|---|
| `flexApiKey` | 모두 | API 인증 키 (필수) |
| `useUserAppGrant` | User Save | 현재 앱 사용 권한 자동 부여 (`_base.appid` 함께 전송) |
| `UseSearch` | User Query | 검색 모드 토글 |
| `SearchItem[]` | User Query | 검색 조건 배열 (`UseSearch:true` 일 때) |
| `UseUnreadMessage` | Message Query | 읽지 않은 메시지만 |
| `groupName` | Group UserQuery (필수) | 대상 그룹 이름 (`{% %}` 표현식 가능) |

### 3.1 SearchItem 구조

```jsonc
"SearchItem": [
  { "FieldName": "DepartmentSeq",  "SearchFilter": "==",       "FieldValue": "deptSeq" },
  { "FieldName": "Name",           "SearchFilter": "contains", "FieldValue": "keyword" }
]
```

| 필드 | 의미 |
|---|---|
| `FieldName` | 서버 필드명 |
| `SearchFilter` | 연산자 — `contains` / `!contains` / `exists` / `!exists` / `==` / `!=` / `<` / `<=` / `>` / `>=` (const.js `K_FLEXTUDIO_API_USER_FILTER`) |
| `FieldValue` | sector(섹터) 의 키 이름 — 그 키의 값으로 비교 |

## 4. 형태 — User Query (검색 + 페이지네이션)

```jsonc
"ServiceBinding": {
  "QueryActiveUsers": {
    "SystemID":     "Flextudio API",
    "ModuleID":     "User",
    "SubModuleID":  "Query",
    "flexApiKey":   "{% _base.flextudio.flexApiKey %}",
    "UseSearch":    true,
    "SearchItem": [
      { "FieldName": "Status", "SearchFilter": "==", "FieldValue": "userStatus" }
    ],
    "SetCategory":    true,
    "UsePKey":        true,
    "UseParamBlock":  true,
    "UseResultBlock": true
  }
}
```

호출 측 Action:

```jsonc
{
  "Action":         "Service",
  "ServiceBinding": "QueryActiveUsers",
  "ServiceName":    "QueryActiveUsers",
  "SystemID":       "Flextudio API",
  "ParamBlocks":    [
    {
      "CategoryName": "queryFilter",
      "UseFilter":    false
    }
  ],
  "ResultBlocks":   [
    { "TargetType": "replace", "CategoryName": "userList" }
  ]
}
```

## 5. 형태 — User Save (앱 권한 자동 부여)

```jsonc
{
  "SystemID":         "Flextudio API",
  "ModuleID":         "User",
  "SubModuleID":      "Save",
  "flexApiKey":       "{% _base.flextudio.flexApiKey %}",
  "useUserAppGrant":  true
}
```

ParamBlock1 의 모든 섹터가 `body.userData` 로 직렬화되어 POST 발송.

## 6. 형태 — Group UserQuery (특정 그룹 회원 조회)

```jsonc
{
  "SystemID":     "Flextudio API",
  "ModuleID":     "Group",
  "SubModuleID":  "UserQuery",
  "flexApiKey":   "{% _base.flextudio.flexApiKey %}",
  "groupName":    "{%_c.activeGroup[0].groupName%}"
}
```

## 7. 모듈별 데이터 흐름

| 모듈/SubModule | 보내는 데이터 | 받는 데이터 |
|---|---|---|
| `User.Query` | ParamBlock1[0][0] 의 첫 섹터 → 쿼리 파라미터 | `Items[]` + `pagination` (별도 ResultBlock 으로) |
| `User.Save` | ParamBlock1 의 모든 섹터 → `body.userData` | 저장된 사용자 목록 |
| `User.Update` | ParamBlock1 의 모든 섹터 → `body.userData` | 갱신된 사용자 목록 |
| `User.Delete` | ParamBlock1[0] → URL path 의 사용자 ID | 삭제 결과 |
| `Message.Query` | ParamBlock1[0][0] → 쿼리 파라미터 (UseUnreadMessage 옵션) | `Items[]` |
| `Group.UserQuery` | (ParamBlock 미사용) | `Items[]` (그룹 회원 목록) |

## 8. 인증 / 헤더

| HTTP 헤더 | 값 |
|---|---|
| `Content-Type` | `application/json` |
| `x-flex-api-key` | `flexApiKey` 의 값 |
| `fRequestID` | 자동 발급 |
| `Flex-Offline` | `methodMeta.flexOffline` (선택, 오프라인 큐 모드) |
| `Flex-Submission` | (선택) 오프라인 모드 한정 |
| `Flex-Source` | (선택) |
| `Flex-Mapper` | JSON.stringify(매퍼) (선택) |

## 9. 검증 규칙 (스키마 강제)

| 규칙 | 동작 |
|---|---|
| `SystemID === 'Flextudio API'` const | 공백 포함 정확 일치 |
| `ModuleID` enum 3종 | `User` / `Message` / `Group` |
| `flexApiKey` minLength 1 | 빈 키 거부 |
| `User` 모듈 → `SubModuleID` ∈ `Query`/`Save`/`Update`/`Delete` 필수 | if/then |
| `Message` 모듈 → `SubModuleID:'Query'` 필수 | if/then |
| `Group` 모듈 → `SubModuleID:'UserQuery'` + `groupName` 필수 | if/then |

## 10. `Flextudio` vs `Flextudio API` 비교

자세한 비교는 [`Flextudio.md §6`](Flextudio.md) 참조.
