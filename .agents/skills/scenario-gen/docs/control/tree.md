# Tree

> 공식 가이드: <https://docs.flextudio.com/flextudio/scenario/component/control/tree>

계층형(부모-자식) 데이터를 트리 구조로 표시. `NodeId` / `ParentId` 로 **flat array** 의 부모-자식 관계를 표현한다.

## 스키마

`control/tree.schema.json` — `controlBase` + 분기 키.

## 필수 / 핵심 속성

| 속성 | 필수 | 설명 |
|---|---|---|
| `DataSourceName` | ★ | 트리 데이터 DataSource 이름. Fixed/Collection/Service/API 모두 가능. |
| `NodeId` | ★ | 각 노드 고유 ID 필드명 (DataSource Items 의 키 이름). |
| `ParentId` | ★ | 부모 노드 ID 필드명. 루트는 `''` / `null` / `undefined` / 자기참조(`parentId===nodeId`). |
| `Title` | ★ | 노드 표시 텍스트 필드명. |
| `SubTitle` | | (선택) 노드 부제목 필드명. |
| `Icon` | | (선택) 노드 아이콘 필드명. |
| `UseExpandAll` | | 초기 전체 펼침. default=false. |
| `UseSearchBar` | | 검색바 표시. default=false. |
| `UseMultiData` | | 다중 선택 모드 (체크박스). default=false. |
| `UseSelectAllData` | | '전체선택' 체크박스 표시 (UseMultiData=true 일 때). default=false. |
| `UseParentAutoSelect` | | 자식 전체 체크 시 부모 자동 체크 (UseMultiData=true 일 때). default=true. |
| `CategoryName` | | 다중 선택 모드에서 체크된 노드가 저장되는 카테고리. |
| `CollectionMapper` | | `{ MapperOrder, 대상Ckey: 원본필드, ... }` 매핑. |
| `Ckeys` | | 단일 선택 시 부모 카테고리, 다중 선택 시 CategoryName 의 키. |

> **CRITICAL — 필드명 일치:** DataSource Items 의 키 이름과 Tree 컨트롤의 `NodeId` / `ParentId` / `Title` 값이 **정확히 일치**해야 한다.

## 데이터 구조 — flat array

DataSource 의 Items 는 **계층 정보를 가진 평탄(flat) 객체 배열**. 각 row 가 한 노드이고 `ParentId` 값으로 부모-자식 관계를 표현. 엔진(`public/engine/control/tree.js`) 진실원본 기준.

### DataSource 자체의 형태

| 폼 | 엔진 처리 (`getTreeResult.init`) |
|---|---|
| **배열** `[ {...}, {...} ]` | 그대로 사용 (가장 일반) |
| **단일 객체로 감싼 배열** `[ {...전체결과...} ]` (length===1) | 첫 원소로 자동 unwrap (`data = data[0]`) — Service 응답이 한 번 더 감싼 경우 대응 |
| **JSON 문자열** | `changeObjStrToObject()` 로 자동 parse |
| 비어있음 / null | 렌더 skip — 에러 없이 빈 트리 |

배열 내부 인덱싱은 `1..N` 번호 키로 재매핑 (NodeId 가 키가 아님). 따라서 NodeId 값이 중복되어도 row 자체는 유지된다.

### Items[*] (각 row) 필드 규약

