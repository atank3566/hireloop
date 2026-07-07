# Scenario

`scenarioMeta` JSON 의 루트.

> **호환 엔진:** flextudio 6.4.x (verified 2026-05-04, 45 시나리오 샘플 + public/engine 소스 검증). 엔진 메이저 변경(6→7) 시 v2 컨트랙트로 분리.
>
> **schema ↔ md 동기화:** 본 md 의 필드 표는 `scenario.schema.json` 과 1:1 일치해야 한다. schema 갱신 시 반드시 이 표도 같이 수정. ajv 가 검증하는 사실 출처는 `.schema.json` 이고, 본 md 는 사람/AI 가 읽는 가이드다.

## 최상위 구조

```jsonc
{
  "modules": {},                          // const {} 고정
  "htmlkey": "stephtml",                  // const "stephtml" 고정
  "ScenarioTitle": "",                    // const "" 고정 (가비지 슬롯)
  "fScenarioName": "시나리오 이름",
  "fConverterVersion": 1,                 // const 1 고정
  "StartSteps": ["Step1"],                // Steps 있으면 minItems: 1
  "Steps": {                              // ← 객체 (Map). 키가 StepId.
    "Step1": { /* Step */ },
    "Step2": { /* Step */ }
  },
  "Language": {},
  "Events": {},
  "ServiceBinding": {},
  "Collections": {},                      // const {} 고정 (Ksystem 호출 시 타입 결정용 — 런타임이 채움)
  "DataSources": {},
  "Scenario": { "StyleURLs": [] },        // 외부 라이브러리 JS 경로 배열
  "Panel": {                              // 6키 고정, additionalProperties: false
    "Collection": { "Ckeys": [] },
    "Category": {},
    "CategoryOrder": [],
    "Table": [],
    "ExternalTable": [],
    "AuthKey": []
  },
  "LastSavedTime": 1766022252184,         // 옵션 (스튜디오 자동 기록)
  "FlexSQLService": {}                    // const {} 고정 (AI 생성 시)
  // EmbedScenarioPrefix: 절대 추가 금지 (schema에서 false 로 거부)
}
```

## 필드

| 키 | 타입 / 강제 | 비고 |
|---|---|---|
| `modules` | **const `{}`** | 런타임 모듈 슬롯. 항상 빈 객체. |
| `htmlkey` | **const `"stephtml"`** | 고정값. |
| `ScenarioTitle` | **const `""`** | 가비지 슬롯. 표시명은 `fScenarioName` 사용. |
| `fScenarioName` | string | 시나리오 표시명. |
| `fConverterVersion` | **const `1`** | 메타 컨버터 버전. |
| `StartSteps` | string[] | 진입 StepId 배열. **Steps가 1개 이상이면 minItems: 1 강제**. |
| `Steps` | object (Map) | 키 = StepId (`Step[A-Za-z0-9_]+`), 값 = Step. patternProperties + additionalProperties: false. |
| `Language` | object | 다국어 매핑 (`{{key}}` 치환 대상). |
| `Events` | object | 이벤트 핸들러 정의. |
| `ServiceBinding` | object | 서비스 바인딩. |
| `Collections` | **const `{}`** | Ksystem 호출 시 타입 결정용 슬롯. 운영 메타에서는 시스템이 type 정의를 채우는 영역이라 일부 운영 메타에는 데이터 존재. **AI 생성 시 빈 객체**. 추후 AI가 직접 type 정의를 추가하는 요건이 생기면 const 해제. |
| `DataSources` | object | Combo/RadioBox/Search용 명명 데이터소스. |
| `Scenario` | object | `additionalProperties: false`. 현재 `StyleURLs` (string[]) 만 허용. **외부 JS 라이브러리(Chart.js, 지도 SDK 등) URL 추가 위치 — 라이브러리 로드는 `f.Script.load()` 보다 여기 등록을 우선**(정적 URL, 진입 시 자동 로드). |
| `Panel` | object (6키 고정) | `additionalProperties: false`. 키 6개: `Collection`, `Category`, `CategoryOrder`, `Table`, `ExternalTable`, `AuthKey`. AI 생성 시 별도 키 추가 금지. 내부 값(Ckeys 배열, Category 객체 등)은 운영 메타에서 채워질 수 있으나 AI 생성 시 빈 형태. |
| `LastSavedTime` | number | 마지막 저장 시각 (Unix timestamp ms). 스튜디오 저장 시 자동 기록 — 실 시나리오 42/45 에 존재. AI 생성 시 누락/0 허용. |
| `FlexSQLService` | **const `{}`** | FlexSQL 서비스 이름/버전 매핑 슬롯. 코드: scenario-studio/studio-util.js:2957. 운영 메타에서는 `{NameArray, VersionMap}` 으로 채워질 수 있으나 AI 생성 시 빈 객체 고정. |
| `EmbedScenarioPrefix` | **`false` (금지)** | 임베디드 시나리오 ID 접두사. 코드: engine/common/fquery.js:54. **AI 생성에 절대 등장 금지** (schema에서 properties: false 로 거부). |

