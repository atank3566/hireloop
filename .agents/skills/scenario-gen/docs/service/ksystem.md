# ksystem Service (ksystem.schema.json)

`SystemID:'ksystem'` (소문자) — 영림원소프트랩 ksystem 사내 시스템 호출. const.js `SYSTEM_ID.KSYSTEM='ksystem'` 에 매핑.

> **스킬 생성에서는 사용 금지** — `[no-service]` 가 차단.
> **운영 메타 호환** 목적으로 형식 정의. AI 자동 생성 시나리오에는 등장 안 함.

## 1. ModuleID 5종

| ModuleID | 의미 |
|---|---|
| `FlexAPI` | BIZ 테이블 (자동생성 비즈니스 테이블) 의 스토어드 프로시저 호출 — 가장 흔한 형태 |
| `OpenAPI` | ksystem 공개 API |
| `Codehelp` | 코드 매핑 (도메인 코드 ↔ 표시명) |
| `Ksystem` | ksystem 본체 모듈 |
| `Filehelp` | 파일 처리 헬퍼 |

> 실 샘플 25 항목 중 대부분이 `ModuleID:'FlexAPI'` + `UseTable:'BIZ'` + `SPList:[...]` 패턴.

## 2. 식별 필드

| 필드 | 값 | 비고 |
|---|---|---|
| `SystemID` | `"ksystem"` (고정, 소문자) | const |
| `ModuleID` | enum 5종 (위 표) | |
| `UseTable` | `"BIZ"` / `false` | BIZ = 비즈니스 테이블 |
| `SelectTable` | 테이블 이름 또는 정의 객체 | |
| `SPList[]` | 자동생성 SP 이름 배열 | 예: `["_SWFlexARUsualCostAppListQuery"]` |
| `UseBundle` | boolean | 여러 SP 묶음 호출 |

## 3. 형태 — FlexAPI 모듈 (BIZ 테이블 SP 호출)

```jsonc
"ServiceBinding": {
  "UsualCostAppListQuery_S": {
    "SystemID":              "ksystem",
    "ModuleID":              "FlexAPI",
    "SetCategory":           true,
    "UsePKey":               true,
    "UseParamBlock":         true,
    "UseResultBlock":        true,
    "UseInnerBlock":         true,
    "NotSeperateInnerBlock": true,
    "UseTable":              "BIZ",
    "SelectTable":           "",
    "SPList":                ["_SWFlexARUsualCostAppListQuery"],
    "UseBundle":             false
  }
}
```

## 4. UseBundle (번들 호출)

여러 SP 를 묶어서 한 번에 호출. `SPList` 에 여러 항목 + `UseBundle: true`.

```jsonc
{
  "SPList":    ["_SWFlexUserSave", "_SWFlexUserPrefSave"],
  "UseBundle": true
}
```

## 5. API 연동 흐름

```
[1] Action='Service' SystemID='ksystem' → ksystem 라우팅
[2] ModuleID 분기 (FlexAPI / OpenAPI / Codehelp / Ksystem / Filehelp)
[3] FlexAPI 면 SPList 의 SP 를 BIZ 테이블에 대해 자동 실행
[4] 결과 → ResultBlocks 카테고리 반영
```

## 6. FlexAutoQuery 와의 관계

- ksystem `FlexAPI` 모듈은 자동생성된 SP 호출.
- [`FlexAutoQuery.md`](FlexAutoQuery.md) 는 별도 SystemID — 자동 CRUD 추상화 한 단계 더 위.
- 둘 다 BIZ 테이블 기반 자동 SP 를 사용하지만 메타 표기가 다르다 — 운영 환경/플랜에 따라 선택.
