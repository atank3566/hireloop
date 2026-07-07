# FlexAutoQuery Service (FlexAutoQuery.schema.json)

`SystemID:'FlexAutoQuery'` — FlexSQL 없이 **FlexDB 자동생성 테이블에 대한 CRUD 자동 구성**. 카테고리 연결/수정 시 "AI로 DB연결하기" 로 생성된 테이블 전용.

> **참고**: [docs.flextudio.com — FlexAutoQuery](https://docs.flextudio.com/flextudio/scenario/dev-mode/service/flexautoquery), flextudio-guide §6.8.
> **스킬 생성에서는 사용 금지** — `[no-service]` 가 차단.
> **Business 플랜 이상** 필요.

## 1. 사용 시점

- "AI로 DB연결하기" 로 자동생성된 테이블의 단순 CRUD.
- 별도 SQL 작성 없이 빠른 조회/저장/갱신/삭제.
- **새로 추가되는 컬럼은 자동 연결 끊어짐** — 추가 컬럼 사용하려면 FlexSQL 갱신 필요.

## 2. 자동생성 테이블의 기본 컬럼

| 컬럼 | 타입 | 의미 |
|---|---|---|
| `DataSeq` | number | 자동 증가 PK |
| `CreateDate` | datetime | 생성 시각 |
| `CreateUserID` | string | 생성자 |
| `UpdateDate` | datetime | 갱신 시각 |
| `UpdateUserID` | string | 갱신자 |
| `TenantID` | string | 테넌트 식별자 (멀티테넌트) |

## 3. 식별 필드

| 필드 | 값 | 비고 |
|---|---|---|
| `SystemID` | `"FlexAutoQuery"` (고정) | const |
| `ModuleID` | `"Default"` | const.js 상 단일 모듈 |
| `ServiceType` | `Query` / `Save` / `Update` / `Delete` | 서비스 유형 |
| `TargetTable` | string | 자동생성 테이블 이름 |
| `OrderBy` / `OrderDirection` | string | 정렬 (Query 전용) |

## 4. 서비스 유형 4종 (docs.flextudio.com)

| 유형 | 동작 | 보내는 데이터 | 받는 데이터 |
|---|---|---|---|
| `Query` | SELECT | **ParamBlock1 의 첫 번째 섹터** = 검색 조건 | 조회된 데이터 |
| `Save` | INSERT | **ParamBlock1 의 모든 섹터** (테이블 컬럼명과 일치 항목만) | 저장된 데이터 + `_SUID` |
| `Update` | UPDATE | **ParamBlock1 의 모든 섹터** (컬럼명 일치 항목만) | 업데이트 결과 + `_SUID` |
| `Delete` | DELETE | **ParamBlock1 의 모든 섹터** | 삭제 결과 + `_SUID` |

> **테이블 컬럼명과 일치하는 항목만 자동 매핑** — 컬렉션의 다른 필드는 무시됨.

## 5. Query — 검색 (3가지 모드)

### 5.1 키워드 검색

지원 연산자 (FlexAutoQuery 전용 — Firestore 의 `==` 와 다름):

| 연산자 | 의미 |
|---|---|
| `=` / `!=` | 같음 / 같지 않음 |
| `<` / `<=` / `>` / `>=` | 비교 |
| `LIKE` / `NOT LIKE` | 부분 일치 |
| `IS NULL` / `IS NOT NULL` | NULL 체크 |

```jsonc
"Filters": [
  { "FilterType": "Condition", "ConditionOperators": "LIKE",
    "ConditionKey": "Title", "ConditionValue": "{%_c.searchInput[0].keyword%}" }
]
```

### 5.2 기간 검색

시작일/종료일 컬렉션 키 지정.

```jsonc
"Filters": [
  { "FilterType": "Condition", "ConditionOperators": ">=",
    "ConditionKey": "CreateDate", "ConditionValue": "{%_c.search[0].StartDate%}" },
  { "FilterType": "Condition", "ConditionOperators": "<=",
    "ConditionKey": "CreateDate", "ConditionValue": "{%_c.search[0].EndDate%}" }
]
```

### 5.3 작성자 검색

서비스 호출자의 UserID 와 `CreateUserID` 컬럼 비교 (자동).

```jsonc
"Filters": [
  { "FilterType": "Condition", "ConditionOperators": "=",
    "ConditionKey": "CreateUserID", "ConditionValue": "{%_base.User.fBaseUserNo%}" }
]
```

### 5.4 정렬 순서

`OrderBy` + `OrderDirection` (ASC/DESC) 를 ServiceBinding 에 직접 박음.

## 6. 형태

```jsonc
"ServiceBinding": {
  "queryProducts": {
    "SystemID":       "FlexAutoQuery",
    "ModuleID":       "Default",
    "ServiceType":    "Query",
    "TargetTable":    "Product",
    "OrderBy":        "CreateDate",
    "OrderDirection": "DESC",
    "SetCategory":    true,
    "UsePKey":        true,
    "UseParamBlock":  true,
    "UseResultBlock": true,
    "UseInnerBlock":  true
  }
}
```

## 7. FlexSQL 자동생성

FlexAutoQuery 설정 값에 따라 내부적으로 FlexSQL 이 자동 생성됨. 새 컬럼 추가 시 이 자동 생성 FlexSQL 과의 연결이 끊어지므로, **수동으로 FlexSQL 업데이트 필요**.

## 8. ksystem 과의 차이

| 항목 | FlexAutoQuery | ksystem (FlexAPI) |
|---|---|---|
| SystemID | `'FlexAutoQuery'` | `'ksystem'` |
| ModuleID | `'Default'` | `'FlexAPI'` |
| 추상화 수준 | 높음 (ServiceType + TargetTable) | 낮음 (SP 이름 직접 지정) |
| 호출 방식 | 자동 CRUD | SPList 의 SP 호출 |

자세한 ksystem 정의는 [`ksystem.md`](ksystem.md) 참조.