### Panel 세부 필드

| 키 | 타입 | AI 생성 권장 |
|---|---|---|
| `Collection` | `{ Ckeys: array }` | `{ "Ckeys": [] }` |
| `Category` | object | `{}` |
| `CategoryOrder` | array | `[]` |
| `Table` | array | `[]` |
| `ExternalTable` | array | `[]` |
| `AuthKey` | array | `[]` |

## StepType / Step 식별 규칙

- StepId 형식: `Step[A-Za-z0-9_]+` (예: `Step1`, `StepMain`).
- Steps 객체의 키 자체가 StepId (별도 `StepId` 필드 없음).
- 자세한 Step 분기는 `step.md` 참조.

## 검증 요점 (Schema + Reachability 후검증)

### Schema 차원
- `Steps` 키 패턴: `^Step[1-9][0-9]*$` (예: `Step1`, `Step2`, `Step10`. **0 시작 불가, 영문/언더스코어 불가, `Step0` 도 불가**.)
- `StartSteps` 는 **반드시 배열** (단수 `StartStep` 아님 — 단수 `StartStep` 은 StepSub의 `Protocol.StartStep` 키이며 의미가 다름).
- Steps가 1개 이상이면 `StartSteps` 도 minItems: 1 강제.
- `htmlkey` 누락 시 런타임 인식 실패.
- 위 const 들 위반 시 ajv 가 잡아냄.

### Reachability 후검증 (`validate.mjs`)
- `StartSteps[*]` 는 반드시 `Steps` 의 키 중 하나.
- `Step.Next[*]` 도 반드시 `Steps` 의 키 중 하나.
- **모든 Step은 (StartSteps + 모든 Step.Next 합집합) 에서 정확히 1번 등장**해야 한다.
  - 0회 = 고아 Step (진입 불가).
  - 2회 이상 = 순환구조 또는 다중 진입 (트리 위반).

이 cross-reference 규칙들은 표준 JSON Schema 로 표현 불가하므로 `validate.mjs` 의 `checkStepReachability()` 후검증 로직으로 처리한다.

## 루트에 없는 필드 (혼동 방지)

다음 키는 **scenarioMeta 루트에 존재하지 않으므로** 컨트랙트나 AI 생성에서 절대 추가하지 말 것:

- `MetaContractVersion` — 컨트랙트 자체의 버전이지 메타 안에 들어가는 값이 아님.
- `ScenarioId` (루트) — 루트 식별자는 따로 없음. 단, **StepSub의 자식 필드로서의 `ScenarioId`** (호출 대상 시나리오 ID) 는 `StepType: "StepSub"` 와 함께 쓰이는 정상 키.
- `StartStep` (단수) — 루트에는 항상 **`StartSteps`(복수, 배열)**. 단수 `StartStep` 은 StepSub의 `Protocol.StartStep` 안에서만 등장 (의미: 호출할 서브 시나리오의 시작 Step).
- `fAppJson` — 일부 운영 메타에 존재하지만 AI 생성 schema에서는 정의하지 않음 (필요시 운영 도구가 처리). `additionalProperties: true` 라 운영 메타도 통과.
- `EmbedScenarioPrefix` — schema 에서 `false` 로 명시적 거부.

## 예시

`examples/simple-form.json`, `examples/nested-groups.json`, `examples/combo-with-dialog.json`.
