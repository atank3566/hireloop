# Group

컨테이너 노드. `ContentsType: "Group"` 단일. 자식으로 Group 또는 Control 보유.

## v1 단순화

코드(`const.js`)에는 `ContentsType: "Layout"` 분기가 남아 있지만, **컨트랙트 v1 에서는 Group 단일**. Layout이 가졌던 역할(Control들의 직접 부모)은 Group이 흡수. 별도 `GroupType`/`LayoutType` 필드 없음.

## 식별

- 키: `Id` 형식 **`^f_[1-9][0-9]*$`** — `f_` + 1 이상 양의 정수 (자리수 무관). 예: `f_1`, `f_42`, `f_8161`. **`f_0`/`f_01`/`f_abc` 불가**.
- **시나리오 전체 유일** — Group/Control/BottomButton 의 Id 는 한 시나리오 안에서 중복 금지. validate.mjs 의 `checkIdUniqueness()` 후검증으로 확인.
- discriminator: `ContentsType: "Group"`

## 핵심 필드

| 키 | 타입 | 비고 |
|---|---|---|
| `Id` | string | 🔴 필수 |
| `ContentsType` | const `"Group"` | 🔴 필수 |
| `ContentsName` | string | 표시명 (탐색기) |
| `ContentStyle` | string | 기본 `"None"` |
| `Width`, `Height` | sizeObject | |
| `UseDataConnection` | boolean | **모든 Group 에 반드시 명시 (false 라도)**. 데이터 연결 그룹은 `true` (+ DataConnection 객체), 정적/래퍼 그룹은 `false`. **키 생략 금지** — 생략하면 스튜디오가 `UseOldDataConnection:true` 를 자동 생성(레거시 렌더), `[group-dc]` 후검증이 차단. 직렬화 시 `"true"`/`"false"` 로 보일 수 있으나 데이터형은 boolean. |
| `DataConnection` | object | UseDataConnection=true 일 때 함께 |
| `ScrollType` | enum `""\|"ScrollY"\|"ScrollX"` | |
| `UseEmptyView` | boolean | query 그룹 권장. `false` 면 빈 데이터 시 "값이 없습니다" 류 안내 문구 노출, `true` 면 안내 미표시. (property-data.js createUseEmptyView — SWITCH) |
| `Padding`, `Margin` | spacing | `Btm` 키 |
| `DisplayStyle` | object | Flex 레이아웃 |
| `BgStyle`, `BorderStyle` | object | |
| `UseAbsoluteLayout` | boolean | true 시 flow에서 빠짐 |
| `AbsolutePosition` | spacing | 사용 방향만 키 포함 |
| `UseFixedSize` | boolean | |
| `Events` | object | Click, ScrollEnd 등 |
| `LoadScript` | string | |
| `Contents` | Node[] | 자식: Group \| Control |

스타일 객체 상세는 `style-objects.md` 참조.

## DataConnection (요약)

`UseDataConnection: true` 일 때 같이:

```jsonc
"DataConnection": {
  "TargetType": "category",
  "DataUsage": "default" | "new" | "update" | "detail" | "query",
  "CategoryName": "CtgXxx",
  // DataUsage별 추가 필드:
  //  default:       UseNewSector:true + OnlyIfNoSector:true
  //  new:           UseNewSector:true
  //  update/detail: UseTargetSector:true + TargetSector:{Filters:[{FilterType:"Status",Status:["active"]}]}
  //  query:         추가 필드 없음 / (옵션) UseTargetSector:true + UseNewSector:false + Filters
  // 상위 DataConnection 연동 (자식 Group):
  //  new   + UseDCLink:true + DCLinkCkey.DCLinkItems[]   ← 부모 키 자동 매핑
  //  query + UseTargetSector:true + Filters[Parent]      ← 부모 키 일치 섹터만
}
```

- query 그룹: `UseEmptyView` 는 DataConnection 밖 Group 레벨 — `false` 시 빈 데이터 안내 문구 노출.
- **하위 데이터 항목 콜렉션키 필수**: mock(또는 운영 데이터)을 박은 DC 그룹 하위에서 데이터가 연결되어야 하는 항목들은 콜렉션키(`LabelCKey`/`Ckeys`/`SaveValueKey` 등)로 바인딩해야 한다. 정적 텍스트만 두면 복제 카드가 같은 문구만 반복하고 데이터가 안 나옴 — [mockup-data.md](mockup-data.md) ★ 짝 규칙 / rules.md §5.6.
  - **`[dc-empty]` 후검증이 차단**: DC 그룹의 자식 트리(중첩 DC 그룹 안쪽은 제외) 에 `LabelCKey` / `Ckeys` / `SaveValueKey` 가 단 하나도 없으면 에러. 반복 카드는 표시할 키를 라벨/입력으로 1개 이상 노출, 상세 그룹은 캡션-값 패턴의 **값 라벨에 LabelCKey** 를 박을 것. 부모-자식 DC 패턴(`FilterType:Parent`) 에서도 양쪽 모두 자체 자식에 컬렉션키가 박혀 있어야 한다.
- boolean 키들은 직렬화 시 `"true"`/`"false"` 문자열로 보일 수 있으나 데이터형은 boolean (schema/md 모두 boolean 표기).
- 데이터형이 애매한 키는 [property-data.js](../../../public/javascripts/scenario-studio/property-data.js) 의 `createXxx` 함수 EditControl 타입을 진실원본으로 본다.
- 상세 분기 + 함정 카탈로그는 [data-objects.md](data-objects.md) 참조.

## 자식 제약