| 메타 키 | 데이터 필드명 (=ctrlJson 값) | 필수 | 의미 |
|---|---|---|---|
| `NodeId` (기본 `'NodeId'`) | 데이터 row 의 ID 필드명 | ★ 필수 | 노드 고유 식별자. **이 키가 없는 row 는 엔진이 건너뜀** (`hasOwnProperty(NodeID)` 체크). 시나리오 안에서 중복 안 되도록 권장 (다중 모드 체크박스 DOM id 충돌). |
| `ParentId` (기본 `'ParentId'`) | row 의 부모 ID 필드명 | ★ 필수 | 부모 노드의 NodeId 값. 루트면 `''` / `null` / `undefined` / `NodeId 와 동일값` (자기참조) 중 하나. |
| `Title` (기본 `'Title'`) | row 의 표시 텍스트 필드명 | ★ 필수 | 노드 라벨로 그려질 문자열. |
| `SubTitle` | (선택) | — | 보조 텍스트 — Title 아래 한 줄 더. 미지정/빈문자열 시 미표시. |
| `ThumbNail` | (선택) | — | 노드 썸네일 이미지 필드명. row 값이 URL/경로면 `<img class="img-thumbnail">` 렌더. **키 표기 `ThumbNail`** (engine const `K_THUMBNAIL='ThumbNail'` — `Thumbnail` 소문자 n 아님). |
| `Icon` | (선택) | — | 노드 좌측 아이콘 필드명. row 값 형식에 따라 자동 분기 (아래 표). |
| `SubIcon` | (선택) | — | 노드 우측 보조 아이콘 필드명. Icon 과 동일 형식 분기. 렌더 클래스만 `icon-sub` 로 차이 — engine const `K_SUB_ICON='SubIcon'`. |

> 메타 키 (좌측) 의 값으로 **데이터의 필드명** 을 적는다. 예: `"NodeId": "nodeId"` → 엔진이 각 row 에서 `row.nodeId` 를 NodeId 값으로 사용. 데이터 필드명이 우연히 'NodeId'/'ParentId'/'Title' 이면 메타 키 자체를 생략해도 기본값으로 동작.

### Icon / SubIcon — row 값 형식별 렌더 (engine `getImageHTML`)

`Icon` / `SubIcon` 으로 지정한 메타 키에서 가져온 **row 값** 의 패턴에 따라 자동 분기:

| row 값 형식 | 렌더 결과 | 용도 |
|---|---|---|
| `B_xxx` (B_ prefix) | `<div class="imgSvgMask B_xxx icon-node">` | 디자인 시스템 라인 아이콘 (SVG mask) |
| `C_xxx` (C_ prefix) | `<img src="../public/imagesCommon/icon/C_xxx.svg">` | 컬러 아이콘 |
| `icon` 부분 문자열 포함 (URL 형식 아님) | `<div class="imgSvgMask ... icon-node">` | 라인 아이콘 처리 (legacy 경로) |
| `http://` / `https://` / `//` 시작 URL | `<img src="${val}" class="img-thumbnail">` | 외부 URL 이미지 |
| 그 외 일반 문자열 | `<img src="${val}" class="img-thumbnail">` | 상대 경로 이미지 |

`SubIcon` 만 다른 점: 컨테이너 클래스가 `icon-sub` (Icon 은 `icon-node`).

### Icon / SubIcon / ThumbNail 데이터 예

```jsonc
{
  "TreeDS": {
    "DataSourceType": "Fixed",
    "Items": [
      { "nodeId": "D01", "parentId": "",    "nodeName": "본사",       "thumb": "/img/dept/hq.png",   "icon": "B_000_004", "subicon": "C_status_ok" },
      { "nodeId": "D02", "parentId": "D01", "nodeName": "인사팀",     "thumb": "",                    "icon": "B_000_007", "subicon": "" },
      { "nodeId": "D03", "parentId": "D01", "nodeName": "외주협력업체","thumb": "https://example.com/logo.png", "icon": "", "subicon": "C_status_pending" }
    ]
  }
}
```

→ Tree 컨트롤 메타:
```jsonc
{
  "ControlType": "Tree",
  "DataSourceName": "TreeDS",
  "NodeId":   "nodeId",
  "ParentId": "parentId",
  "Title":    "nodeName",
  "ThumbNail":"thumb",
  "Icon":     "icon",
  "SubIcon":  "subicon"
}
```

