# Data Objects (data-objects.schema.json)

Group 의 데이터 바인딩/필터 관련 공통 객체 카탈로그. 다른 schema 는 `$ref` 로 참조한다 (`data-objects.schema.json#/$defs/<name>`).

> **schema ↔ md 동기화**: 본 md 의 카탈로그 표는 `data-objects.schema.json` 의 enum/oneOf 와 1:1 일치해야 한다. schema 갱신 시 반드시 이 표도 같이 수정.

## 0. 데이터형 진실원본

데이터형이 애매한 키는 [property-data.js](../../../public/javascripts/scenario-studio/property-data.js) 의 `create<PropName>` 함수가 생성하는 EditControl 타입을 진실원본으로 본다. schema 는 이 타입을 따라간다.

| EditControl 타입 | JSON 데이터형 |
|---|---|
| `EDITOR_CTRL.CHECKBOX` / `EDITOR_CTRL.SWITCH` | `boolean` |
| `EDITOR_CTRL.INPUT` (text) | `string` |
| `EDITOR_CTRL.NUMBER` | `number` (또는 string 으로 직렬화되기도 함 — 함수 내 type cast 확인) |
| `EDITOR_CTRL.COMBO` | `string` (enum) |
| `EDITOR_CTRL.LIST` / `GROUP` | `object` / `array` |

> **boolean 직렬화 주의**: 운영 JSON 메타에서 `"true"` / `"false"` 문자열로 보이는 경우는 **저장 시점의 직렬화 표현**일 뿐, 데이터형은 boolean. schema 는 `type: "boolean"` 으로 강제, 본 md 의 모든 예시도 `true` / `false` (literal) 로 표기.

DataConnection 관련 키들의 진실원본 함수:
- `UseDataConnection` → property-data.js 의 별도 라인 (CHECKBOX)
- `UseNewSector` / `OnlyIfNoSector` / `UseTargetSector` → CHECKBOX
- `UseDCLink` → `createUseDCLink` (CHECKBOX)
- `UseEmptyView` → `createUseEmptyView` (SWITCH)
- `DataUsage` → `createDataUsage` (COMBO)
- `CategoryName` → COMBO
- `DCLinkCkey.DCLinkItems[*].DCParentKey` / `DCChildKey` → `createDCLinkCkey` (LIST)

## 1. `dataConnection` — Group 데이터 바인딩

Group 의 `UseDataConnection: true` 시 함께 등장하는 객체. 어떤 카테고리/섹터를 그룹에 바인딩할지 정의.

### 1.1 기본 (default) — 단일 섹터 보장

```jsonc
"DataConnection": {
  "TargetType": "category",
  "DataUsage": "default",
  "UseNewSector":   true,
  "OnlyIfNoSector": true,
  "CategoryName": "CtgXxx"
}
```

섹터 없으면 생성, 있으면 기존 사용. 검색/필터 카테고리 + Init set() 케이스.

### 1.2 신규 (new) — 빈 섹터 자동 생성

```jsonc
"DataConnection": {
  "TargetType": "category",
  "DataUsage": "new",
  "UseNewSector": true,
  "CategoryName": "CtgXxx"
}
```

진입 시 빈 섹터 자동 생성 + 그 섹터 바인딩. 입력값이 자동 저장됨.

> 빈 섹터가 자동 생성되므로 시작 Step Init 에서 `addSector` 로 mock 을 박지 않아도 된다 — `[mock-init]` 도 `new` 로만 쓰인 카테고리는 면제한다 (mockup-data.md 참조). 빈 입력 폼을 위해 `addSector({필드:''}, ...)` 빈 섹터를 억지로 박지 말 것.

### 1.3 상세 (detail) — activeSector 읽기 전용

```jsonc
"DataConnection": {
  "TargetType": "category",
  "DataUsage": "detail",
  "CategoryName": "CtgXxx",
  "UseTargetSector": true,
  "TargetSector": {
    "Filters": [{ "FilterType": "Status", "Status": ["active"] }]
  }
}
```

### 1.4 수정 (update) — activeSector 읽기+쓰기

