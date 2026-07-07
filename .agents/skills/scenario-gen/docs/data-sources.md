# DataSources (data-sources.schema.json)

`scenarioMeta.DataSources` — 명명 데이터소스 모음. Combo / RadioBox / Search / Tree / MultiCheckBox / Approval / TimeTable / Scheduler / CalendarNavigator 등의 `DataSourceName` 참조 대상.

## 형태

```jsonc
{
  "DataSources": {
    "<DataSourceName>": { "DataSourceType": "<Type>", ... },
    ...
  }
}
```

키 = DataSource 이름, 값 = `dataSource` $defs 의 oneOf 분기.

## DataSource 이름 규칙 (제한)

**엔진 `studio-util.js#L4225 isIcludeSpecial()` 의 negation으로 schema `propertyNames.pattern` 강제.**

### 차단 문자
다음 특수문자 포함 시 schema 검증 실패:

```
` . ~ ! @ # $ % ^ & * ( ) = | \ ' " ; : / ? , { } [ ] < > 공백 탭 개행
```

### 허용 패턴 예시

| 이름 | 비고 |
|---|---|
| `Cust_D` | ✅ 운영 메타 일반 패턴 |
| `EmployeeGridDS` | ✅ AI 생성 권장 (의미 + 접미사 `DS`) |
| `MenuOptionQuery` | ✅ |
| `daySettingQuery` | ✅ camelCase |
| `test-DS_v2` | ✅ 하이픈 / 언더스코어 / 숫자 |
| `Bad.Name` | ❌ `.` 차단 |
| `My DS` | ❌ 공백 차단 |
| `DS!` | ❌ `!` 차단 |
| `${name}` | ❌ `$ { }` 차단 |

### AI 생성 권장 컨벤션

영문자로 시작 + 영문/숫자/언더스코어 + 의미있는 접미사:

| 접미사 | 용도 |
|---|---|
| `_DS` / `DS` | 일반 DataSource (`StatusListDS`, `EmployeeGridDS`) |
| `_D` | 코드/마스터 데이터 (운영 메타 패턴: `Cust_D`, `Dept_D`) |
| `Query` | 쿼리/조회용 (`MenuOptionQuery`, `daySettingQuery`) |
| `List` / `Items` | 목록 데이터 |

### 참조 정합성 (validate.mjs `[dsref]` / `[proto]` cross-check)

컨트롤(Combo / RadioBox / Search / Tree / MultiCheckBox / Approval / TimeTable / Scheduler 등)의 `DataSourceName` 은 반드시 `scenario.DataSources` 에 정의된 키와 일치해야 한다. 미정의 참조 시 차단 (엔진 런타임도 'Invalid Datasource' 에러).

> ★ **능동 생성 의무** — `DataSourceName: "X"` 를 컨트롤(또는 자식 ComboList/List)에 쓰는 순간, **같은 이름 `X` 키를 `scenario.DataSources` 에 `Fixed`/`Grid` 로 함께 생성**해야 한다. 참조만 남기고 정의를 빠뜨리는 것이 가장 흔한 누락 — `[dsref] is not defined in scenario.DataSources (known: (empty))`.
>
> ★ **`SaveValueKey` 만 쓰고 `DataSources` 가 비어있으면 `[proto]`** — 입력/체크 컨트롤이 값을 저장(`SaveValueKey`/`Ckeys`)하는데 `scenario.DataSources` 가 통째로 비어있으면 `[proto] scenario.DataSources is empty`. 저장하는 화면이면 최소 1개의 `Fixed`/`Grid` DataSource 를 반드시 둔다. (저장 의도가 없는 순수 표시면 컨트롤에서 `SaveValueKey` 를 빼고, 감싸는 Group 에 `UseDataConnection:false` 명시.)

## DataSourceType (제한 — 엔진 enum 5종)

엔진 소스(`engine/common/const.js`) 에 박힌 enum:

| Type | 데이터 출처 | 핵심 필드 | AI 샘플 생성 |
|---|---|---|---|
| `Fixed` | 인라인 정적 데이터 | `FixedItems` (배열) | ✅ **사용** |
| `Grid` | 인라인 그리드 데이터 (헤더 + 행) | `GridItems` (배열), `GridHeader` (선택) | ✅ **사용** |
| `Collection` | 다른 카테고리 참조 | `CategoryName` + `Target.Filters` | ❌ 운영 전용 |
| `Service` | ServiceBinding 호출 결과 | `ServiceName` + `ParamBlocks` | ❌ 운영 전용 |
| `API` | 직접 API 호출 | `ModuleID`, `Action` 등 | ❌ 운영 전용 |

> JS 로 동적 생성하는 화면 데이터는 DataSource 가 아니라 카테고리 섹터 데이터로 다룬다 — [목업 데이터](mockup-data.md) 참조.

> **CRITICAL — AI 샘플 데이터는 `Fixed` 또는 `Grid` 만 사용** (system-prompt-v2 §17 line 4630).
> 외부 시스템(Service/API/Collection)에 의존하는 DataSource 는 AI 생성 시나리오에서 데이터가 비어있어 화면 검증 불가. `Fixed`/`Grid` 인라인 데이터로 작성해 자체 완결적인 샘플 시나리오를 만들어야 한다.
>
> validate.mjs `[sample]` cross-check 가 `Fixed`/`Grid` 외 타입을 차단. 운영 메타 검증 시에는 `SAMPLE_DATA_STRICT=0` 환경변수로 비활성화 가능.

## 1. `Fixed` — 정적 인라인 데이터

```jsonc
{
  "StatusListDS": {
    "DataSourceType": "Fixed",
    "FixedItems": [
      { "ItemName": "{{대기}}", "ItemValue": "0" },
      { "ItemName": "{{승인}}", "ItemValue": "1" },
      { "ItemName": "{{반려}}", "ItemValue": "2" }
    ]
  }
}
```

규칙:
- `FixedItems` 는 일반적으로 `{ItemName, ItemValue}` 페어 객체 배열.
- 임의 필드 추가 가능 (Combo/RadioBox 의 `CollectionMapper` 로 매핑).
- 운영 메타는 `FixedItems` 가 JS 표현식 문자열로 저장된 사례 있음(`"[{key:'a',...}]"`). 런타임이 `new Function()` 으로 평가. **AI 생성 시에는 배열 형태로만 작성**.

## 2. `Grid` — 그리드형 데이터

```jsonc
{
  "EmployeeGridDS": {
    "DataSourceType": "Grid",
    "GridHeader": ["EmpId", "EmpName", "DeptName"],
    "GridItems": [
      { "EmpId": "E001", "EmpName": "홍길동", "DeptName": "개발팀" },
      { "EmpId": "E002", "EmpName": "김철수", "DeptName": "기획팀" }
    ]
  }
}
```

규칙:
- `GridItems` 는 행 데이터 배열 — 행마다 `GridHeader` 의 키로 접근.
- `GridHeader` 는 선택 — **컬럼 키 문자열 배열** `["EmpId", ...]` (객체 배열 아님). 표제(타이틀)는 컨트롤 라벨에서 표현.
- AI 생성 시 헤더+행 구조가 더 자연스러운 데이터(직원 명단/제품 목록 등)에 사용.

## 3. `Collection` — 카테고리 참조 (운영 전용)

```jsonc
{
  "MenuOptionItemDS": {
    "DataSourceType": "Collection",
    "CategoryName": "MenuOptionItem",
    "Target": {
      "Filters": [
        { "FilterType": "Condition", "ConditionKey": "OptionSeq", "ConditionOperators": "==", "ConditionValue": "{% return _c.ActiveMenuOption[0].OptionSeq %}" }
      ]
    }
  }
}
```

`UseInnerBlock=true` 면 `InnerBlock.InnerBlockKey` 로 부모 섹터의 배열 필드 참조.

## 4. `Service` — ServiceBinding 호출 (운영 전용)

```jsonc
{
  "DeptListDS": {
    "DataSourceType": "Service",
    "Version": 2,
    "SystemID": "Other",
    "UseCategory": true,
    "ServiceName": "DeptList_S",
    "ParamBlocks": [{
      "UseFilter": true,
      "UserData": ["CompanySeq", "LanguageSeq", "UserSeq"],
      "Filters": [{ "FilterType": "Status", "Status": ["active"] }]
    }]
  }
}
```

> `ServiceName` 은 반드시 `scenarioMeta.ServiceBinding` 의 키와 일치해야 함.

## 5. `API` — 직접 API 호출 (운영 전용)

```jsonc
{
  "QuestionListDS": {
    "DataSourceType": "API",
    "Action": "API",
    "SystemID": "New_05",
    "SystemType": "CustomSystem",
    "ModuleID": "f34f4c81-...",
    "SetCategory": true,
    "UsePKey": true,
    "UseParamBlock": true,
    "UseResultBlock": true,
    "fEvent": { "url": "{%_base.flextudio.serviceUrl%}", "...": "..." },
    "fEventKey": ["url", "..."],
    "ParamBlocks": [],
    "ResultBlocks": []
  }
}
```

엔진 내부에서는 `Service` 와 동일 함수로 호출 (`runtime.js#L3697`).