- `D01` 행: 좌측 라인 아이콘(`B_000_004`) + 썸네일 + 우측 컬러 아이콘.
- `D02`: `thumb`/`subicon` 빈 문자열 → 해당 슬롯 비표시. 좌측 아이콘만 렌더.
- `D03`: 외부 URL 썸네일 + 우측 컬러 아이콘. Icon 빈 문자열 → 좌측 아이콘 슬롯 비표시.

> **빈 값(`""`/null/undefined) → 슬롯 비표시** (`getImageHTML(val)` 첫 줄 `if (!val) return ''`). row 마다 슬롯이 있어야/없어야 하는 게 아니라, 값 유무로 결정.

### Root / 부모-자식 매칭 규칙 (엔진 `firstNodes` + `getNodes`)

- **Root 판정**: `node[ParentId] === undefined` OR `node[ParentId] === null` OR `node[ParentId] === ''` OR `node[ParentId] === node[NodeId]` (자기참조).
- **자식 매칭**: `String(child[ParentId]) === String(parent[NodeId])` 그리고 `child[ParentId] !== child[NodeId]` (자기참조 제외). 비교는 **문자열 변환 후** 일치 검사 — `nodeId: 1` (number) 과 `parentId: "1"` (string) 도 매칭됨.
- 같은 부모 ID 를 가진 row 는 형제로 묶임. 정렬은 DataSource Items 순서 그대로.

### 자주 발생하는 깨짐 패턴

| 증상 | 원인 | 해결 |
|---|---|---|
| 첫 레벨(root) 만 보이고 자식이 안 보임 | 자식 row 의 `ParentId` 가 부모 row 의 `NodeId` 와 **문자열 비교에서 다름** (공백/대소문자/타입 차이 아닌 실제 다른 값) | 데이터 정합성 재확인. 엔진이 `String()` 캐스팅하므로 1 vs "1" 은 문제 없음. |
| 일부 row 가 트리에 안 나옴 | row 에 `NodeId` 필드 누락 | row 마다 `NodeId` 가 반드시 있어야 함 — Service/Fixed 의 컬럼 누락 검토. |
| 무한 들여쓰기 / stack overflow | `ParentId === NodeId` 가 root 가 아닌데 잘못 들어감 | root 자기참조는 1개만 허용. 비 root 노드는 다른 부모 가리켜야 함. |
| 한 row 가 root + child 양쪽으로 등장 | 같은 `NodeId` 가 여러 row 에 존재 | NodeId 는 시나리오에서 유니크해야 함. |

### 예시 — Fixed DataSource 풀폼

```jsonc
{
  "TreeDS": {
    "DataSourceType": "Fixed",
    "Items": [
      { "nodeId": "D01", "parentId": "",    "nodeName": "경영지원본부", "memo": "본부" },
      { "nodeId": "D02", "parentId": "D01", "nodeName": "인사팀",       "memo": "팀" },
      { "nodeId": "D03", "parentId": "D01", "nodeName": "총무팀",       "memo": "팀" },
      { "nodeId": "D04", "parentId": "",    "nodeName": "개발본부",     "memo": "본부" },
      { "nodeId": "D05", "parentId": "D04", "nodeName": "프론트엔드팀", "memo": "팀" }
    ]
  }
}
```

→ Tree 컨트롤에서 `NodeId: "nodeId"`, `ParentId: "parentId"`, `Title: "nodeName"` 으로 매핑. `SubTitle: "memo"` 추가하면 한 줄 더 표시.

> **자기참조 root 변형** — 일부 운영 데이터는 root 를 `ParentId === NodeId` (예: `D01.parentId === "D01"`) 로 표현. 엔진이 이걸 root 로 정상 인식 (line 211). `""`/`null`/누락 형태 모두 호환.