```jsonc
"DataConnection": {
  "TargetType": "category",
  "DataUsage": "update",
  "CategoryName": "CtgXxx",
  "UseTargetSector": true,
  "TargetSector": {
    "Filters": [{ "FilterType": "Status", "Status": ["active"] }]
  }
}
```

입력값이 activeSector 에 직접 반영.

### 1.5 조회 (query) — 섹터 수만큼 그룹 복제

```jsonc
"DataConnection": {
  "TargetType": "category",
  "DataUsage": "query",
  "CategoryName": "CtgXxx"
},
"UseEmptyView": true
```

- **그룹 자체**가 카테고리 섹터 수만큼 복제됨. 부모 그룹 FlexDirection 이 복제 배치 결정.
- `UseEmptyView` 는 **DataConnection 밖, Group 레벨** 키.
  - `false`: "값이 없습니다" 류 안내 문구 노출
  - `true`: 빈 데이터 안내 미표시

#### 1.5.1 query + 필터 (부분 섹터만)

```jsonc
"DataConnection": {
  "TargetType": "category",
  "DataUsage": "query",
  "CategoryName": "CtgXxx",
  "UseTargetSector": true,
  "UseNewSector":    false,
  "TargetSector": {
    "Filters": [{ "FilterType": "Status" }]
  }
}
```

`UseTargetSector: true` + `UseNewSector: false` 로 query 에 필터 결합. Filters 배열의 FilterType 별 형태는 §2 참조.

> ★ **`TargetSector.Filters` 를 두면 `UseTargetSector: true` 가 반드시 함께 있어야 한다** — 스위치가 꺼져 있으면 런타임이 Filters 를 무시하고 카테고리 전체 섹터를 전송한다. 누락/`false` 인 채 Filters 만 있으면 materialize 가 결정적으로 `UseTargetSector: true` 로 보정한다 (DataUsage 무관, query 부분 필터링 포함).

### DataUsage 분기 요약

| DataUsage | 런타임 동작 | 추가 필수 필드 |
|---|---|---|
| `default` | 섹터 없으면 생성, 있으면 기존 사용 (단일 섹터). 주로 필터/검색 카테고리 + Init set() 케이스. | `UseNewSector: true` + `OnlyIfNoSector: true` |
| `new` | 진입 시 카테고리에 빈 섹터 자동 생성 + 그 섹터 바인딩. 입력값이 자동 저장됨. | `UseNewSector: true` |
| `update` | activeSector 만 바인딩 (읽기+쓰기). 입력값이 activeSector 에 직접 반영. | `UseTargetSector: true` + `TargetSector.Filters: [{Status: ["active"]}]` |
| `detail` | activeSector 만 바인딩 (읽기 전용). | `UseTargetSector: true` + `TargetSector.Filters: [{Status: ["active"]}]` |
| `query` | **그룹 자체**가 카테고리 섹터 수만큼 복제됨. 부모 그룹 FlexDirection 이 복제 배치 결정. | (옵션) `UseTargetSector: true` + `UseNewSector: false` + `TargetSector.Filters` 로 부분 필터 |

### query 그룹 강제 규칙

- `Height: { MatchText: true, SizeValue: "" }` 필수
- `ScrollType: "ScrollY"` 필수
- 100% 또는 고정 px Height 금지 (카드 사이 빈 공간 발생)
- `UseEmptyView` 는 Group 레벨 (DataConnection 밖)
- 헤더/필터/추가버튼 등 1번만 표시할 요소는 query 그룹 **바깥** 비연결 래퍼에 배치

## 2. `sectorFilter` — TargetSector.Filters 의 한 항목

`UseTargetSector: true` 시 `TargetSector.Filters` 배열 안에 들어가는 객체. `FilterType` 으로 oneOf 분기.

> **카테고리 식별은 `DataConnection.CategoryName` 만 사용한다.** `TargetSector.CategoryName` 은 잘못된 위치로 **schema 차원에서 차단** — `data-objects.schema.json` 의 `dataConnection.TargetSector.properties.CategoryName: false` (group.schema.json `UseInnerBlock: false` 와 동일 패턴) 로 어떤 값이든 거부. 운영 메타에 잔존하는 케이스는 마이그레이션 대상.

