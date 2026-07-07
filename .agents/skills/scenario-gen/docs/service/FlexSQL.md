# FlexSQL Service (FlexSQL.schema.json)

워크스페이스 콘솔에 **사용자가 등록한 SQL 쿼리** 를 시나리오에서 호출. FlexDB 또는 외부 DB와 연동.

> **참고**: [docs.flextudio.com — FlexSQL](https://docs.flextudio.com/flextudio/scenario/dev-mode/service/flexsql), flextudio-guide §6.7.
> **스킬 생성에서는 사용 금지** — `[no-service]` 가 차단. 운영 메타 검증 시 `strict_no_service:false`.

## 1. 사용 시점

- DB (FlexDB / MySQL / Azure MSSQL) 에서 데이터 조회/저장/갱신/삭제.
- Business 플랜 이상 필요.
- Before Script / After Script 로 전후처리.

## 2. 식별 필드

| 필드 | 값 | 비고 |
|---|---|---|
| `SystemID` | `"FlexSQL"` (고정) | const |
| `ModuleID` | `"Default"` | 다중 모듈 환경에서만 다른 값 |
| `ServiceName` | `"FlexSQL"` (보통) | 표기용 |
| `SQLServiceName` | `<시나리오명>:<서비스명>` | 콜론 1 개. 예: `"메인화면:showReceiveWho"`, `"Ideation:getDetail"` |
| `MajorVersion` | `1` 또는 `2` | FlexSQL 메이저 버전 |

## 3. 형태

```jsonc
"ServiceBinding": {
  "showReceiveWho_S": {
    "SystemID":         "FlexSQL",
    "ModuleID":         "Default",
    "ServiceName":      "FlexSQL",
    "SQLServiceName":   "메인화면:showReceiveWho",
    "MajorVersion":     1,
    "ExternalDB":       true,
    "SetCategory":      true,
    "UsePKey":          true,
    "UseParamBlock":    true,
    "UseResultBlock":   true,
    "UseInnerBlock":    true,
    "NotSeperateInnerBlock": true,
    "BeforeScript":     "",
    "ResultScript":     ""
  }
}
```

## 4. ParamBlocks / ResultBlocks

표준 형식 — [`../events.md §2.3.1 / §2.3.2`](../events.md) 와 동일.

```jsonc
"ParamBlocks": [
  {
    "CategoryName": "questionList",
    "UseFilter":    true,
    "Filters":      [{ "FilterType": "Status", "Status": ["active"] }]
  }
],
"ResultBlocks": [
  { "TargetType": "replace", "CategoryName": "showReceiveWho" }
]
```

## 5. Before / After Script

> **paramBlock / resultBlocks 는 이차원 배열** (docs.flextudio.com 명시). `paramBlock[i][j]` = i번째 ParamBlock 의 j번째 섹터. 스크립트 안에서 직접 수정 가능 — 별도 반환 없이 그대로 호출에 사용된다.

```jsonc
"BeforeScript": "paramBlock[0][0].UserSeq = _base.User.fBaseUserNo;",
"ResultScript": "resultBlocks[0].forEach(r => { r.DisplayName = r.FirstName + ' ' + r.LastName; });"
```

| 스크립트 | 시점 | 입력 변수 | 동작 |
|---|---|---|---|
| `BeforeScript` | SQL 호출 전 | `paramBlock[i][j]` (이차원 배열) | 내부 값 직접 수정 → 수정된 paramBlock 으로 SQL 실행 |
| `ResultScript` | SQL 호출 후 | `resultBlocks[i][j]` (이차원 배열) | 내부 값 직접 수정 → 변경된 resultBlocks 가 별도 반환 없이 컬렉션에 바로 반영 |

두 스크립트 모두 **서버 측에서 실행** (클라이언트 아님).

## 6. API 연동 흐름

```
[1] 클라이언트 Action='Service' → 서버 라우팅
[2] BeforeScript 실행 (_param 변환)
[3] SQLServiceName 으로 등록된 SQL 실행 (FlexDB / 외부 RDB)
[4] ResultScript 실행 (_result 후처리)
[5] 응답 → 클라이언트 ResultBlocks.TargetType 에 따라 컬렉션 반영
```

## 7. 검증 규칙 (스키마 강제)

| 규칙 | 동작 |
|---|---|
| `SystemID === 'FlexSQL'` const | 다른 SystemID 면 분기 미적용 |
| `SQLServiceName` 필수 + `:` 포함 | 콜론 1개 이상 (`pattern: ".+:.+"`) |
| `additionalProperties: true` | forward-compat — 운영 메타의 추가 키 허용 |