> **DataSourceType 호환**: `Fixed` / `Grid` / `Collection` / `Service` / `API` 전부 동일한 flat row 형태 기대. Collection/Service 응답이 `[ { Items: [...] } ]` 처럼 한 번 더 감싸져 와도 엔진의 length===1 unwrap 으로 처리. 그 이상 중첩이면 시나리오의 데이터 변환 단계에서 평탄화 필요.

## 단일 선택 모드 (Selected)

노드 클릭 시 `Selected` 이벤트가 발화하고, `CollectionMapper` 로 선택된 노드 데이터가 부모 카테고리의 activeSector 에 매핑된다.

```jsonc
{
  "ControlType": "Tree",
  "Id": "f_tree1",
  "ControlDefaultName": "Tree1", "ControlName2": "Tree1",
  "Caption": "{{부서}}",
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "SizeValue": "400", "SizeUnit": "px", "MatchText": false },
  "isColumnCtrl": false,
  "DataSourceName": "TreeDS",
  "NodeId": "nodeId",
  "ParentId": "parentId",
  "Title": "nodeName",
  "CollectionMapper": {
    "MapperOrder": ["selectedId", "selectedName"],
    "selectedId": "nodeId",
    "selectedName": "nodeName"
  },
  "Ckeys": ["selectedId", "selectedName"],
  "UseExpandAll": true,
  "UseSearchBar": true,
  "UseEvents": true,
  "Events": {
    "TreeOrder": ["Selected"],
    "Click": "",
    "Selected": "TreeNodeSelect_E"
  }
}
```

> 단일 선택 시 래퍼 그룹에 `UseDataConnection: true` + `DataConnection.CategoryName` 필수 (선택값 저장 위치).

## 다중 선택 모드 (Checked)

`UseMultiData: true` 로 체크박스 활성화. 체크된 노드가 `CategoryName` 카테고리에 섹터로 추가/제거된다.

```jsonc
{
  "ControlType": "Tree",
  "Id": "f_tree1",
  "DataSourceName": "TreeDS",
  "NodeId": "nodeId", "ParentId": "parentId", "Title": "nodeName",
  "UseMultiData": true,
  "UseSelectAllData": true,
  "UseParentAutoSelect": true,
  "CategoryName": "CtgSelectedNodes",
  "CollectionMapper": {
    "MapperOrder": ["selNodeId", "selNodeName"],
    "selNodeId": "nodeId",
    "selNodeName": "nodeName"
  },
  "Ckeys": ["selNodeId", "selNodeName"],
  "UseEvents": true,
  "Events": {
    "TreeOrder": ["Selected", "Checked"],
    "Click": "",
    "Selected": "",
    "Checked": "TreeNodeCheck_E"
  },
  "isColumnCtrl": false
}
```

> 다중 선택 모드는 Tree 자체의 `CategoryName` 으로 카테고리 관리. 래퍼 그룹의 DataConnection 은 별도 용도(표시/검색 등) 로만 사용.
>
> 체크 → `_collections[CategoryName].addSector(...)` / 해제 → `.remove(suid)`. 부모 노드 체크 시 모든 자식도 체크/해제 (`UseParentAutoSelect: true` 일 때).

## 이벤트 (제한)

`Events` 는 `_base.schema.json#/$defs/treeEvents` 가 적용. **`TreeOrder`** 키 사용 (TreeEventOrder 아님 — 운영 메타에서 자주 틀리는 함정).

| 이벤트 | 발화 | 모드 |
|---|---|---|
| `Selected` | 노드 클릭 | 단일/다중 모두 |
| `Checked` | 체크박스 토글 | UseMultiData=true 전용 |

> **CRITICAL — `Click: ""` 반드시 포함** (빈 문자열). 운영 컨벤션 — 누락 시 일부 빌드에서 동작 이상.
>
> **`Selected` / `Checked` PascalCase** — `SELECTED` / `CHECKED` 등 대문자 형식 금지.

## `UseDCLink` — 데이터 연결고리 (운영 메타 잔존)