> **비편집 상태 허용**: 사용자가 필터를 막 추가했지만 키/값 미입력 상태(예: `{FilterType: "Condition", ConditionOperators: "Exists"}` — ConditionKey 없음, 또는 `{FilterType: "Status", Status: []}` — 빈 배열)도 운영 메타로 저장된다. schema 는 oneOf 의 부속 필드 required 를 모두 비웠다. 런타임에서는 부속 필드 미입력 시 해당 필터를 무시.

| FilterType | 부속 props (옵션) | 의미 |
|---|---|---|
| `"Status"` | `Status: 배열` (빈 배열 허용) | 섹터 상태로 필터 |
| `"Condition"` | `ConditionKey`, `ConditionOperators`, `ConditionValue` | 컬럼 값으로 필터. ConditionValue 는 **같은 섹터의 필드** 참조 (`{=Field}`). 다른 카테고리 참조 불가 |
| `"Custom"` | `Script` (빈 문자열 허용) | JS 표현식 (sector 변수, boolean 반환). 다른 카테고리 참조 가능 |
| `"Parent"` | `DCParentKey`, `DCChildKey` (빈 문자열 허용) | 1:N 관계 자식 group 에 배치. 부모 키 매칭 — **조상 Group 에 DataConnection 이 없으면 사용 금지** (`[dc-parent-ctx]` 가 차단) |

### sectorStatus 5종 (`Status` 배열의 값)

| 값 | 의미 |
|---|---|
| `active` | 활성 (삭제되지 않은) 섹터 |
| `selected` | 선택된 섹터 |
| `added` | 신규 추가 섹터 |
| `updated` | 수정된 섹터 |
| `deleted` | 삭제 표시된 섹터 |

### conditionOperators 10종 (`ConditionOperators` 값)

| 연산자 | 의미 |
|---|---|
| `==` | Equals |
| `!=` | Not equals |
| `>`, `>=`, `<`, `<=` | 숫자 비교 |
| `Exists` | 필드에 값 존재 (undefined 아님) |
| `Not_Exists` | 필드가 비어있음 / null / undefined |
| `Like` | 패턴 매치 (`%`=any chars, `_`=single char) |
| `RegExp` | JavaScript 정규식 |

### Filter 예시

```jsonc
// 1) 활성 섹터만
{ "FilterType": "Status", "Status": ["active"] }

// 2) 비편집 상태 (사용자가 상태 미선택)
{ "FilterType": "Status", "Status": [] }

// 3) 정적 값 비교
{ "FilterType": "Condition", "ConditionKey": "IsSelected", "ConditionOperators": "==", "ConditionValue": "1" }

// 4) 비편집 상태 (키 미지정, 연산자만)
{ "FilterType": "Condition", "ConditionOperators": "Exists" }

// 5) 다른 카테고리 참조 — Custom 필수 (Condition은 같은 섹터만 본다)
{ "FilterType": "Custom", "Script": "return sector.MealType == _c.CtgOrder[0].MealType" }

// 6) 비편집 상태 (Script 미입력)
{ "FilterType": "Custom", "Script": "" }

// 7) 부모-자식 1:N 매칭 — 자식 Group 의 DataConnection 에 배치
{ "FilterType": "Parent", "DCParentKey": "OrderNo", "DCChildKey": "OrderNo" }

// 8) 비편집 상태
{ "FilterType": "Parent" }
```

## 3. 상위 DataConnection 연동 패턴

상위 Group 에 DataConnection 이 있을 때, 자식 Group 의 DataUsage 별로 추가 키가 활성화된다.

### 3.1 신규 (new) — `UseDCLink` + `DCLinkCkey`

부모 섹터의 키를 자식 섹터에 자동 매핑.

```jsonc
"DataConnection": {
  "TargetType": "category",
  "DataUsage": "new",
  "UseNewSector": true,
  "UseDCLink":    true,
  "DCLinkCkey": {
    "DCLinkItems": [
      { "DCParentKey": "OrderNo", "DCChildKey": "OrderNo" }
    ]
  }
}
```

