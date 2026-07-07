# Service 폴더 — 서비스 종류별 메타 + API 연동

`scenarioMeta.ServiceBinding[<name>]` 항목 / `Events.X[*].Action='Service'` 의 인라인 ServiceBinding 객체에서 사용하는 **서비스 종류별 분기 스키마와 가이드**.

> **스킬 생성에서는 모든 서비스 사용 금지** — `[no-service]` 가 차단 (`strict_no_service:true` 기본). 본 폴더의 스키마/가이드는 **운영 메타 검증** 과 **AI 가 사용자 질문에 답할 때의 참고 자료**로 사용. 운영 메타 검증 시 `strict_no_service:false` 로 호출.
> **참고 문서**: [docs.flextudio.com — Event 와 Service](https://docs.flextudio.com/flextudio/concept/eventservice), [docs.flextudio.com — Service](https://docs.flextudio.com/flextudio/scenario/dev-mode/service), [docs.flextudio.com — API 호출](https://docs.flextudio.com/flextudio/scenario/dev-mode/event/api), [flextudio-guide §6.6–6.8](../../../../flextudio-ai-studio/docs/flextudio-guide.md), [const.js SYSTEM_ID](../../../../public/engine/common/const.js).

## 명명 원칙

**파일명 = `SYSTEM_ID` 값 그대로** (대소문자/공백 보존). const.js `SYSTEM_ID` 의 string value 가 그대로 파일명 basename. 예외: `CustomSystem` 은 `SystemType` (별도 `CUSTOM_SYSTEM_TYPE='CustomSystem'`) 매핑.

## 폴더 구조

```
schema/v1/service/
├── README.md                          # 이 파일 — 인덱스 + 비교표
├── _base.schema.json                  # 공통 commonBase $defs
├── FlexSQL.{schema.json,md}           # SystemID='FlexSQL'        — 워크스페이스 SQL
├── FlexAutoQuery.{schema.json,md}     # SystemID='FlexAutoQuery'  — FlexDB 자동 CRUD
├── ksystem.{schema.json,md}           # SystemID='ksystem'        — 영림원 ksystem (FlexAPI/OpenAPI/Codehelp/Ksystem/Filehelp)
├── Firestore.{schema.json,md}         # SystemID='Firestore'      — Google Firestore
├── GoogleSheet.{schema.json,md}       # SystemID='GoogleSheet'    — Google Sheet
├── Flextudio.{schema.json,md}         # SystemID='Flextudio'      — 워크스페이스 내장 (GetUserList/QueryMessage/SendMessage)
├── Flextudio API.{schema.json,md}     # SystemID='Flextudio API'  — 사용자/메시지/그룹 REST API (flexApiKey)
└── CustomSystem.{schema.json,md}      # SystemType='CustomSystem' (SystemID='New_NN') — Action='API' 매핑 + fEventKey/fEvent
```

## 시스템 비교표

const.js `SYSTEM_ID` 정의 + docs.flextudio.com 공식 문서 + 실 샘플 시나리오 기반.

| 시스템 | SystemID (const.js) | SystemType | ModuleID 후보 | 핵심 필드 | 플랜 | 빈도 |
|---|---|---|---|---|---|---|
| **FlexSQL** | `FlexSQL` | — | `Default` | `SQLServiceName`(`<시나리오>:<서비스>`), `MajorVersion`, `ExternalDB`, `BeforeScript`, `ResultScript` | Business+ | 39 |
| **FlexAutoQuery** | `FlexAutoQuery` | — | `Default` | `ServiceType`(Query/Save/Update/Delete), `TargetTable`, `OrderBy` | Business+ | (실 샘플은 ksystem 으로 박힘) |
| **ksystem** | `ksystem` | — | `FlexAPI` / `OpenAPI` / `Codehelp` / `Ksystem` / `Filehelp` | `UseTable`(BIZ), `SelectTable`, `SPList[]`, `UseBundle` | Business+ | 25 |
| **Firestore** | `Firestore` | — | `Query` / `Save` / `Update` / `Delete` | `Collection`, `UseSearch` | All | 4 |
| **GoogleSheet** | `GoogleSheet` | — | `Query` / `Append` / `Update` / `Clear` | `SpreadsheetId`, `SheetName`, `BaseColumn`(`_SUID`) | All | 0 (실 샘플) |
| **Flextudio** | `Flextudio` | — | `GetUserList` / `QueryMessage` / `SendMessage` | (없음) | All | (헬퍼) |
| **Flextudio API** | `Flextudio API` (공백) | — | `User` / `Message` / `Group` | `flexApiKey`, `SubModuleID`, `useUserAppGrant`, `UseSearch`+`SearchItem`, `UseUnreadMessage`, `groupName` | All | (REST) |
| **CustomSystem** | `New_NN` | `CustomSystem` | GUID v4 | `fEventKey[]`, `fEvent{}` (= "Event Config Key") | All | 12 |

> **`Custom` 시스템은 v1 컨트랙트에서 제외** (const.js `SYSTEM_ID.CUSTOM='Custom'` 은 정의되어 있으나 본 컨트랙트는 미지원 — Custom REST 는 외부 백엔드 호출용으로 보안/검증 부담이 커서 의도적으로 제외).

### ModuleID 비교 (혼동 주의)

| 작업 | FlexAutoQuery | Firestore | GoogleSheet |
|---|---|---|---|
| 조회 | `Query` (ServiceType) | `Query` | `Query` |
| 추가/저장 | `Save` | `Save` | `Append` |
| 수정 | `Update` | `Update` | `Update` |
| 삭제 | `Delete` | `Delete` | `Clear` (값만 비움) |

### Flextudio 도메인 모듈 비교 (혼동 주의)

| 작업 | Flextudio (`SystemID='Flextudio'`) | Flextudio API (`SystemID='Flextudio API'`) |
|---|---|---|
| 사용자 조회 | `ModuleID:'GetUserList'` | `ModuleID:'User'` + `SubModuleID:'Query'` |
| 메시지 조회 | `ModuleID:'QueryMessage'` | `ModuleID:'Message'` + `SubModuleID:'Query'` |
| 메시지 발송 | `ModuleID:'SendMessage'` | (해당 없음 — REST 미지원) |
| 그룹 회원 조회 | (해당 없음) | `ModuleID:'Group'` + `SubModuleID:'UserQuery'` + `groupName` |
| 인증 | 워크스페이스 세션 (자동) | `flexApiKey` 헤더 |

### 연산자 비교

| 서비스 | 지원 연산자 |
|---|---|
| **FlexAutoQuery** | `=`, `!=`, `<`, `<=`, `>`, `>=`, `LIKE`, `NOT LIKE`, `IS NULL`, `IS NOT NULL` |
| **Firestore** | `==`, `!=`, `<`, `<=`, `>`, `>=` (LIKE/IS NULL 미지원) |
| **Flextudio API User Query** (`SearchFilter`) | `contains`, `!contains`, `exists`, `!exists`, `==`, `!=`, `<`, `<=`, `>`, `>=` |

## 분기 결정 규칙

`ServiceBinding[<name>]` 또는 `Action.ServiceBinding` 의 `SystemID` / `SystemType` 값으로 어느 스키마를 적용할지 결정 (const.js SYSTEM_ID 와 1:1).

```
SystemID === 'FlexSQL'                               → FlexSQL.schema.json
SystemID === 'FlexAutoQuery'                         → FlexAutoQuery.schema.json
SystemID === 'ksystem'                               → ksystem.schema.json
SystemID === 'Firestore'                             → Firestore.schema.json
SystemID === 'GoogleSheet'                           → GoogleSheet.schema.json
SystemID === 'Flextudio'                             → Flextudio.schema.json
SystemID === 'Flextudio API'                         → Flextudio API.schema.json
SystemType === 'CustomSystem' (SystemID = 'New_NN')  → CustomSystem.schema.json
그 외                                                → service-binding.schema.json (관용 모드)
```

## 공통 ParamBlocks / ResultBlocks

서비스 종류와 무관하게 모든 서비스 호출은 `ParamBlocks` (보내는 데이터) / `ResultBlocks` (받은 데이터) / `InnerBlocks` (중첩 매핑) 구조를 공유한다. 자세한 형식은 [`../events.md §2.3`](../events.md) 참조.

| 블록 | 역할 | 필수 필드 |
|---|---|---|
| `ParamBlocks[]` | 카테고리/필터/사용자 컨텍스트 데이터 송신 | `CategoryName` 또는 `UserData` |
| `ResultBlocks[]` | 결과를 컬렉션 카테고리에 반영 (`category` / `replace` / `add` / `merge`) | `TargetType`, `CategoryName` (`merge` 시 `PKeys` 추가) |
| `InnerBlocks[]` | 결과 객체 안의 자식 배열 키 매핑 | `InnerBlockKey` |

## 런타임 내부 / 미사용 필드 (AI 생성 금지)

> ⚠️ const.js `K_EVENT.SERVICE` 에는 아래 필드들도 정의되어 있으나 일반 시나리오에서는 거의 미사용 — 런타임 내부 / 스튜디오 디버그 전용. AI 생성에서는 **절대 박지 말 것**. 운영 메타에서 마주치면 그대로 보존(스키마 `additionalProperties:true` 가 통과).

| 분류 | 필드 | 용도 |
|---|---|---|
| **비동기 콜백** | `useAsync` / `asyncThenScript` / `asyncCatchScript` / `asyncFinallyScript` | 비동기 호출 then/catch/finally 스크립트. 일반 시나리오는 동기 `_fEvent.pause/resume` 흐름 사용 |
| **모바일 오프라인 큐** | `Flex-Offline` / `FlexOfflineModeType` (`Queue`\|`Cache`) / `FlexOfflineAfterEvent` | 푸시/큐 라우팅 — 모바일 한정 |
| **오프라인 트랜잭션 키** | `UseFlexSourceID` / `UseFlexSubmissionID` / `Flex-SubmissionID` / `Flex-SourceID` / `Flex-Mapper` (+ `map`/`path`/`match`/`preserveSource`) | 오프라인 큐 SubmissionID/SourceID 매핑 — 운영 환경 자동 채움 |
| **스튜디오 디버그** | `UseTestGround` / `TestScript` | Test Ground — 스튜디오에서 테스트 호출 시 자동 박힘 |
| **스튜디오 API 테스트** | `UseApiGround` / `ApiModuleId` / `ApiSystemId` / `ApiEvent` / `ApiEventKey` | API Ground — 스튜디오에서 API 모듈 시뮬레이션 시 사용 |
| **FlexSQL 임시 테이블** | `UseTempTable` / `TempTableName` | FlexSQL 임시 테이블 — 운영 한정 |
| **트랜잭션 / 외부 시스템** | `useCommonTran` / `UseExternal` | 공통 트랜잭션 묶음 / 외부 토글 — 운영 한정 |
| **결과 옵션** | `UseResultOptions` / `NotReflect` / `IsReplace` | 결과 반영 세부 토글 — `ResultBlocks.TargetType` 으로 충분 |

> step.md `AfterOfflineEvent` (`STEP_EVENT.AFTEROFFLINE`) 와 동일한 정책 — const.js 에는 정의되어 있어 형식상 통과되지만 AI 생성 메타에는 박지 않음. 운영 메타와 충돌 회피 목적으로만 정의되어 있다.

## 운영 메타 검증

```jsonc
{
  "name": "validate_scenario",
  "arguments": {
    "scenario": {…},
    "strict_no_service": false      // ServiceBinding / Service / API 통과
  }
}
```

`strict_no_service:false` 모드에서도 본 폴더의 스키마는 형식 강제력을 유지한다 — 예: FlexSQL 의 `SQLServiceName` 콜론 패턴, Flextudio API 의 ModuleID/SubModuleID 분기, CustomSystem 의 `New_NN` SystemID 패턴 등.
