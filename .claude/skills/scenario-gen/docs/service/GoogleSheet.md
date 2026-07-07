# GoogleSheet Service (GoogleSheet.schema.json)

Google Sheet 데이터 직접 조작. 테넌트 설정의 Google Sheet 인증 정보 기반.

> **참고**: [docs.flextudio.com — GoogleSheet](https://docs.flextudio.com/flextudio/scenario/dev-mode/service/googlesheet).
> **스킬 생성에서는 사용 금지** — `[no-service]` 가 차단. 단순 데이터 조작에만 적합 — 복잡한 조작은 Firestore 권장.

## 1. GoogleSheet 의 특성

- 빈 행/빈 열 = 다른 테이블로 인식.
- 첫 행 헤더 영역 ~ 빈 행 직전까지를 한 테이블로 정의.
- 시트 위에 여러 표가 있으면 **첫 헤더 영역만** 인식.

## 2. 식별 필드

| 필드 | 값 / 패턴 | 비고 |
|---|---|---|
| `SystemID` | `"GoogleSheet"` (고정) | const |
| `ModuleID` | `Query` / `Append` / `Update` / `Clear` | 4종 |
| `SpreadsheetId` | string | URL `/spreadsheets/d/{spreadsheetId}/edit` 부분 |
| `SheetName` | string | 시트 탭 이름 |
| `BaseColumn` | string | 기준 컬럼명. 보통 `_SUID` |

## 3. ModuleID 4종 (Firestore 와 다름!)

| ModuleID | 동작 | 보내는 데이터 | 받는 데이터 |
|---|---|---|---|
| `Query` | 조회 | 사용 안 함 (시트 전체) | 조회된 데이터 + `_rowIndex` |
| `Append` | 추가 | ParamBlock1 의 **기준 컬럼 항목이 있는 섹터** | 저장한 데이터의 `_SUID` + `_rowIndex` |
| `Update` | 수정 | ParamBlock1 의 **`_rowIndex` 와 기준 컬럼이 일치하는 섹터** | 수정한 데이터의 `_SUID` + `_rowIndex` |
| `Clear` | 값 비움 | ParamBlock1 의 **`_rowIndex` 와 기준 컬럼이 일치하는 섹터** | 삭제 결과의 `_SUID` + `_rowIndex` + 삭제 결과 |

> ⚠️ **`Clear` 는 행 삭제가 아님** — 기준 컬럼 외 값만 비움. 완전한 행 삭제는 시트에서 직접 **Delete Row** 로만 가능 (이 경우 무결성 미보장).

## 4. 기준 컬럼명 (BaseColumn)

- 시트의 행 식별자. Update/Clear 시 `_rowIndex` 와 함께 키로 사용.
- 별도 관리값 없으면 `_SUID` 컬럼 생성 + 기준 키 등록 → 자동 생성.
- 업데이트/삭제 작업 시에도 값 변경 안 됨.

## 5. 형태

```jsonc
"ServiceBinding": {
  "saveOrder": {
    "SystemID":      "GoogleSheet",
    "ModuleID":      "Append",
    "SpreadsheetId": "1ABCdef-XYZ_someLongIdHere",
    "SheetName":     "Orders",
    "BaseColumn":    "_SUID",
    "SetCategory":   true,
    "UsePKey":       true,
    "UseParamBlock": true,
    "UseResultBlock":true
  }
}
```

## 6. ParamBlock / ResultBlock

| 블록 | GoogleSheet 매핑 |
|---|---|
| ParamBlock1.첫 섹터 | (Query 는 미사용) |
| ParamBlock1.모든 섹터 | Append/Update/Clear 의 대상 행들 |
| `_rowIndex` 자동 추가 | Query 결과에 자동 포함 |

## 7. 제약 / 주의

- **GoogleSheet 서비스는 단순 작업 전용** — 복잡한 트랜잭션이나 관계형 데이터는 FlexSQL / Firestore 사용.
- 동시 편집 충돌 무결성 미보장 (Delete Row 등).
- API 쿼터 제한 (Google API 정책).