## DataSource 와 컨트롤 연결

컨트롤 측에서:
```jsonc
{ "ControlType": "Combo", "DataSourceName": "StatusListDS", ... }
```

`ComboList` / `List` (Search) 내부:
```jsonc
{
  "ControlType": "ComboList",
  "DataSourceName": "StatusListDS",
  "CollectionMapper": { "StatusCode": "ItemValue", "StatusName": "ItemName" },
  "Title": "ItemName"
}
```

`Title` / `CollectionMapper` 의 원본 필드명은 DataSource 타입에 따라 다름:

| 타입 | `Title` / 매핑 원본 |
|---|---|
| `Fixed` | `ItemName` (FixedItems 의 필드명) |
| `Grid` | `GridHeader` 의 키 (=`GridItems` 행의 필드명) |
| `Collection` | 참조 카테고리의 Ckey |
| `Service` | 서비스 반환 필드명 |

## 함정

- `Fixed`/`Grid` 외 타입을 AI 가 생성하면 외부 시스템 호출 → 빈 데이터 → 화면 검증 불가.
- `Service` 의 `ServiceName` 누락/오타 시 ServiceBinding 매칭 실패.
- `FixedItems` 를 JS 문자열로 두면 운영 메타 호환은 되지만 AI 생성에서는 배열 사용 권장.
- DataSource 변경 시 컨트롤의 `Title`/`CollectionMapper`/`SaveNameKey`/`SaveValueKey` 모두 새 필드명으로 일괄 갱신 필요.