`UseMultiData: true` + 상위 Group `UseDataConnection: true` 조합일 때만 스튜디오 프로퍼티 패널에 표시되는 사용자 수동 설정 필드. 부모 카테고리의 필드와 Tree 가 속한 컬렉션의 필드를 묶어 신규 섹터 추가 시 부모 키를 자동으로 채워준다 (property-data.js `createDCLinkGroup` 진실원본 — visibility: `meta[K.TREE.USE_MULTIDATA] && dcInfo.useData`).

| 키 | 비고 |
|---|---|
| `UseDCLink` | boolean strict. true 면 `DCLinkCkey` 필수. ★ **AI 생성 시 미포함** — 사용자 수동 설정 전용. |
| `DCLinkCkey.DCLinkItems[]` | `{ DCParentKey, DCChildKey }` 쌍 배열. 부모/자식 컬렉션의 필드명을 묶음. |

```jsonc
// 운영 메타 예 (참고용 — AI 생성에는 두지 말 것)
{
  "ControlType": "Tree",
  "UseMultiData": true,
  "UseDCLink": true,
  "DCLinkCkey": {
    "DCLinkItems": [
      { "DCParentKey": "CompanyId", "DCChildKey": "CompanyId" }
    ]
  }
}
```

DCLinkCkey 정의는 `_base.schema.json#/$defs/useDCLinkBlock` 의 properties 를 그대로 공유 — Calendar(InputDate 내부) / List(Search 내부) 와 동일 스키마.

> **AI 생성 차단**: `UseDCLink` / `DCLinkCkey` 는 [control.md §AI 샘플 생성 금지 키](../control.md#ai-critical) 정책의 단일 진실원본 표에 등재. `AI_GEN_STRICT=1` 환경변수로 validate.mjs 가 `[ai-gen]` 태그로 차단.

## reload — 래퍼 그룹 Id 사용

```javascript
f.Content('f_treeWrapGroup').reload();   // ✓ 래퍼 그룹
f.Content('f_tree1').reload();           // ✗ 에러 — Tree 컨트롤 자체에는 reload 불가
```

## 함정

- **TreeEventOrder 가 아니라 TreeOrder** — 자주 틀리는 키 이름.
- **`Click: ""` 반드시 포함** — 빈 문자열이라도 누락 금지.
- 이벤트 명은 PascalCase (`Selected` / `Checked`) — 대문자(`SELECTED`) 금지.
- 단일 선택 모드에서 래퍼 그룹 `UseDataConnection: true` 필수 (선택값 저장 위치).
- 모바일에서 Tree + 리스트를 좌우(row) 배치 금지 → 상하(column) 배치.
- `reload()` 는 래퍼 그룹 Id — Tree 컨트롤 자체 Id 사용 금지.
- **DataSource Items 의 필드명과 NodeId/ParentId/Title 값이 정확히 일치** — 메타의 우측 값(예: `"NodeId": "nodeId"` 의 `"nodeId"`)이 데이터 row 의 실제 키와 동일해야 함.
- **row 에 NodeId 필드 누락 시 그 row 는 트리에 안 나타남** — 엔진이 조용히 skip (에러 없음).
- **루트 노드 표현** — `ParentId` 가 `""` / `null` / `undefined` / `NodeId 와 동일값` 4가지 모두 OK. 일관성 위해 한 시나리오 안에서는 하나로 통일 권장.
- **NodeId 중복 금지** — 같은 `NodeId` 가 여러 row 에 있으면 형제 매칭/체크박스 상태가 깨짐. 다중 모드 체크박스 DOM id 가 `tree<NodeId>_<treeAreaId>` 라 중복 시 첫 매치만 동작.
- **부모-자식 비교는 String 캐스팅 후 일치** — `nodeId: 1` (number) + `parentId: "1"` (string) 은 문제 없으나, 값 자체가 다르면 (예: `"D01"` vs `"d01"`) 매칭 실패.