- `UseDCLink: true` 면 `DCLinkCkey` 필수 (schema if/then 강제).
- `DCLinkItems[]` 로 다중 키 매핑 가능.
- 비편집 상태에서는 `DCParentKey`/`DCChildKey` 빈 문자열 허용 (createDCLinkCkey 가 빈 문자열로 초기화).

### 3.2 조회 (query) — `Parent` 필터

자식 query 그룹에서 부모 섹터 키와 일치하는 자식만 표시.

```jsonc
"DataConnection": {
  "TargetType": "category",
  "DataUsage": "query",
  "UseTargetSector": true,
  "TargetSector": {
    "Filters": [{ "FilterType": "Parent", "DCParentKey": "QuoteNo", "DCChildKey": "QuoteNo" }]
  }
}
```

★ 부모↔자식 조인 키 `DCParentKey`/`DCChildKey` 는 **`Parent` 필터 객체 안**에 둔다 — `DataConnection` 최상위에 flat 으로 두면 런타임이 매칭하지 못한다 (`[dc-parent-key]` cross-check; materialize 가 query/Parent 는 Parent 필터로 자동 이전). `new` DataUsage 의 부모키 **자동 매핑**은 이것과 별개로 `DCLinkCkey.DCLinkItems[]` 를 쓴다 (§3.1) — 둘을 혼동해 DC 최상위 flat 으로 두지 말 것.

★ `Parent` 필터는 **조상 Group 에 DataConnection 이 있을 때만** 둔다 — 상위 어디에도 데이터연결이 없으면 매칭할 부모 섹터 자체가 없어 빈 목록/오동작이 된다 (`[dc-parent-ctx]` cross-check 가 차단). 독립 목록(부모 없음)이면 Parent 필터 없이 일반 query 로 둔다.

### Parent Join 전체 구조

```
[부모 Group: DataConnection → CtgParent (query)]    ← 부모 카테고리 전체 반복
  ↳ [자식 Group: DataConnection → CtgChild (query)] ← 자식 중 부모 키 일치만 표시
      TargetSector.Filters: [{
        FilterType: "Parent",
        DCParentKey: "ParentKeyField",
        DCChildKey: "ChildKeyField"
      }]
```

1:N 관계 (발주 → 품목, 프로젝트 → 작업, 주문 → 상세 등) 에서 부모 카드 안에 해당 자식 항목만 렌더링할 때.

## 4. 함정

- **상위 데이터연결 없는 `Parent` 필터 금지 (`[dc-parent-ctx]`)** — Parent 필터는 조상 Group 의 DataConnection 섹터와 매칭한다. 조상 체인에 DC 그룹이 없으면 매칭할 부모 행이 없어 무의미 — 독립 목록이면 Parent 필터를 빼고 일반 query, 1:N 이면 부모 Group 에 DataConnection 을 먼저 둘 것.
- **항목 표시/숨김**: 반드시 `TargetSector.Filters` 사용. `LoadScript` + `display:none` 으로 숨기지 말 것 — 전체 렌더 후 CSS 숨김은 낭비 + 레이아웃 이슈.
- **Combo 필터링** (Filter Combo → List 패턴): 리스트 group 에 `UseTargetSector: true` + `Custom` Filter (`return !_c.CtgFilter[0].Floor || sector.Floor == _c.CtgFilter[0].Floor`) → Combo change 이벤트에서 `f.Content('listGroupId').reload()` 호출. Script loop / display 토글 사용 금지.
- **DataConnection 위치**: 입력 컨트롤이 있는 상위 Group 에 배치. 버튼만 있는 Group (예: 저장 버튼 바) 에 배치하면 입력값 바인딩 안 됨.
- **DataConnection 가진 Group 자체는 `reload()` 불가** (동일 Id 그룹 복제 문제) — 래퍼 Group 의 Id 로 reload.
- **카테고리 이름은 숫자만으로 구성 금지**.
- **boolean 직렬화**: 운영 JSON 메타에서 `"true"` / `"false"` 로 보이는 건 직렬화 표현일 뿐 데이터형은 boolean. schema 는 boolean 강제.