- `Contents[]` 에 Group 또는 Control. Step 자식 불가.
- 무한 중첩 가능 — 단 불필요한 중첩은 성능 저하.
- query 그룹에는 헤더/필터/추가버튼 같은 1번만 표시할 요소를 넣지 말 것 (그룹 자체가 복제됨). 비연결 래퍼로 분리.

## Group 네비게이션 / 이벤트 (UseMove vs UseEvents)

Group 도 클릭 시 Step 이동 또는 이벤트 호출 가능. UseMove 와 UseEvents 는 동시 활성화 지양 (의도 충돌). 둘은 상호배타적으로 사용.

### UseMove — 클릭 시 Step 이동

```jsonc
{
  "ContentsType": "Group",
  "UseMove": true,
  "MoveSteps": {
    "MoveStepOrder": ["Step4"],
    "Step4": { "Condition": "", "MoveTo": "Next", "Direction": "toBottom" }
  }
}
```

- `UseMove: true` 시 `MoveSteps` 필수 (schema 분기 강제).
- `MoveSteps.MoveStepOrder`: 이동 대상 StepId 배열 (`^Step[1-9][0-9]*$`).
- 각 StepId 키에 `{ Condition, MoveTo, Direction }` 옵션 객체 **동일 레벨 필수** — 누락 시 스튜디오 프로퍼티 패널 렌더 TypeError (`moveTypeCombo.value(valueObj[K.MOVETO])`). validators 의 `checkMoveStepsTargets` 가 후검증으로 잡음.
- `MoveTo` enum: `Next` / `Prev` / `Prev_ReStart` / `Init` (group.schema.json patternProperties 강제).

### UseEvents — 클릭 시 이벤트 호출

```jsonc
{
  "ContentsType": "Group",
  "UseEvents": true,
  "Events": {
    "ContentEvent": ["Click"],
    "Click": "CardClicked_E"
  }
}
```

- `Events.ContentEvent` 에 `Click` / `ScrollEnd` 선언.
- 이벤트 이름 키에 핸들러 이름 매핑.

> Group / Label / Button 모두 UseMove + MoveSteps 와 Click 이벤트를 지원. Group 은 `UseEvents` + `Events.ContentEvent: ["Click"]` 패턴, Label/Button 은 `UseClickEvent` + `Events.Click` 패턴 (control.md 참조).

## ★ InnerBlock — Group 메타 트리에서 사용 금지

부모 섹터의 배열 필드를 자식 Group 으로 반복 렌더링하는 InnerBlock 패턴은 **AI 생성 금지** ([no-inner-block] 정책).

스키마 차원에서 차단:

```jsonc
// group.schema.json
"UseInnerBlock":  false,   // JSON Schema property false → 어떤 값이든 거부
"InnerBlockKey":  false
```

따라서 **Group 메타에 `UseInnerBlock` / `InnerBlockKey` 키를 두면 검증 실패** — 별도 후검증 없이 생성 단계에서 차단된다.

대안 패턴 (반복 렌더링이 필요할 때):

| 의도 | 권장 패턴 |
|---|---|
| 카테고리 섹터 수만큼 반복 | `DataUsage: "query"` + `CategoryName` (DataConnection 5종 중 query) |
| 부모 row 안의 자식 배열 표시 | 자식 배열을 별도 카테고리로 분리 + 자식 group 에 별도 query DataConnection |

> **별개 개념: Service/DataSource 결과 매핑의 InnerBlock** — `events.schema.json` / `data-sources.schema.json` / `service/*` 의 `UseInnerBlock` / `InnerBlocks` / `NotSeperateInnerBlock` 은 Service 결과 데이터의 구조 매핑(부모 row 객체 안의 자식 배열 키 식별)을 위한 별개 개념. 운영 메타에서만 등장하며 `[no-service]` 와 함께 차단된다 — Group 메타 트리의 InnerBlock 과 혼동하지 말 것 (events.md §2.3.3 참조).

## 함정

- `reload()` 는 Group에만. Control 직접 reload 시 에러.
- DataConnection 가진 Group 자체는 `reload()` 불가 (동일 Id 그룹 복제 문제).
- `Padding: {}` (빈 객체) 도 허용되나, 사용 방향이 있으면 `{Btm: "10", SizeUnit: "px"}` 형태로 명시.
- `ContentStyle: ""` 보다 `"None"` 사용.
- **`UseDataConnection` 키 생략 금지** — 비연결 그룹도 `"UseDataConnection": false` 를 명시. 키가 없으면 스튜디오(`convertTopLevelDataConnection`)가 레거시로 간주해 `UseDataConnection:false` + **`UseOldDataConnection:true`** 를 자동 생성하고 구버전 데이터연결 프로퍼티로 렌더한다. `[group-dc]` 후검증이 차단.
- `UseMove` 와 `UseEvents` 는 동시 활성화 지양 (의도 충돌). 클릭으로 Step 이동만 원하면 UseMove, 이벤트만 원하면 UseEvents.
- **`Tab` 컨트롤을 감싸는(조상) Group 에는 `UseMove` 금지** — 탭 헤더 클릭이 그 Group 의 Step 이동을 트리거해 탭 전환 대신 화면이 넘어가 버린다. `[tab-move]` 후검증이 차단. 상세는 [control/tab.md](control/tab.md) "부모/형제 제약".
- `UseInnerBlock` / `InnerBlockKey` 등장 금지 — 위 InnerBlock 섹션 참조.
- `RepeatStyle` 은 구 메타로 v1 에서 제거. 생성 결과물에 출력 금지.
