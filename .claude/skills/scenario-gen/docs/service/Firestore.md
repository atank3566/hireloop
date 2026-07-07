# Firestore Service (Firestore.schema.json)

Google Firestore 직접 연동. 테넌트 설정의 Firebase Admin 정보 기반.

> **참고**: [docs.flextudio.com — Firestore](https://docs.flextudio.com/flextudio/scenario/dev-mode/service/firestore).
> **스킬 생성에서는 사용 금지** — `[no-service]` 가 차단.

## 1. 사용 시점

- NoSQL 컬렉션 데이터 조회/추가/수정/삭제.
- Firebase Admin 인증 기반 — 백엔드 구성 없이 직접 연동.

## 2. 식별 필드

| 필드 | 값 | 비고 |
|---|---|---|
| `SystemID` | `"Firestore"` (고정) | const |
| `ModuleID` | `Query` / `Save` / `Update` / `Delete` | enum 4종 |
| `Collection` | string | Firestore 컬렉션 명칭 (서비스 대상) |

## 3. ModuleID 4종 — 작업별 데이터 흐름 (docs.flextudio.com)

| 모듈 | 보내는 데이터 | 받는 데이터 | Firestore 매핑 |
|---|---|---|---|
| `Query` | **ParamBlock1 의 첫 번째 섹터** = 검색 조건 | 조회된 데이터 | `collection().where(...).get()` |
| `Save` | **ParamBlock1 의 모든 섹터** → 새 문서로 생성 (그대로 저장) | 저장된 문서의 `_SUID` | `collection().add({...})` |
| `Update` | **ParamBlock1 의 모든 섹터** → 업데이트 조건 따라 수정 | 업데이트된 문서의 `_SUID` | `doc(id).update({...})` |
| `Delete` | **ParamBlock1 의 모든 섹터** → 식별자로 사용해 삭제 | 삭제된 문서의 `_SUID` | `doc(id).delete()` |

## 4. Query — 정렬 + 검색

### 4.1 지원 연산자

| 연산자 | 의미 |
|---|---|
| `==` / `!=` | 같음 / 같지 않음 (FlexAutoQuery 의 `=`/`!=` 와 다름) |
| `<` / `<=` / `>` / `>=` | 비교 |

> ⚠️ Firestore 는 `LIKE` / `NOT LIKE` / `IS NULL` 미지원. 부분 일치는 별도 인덱스 텍스트 검색.

### 4.2 정렬 + 검색 동시 사용

> **인덱스 등록 필요**. [Firestore 색인 등록 페이지](https://console.firebase.google.com/project/_/firestore/indexes) 에서 미리 설정.
> 정렬 기준 필드 + 검색 조건 필드가 다르면 복합 인덱스 필수.

```jsonc
"Filters": [
  { "FilterType": "Condition", "ConditionOperators": "==",
    "ConditionKey": "category", "ConditionValue": "{%_c.search[0].category%}" }
]
```

## 5. Update — 두 가지 타입

| Update 타입 | 동작 |
|---|---|
| **전체 수정** | 보낸 데이터로 문서 전체 덮어쓰기 |
| **부분 수정** | 지정된 필드만 수정 |

### 5.1 Update Value 타입

| 타입 | 의미 |
|---|---|
| **컬렉션키** | ParamBlock 의 컬렉션키 값으로 필드 업데이트 |
| **FieldValue 함수** | Firestore `FieldValue` 함수 사용 |

### 5.2 FieldValue 함수

| 함수 | 동작 |
|---|---|
| `increment(1)` | 값 +1 증가 |
| `increment(-1)` | 값 -1 감소 |
| `delete()` | 해당 필드를 문서에서 삭제 |

## 6. 형태

```jsonc
"ServiceBinding": {
  "getCou": {
    "SystemID":       "Firestore",
    "ModuleID":       "Query",
    "Collection":     "ideationList",
    "SetCategory":    true,
    "UsePKey":        true,
    "UseParamBlock":  true,
    "UseResultBlock": true,
    "UseInnerBlock":  true,
    "UseSearch":      false,
    "NotSeperateInnerBlock": true
  }
}
```

## 7. ParamBlock → Firestore 쿼리 변환

| ParamBlock 필드 | Firestore 변환 |
|---|---|
| `Filters[FilterType:'Condition']` | `.where(ConditionKey, ConditionOperators, ConditionValue)` |
| `Filters[FilterType:'Status']` | (런타임에서 status 필드로 변환) |
| `UserData[]` | 인증된 사용자 컨텍스트로 자동 필터 (예: `where('userId', '==', currentUserId)`) |

## 8. ResultBlocks 매핑

| TargetType | Firestore 동작 |
|---|---|
| `replace` | 카테고리 전체를 결과 docs 로 교체 |
| `add` | 결과 docs 를 기존 섹터 끝에 append |
| `merge` | `PKeys` (Firestore docId 가능) 기준 병합 |

## 9. UseSearch

`UseSearch: true` 로 설정 시 Firestore 의 인덱스 기반 텍스트 검색 활성화. 기본 false.

## 10. API 연동 흐름

```
[1] Action='Service' SystemID='Firestore' → Firestore 라우팅
[2] ModuleID 별 분기 (Query/Save/Update/Delete)
[3] ParamBlocks → Firestore 쿼리 변환
[4] Firestore 응답 → ResultBlocks 카테고리 반영 (+ _SUID)
```

## 11. 인증

`_base.User.fBaseUserNo` 컨텍스트가 Firestore Authentication 사용자와 매핑. UserData 에 인증 키 포함 시 자동으로 `where('uid', '==', ...)` 적용.
