# data-connection — B 경로: 마스터-디테일 → 데이터연결 매핑

B 경로(구조 제공 또는 목록/조회성 추론)에서 마스터-디테일을 데이터연결로 설계하는 규칙. **정확한 필드 문법은 같은 스킬의 `docs/group.md`·`docs/data-objects.md`·`docs/data-sources.md` 와 `intent-rules.md` 가 정본** — 여기서는 keyRole → DataUsage 매핑과 목업 계획만 다룬다.

## DataUsage 4모드 (어떤 keyRole 이 어디로)

| 상황 | DataUsage | 적용 |
|---|---|---|
| 목록/카드 반복 렌더 (디테일·마스터목록) | `query` | Group `UseDataConnection:true` + `DataConnection{TargetType:'category', DataUsage:'query', CategoryName}`. 섹터 수만큼 복제 |
| **단건 마스터/헤더 바인딩** (반복 아님, 1건 표시) | `default` | Group `UseDataConnection:true` + `DataConnection{DataUsage:'default', CategoryName}`. 그 카테고리 1섹터를 단건 바인딩 |
| 신규 입력 (빈 폼 저장) | `new` | mock 면제 — 빈 카테고리에 억지 addSector 금지 |
| 리스트에서 1건 선택해 수정 | `update` | activeSector 받아 폼 채움 |
| 선택 건 읽기전용 상세 | `detail` | `UseTargetSector:true` + `Status:['active']`, 입력 불가 표시 |

## 마스터-디테일(1:N) = 부모 + 자식 query + (조인키)

keyRole 매핑:
- `master` → 부모 Group 바인딩. **목록형이면 `DataUsage:"query"`(섹터 수만큼 반복), 단건 헤더형(입력 화면 등)이면 `DataUsage:"default"`(1섹터 단건).**
- `detail` → 부모 Group **안쪽**의 자식 Group `DataUsage:"query"` + `TargetSector.Filters:[{FilterType:"Parent"}]`.
- `link` → 그 Parent 필터의 조인 키: 부모키 `DCParentKey` / 자식키 `DCChildKey` 로 지정.
- `detail`(상세 보기 화면/영역) → `DataUsage:"detail"`.

즉 sample_spec 의 "마스터 Group + 디테일 행 반복" 은 B 에서 **부모 Group(바인딩) 안에 자식 query Group(Parent 필터)** 으로 표현된다. 단순 1단 목록(부모-자식 아님)이면 자식 없이 query Group 하나.

### ★ 마스터도 반드시 바인딩 + 부모-자식 조인 (정적 마스터 금지)

입력/단건 화면이라도 **마스터(헤더)를 비연결 정적으로 두고 디테일만 query 하지 말 것**(S-03 실패). 마스터도 자기 카테고리에 바인딩하고, 디테일을 그 **자식**으로 조인한다:

- 마스터 Group → `UseDataConnection:true`, `DataUsage:"default"`(단건) 또는 `"query"`(목록), `CategoryName:"CtgImport"`. 헤더 표시 라벨은 `LabelCKey` 로 마스터 섹터 필드 바인딩.
- 디테일(품목정보) Group → 마스터 Group **안쪽**에서 `DataUsage:"query"`, `CategoryName:"CtgImportItem"`, `TargetSector.Filters:[{FilterType:"Parent"}]`, `DCParentKey`/`DCChildKey` 로 마스터 키와 조인.
- Init `intent.mock` 에 마스터 카테고리 1섹터 + 그에 속한 자식 카테고리 N섹터(조인키 일치).

### ★ 같은 카테고리를 여러 그룹이 쓰면 상위 그룹 하나로 묶어 연결

마스터 카드와 요약(예: `MasterCard` + `MasterSummary`)이 **같은 카테고리를 각각 따로 연결**하면 안 된다(S-02 실패: CtgMaster 를 두 그룹이 중복 연결). **공통 상위 Group 하나로 감싸 그 상위 Group 에만 `DataConnection` 을 건다.** 안쪽 자식 그룹들은 같은 섹터 컨텍스트를 상속하므로 각자 연결하지 않고 `LabelCKey`/`Ckeys` 바인딩만 한다.

```
부모래퍼 Group(UseDataConnection:true, DataUsage:"default"/"query", CategoryName:"CtgMaster")   ← 연결은 여기 한 번
  ├ MasterCard Group(UseDataConnection:false)   ← 같은 섹터 상속, Label LabelCKey 바인딩
  └ MasterSummary Group(UseDataConnection:false) ← 같은 섹터 상속, Label LabelCKey 바인딩
```

## 그룹을 한두 겹 더 감싼다 (중첩 래핑 — 얕으면 실패)

정답 시나리오는 반복/데이터연결 영역을 **여러 겹 Group 으로 감싼다**(관찰된 중첩 깊이 6~8). 생성물이 얕으면(깊이 2~3) 데이터연결 래핑이 부실해 레이아웃·바인딩이 깨진다. 표준 래핑:

- **조회 결과**: `스크롤 Group(ScrollType:"ScrollY", UseDataConnection:false) > 리스트 Group(UseDataConnection:true, DataUsage:"query") > row Group > [마스터섹션 + 디테일섹션]`. row 안에서 마스터 정보와 자식 목록을 다시 Group 으로 분리(Border-bottom 으로 구분).
- **입력**: `마스터 Group(흰 배경) + graybg Group(회색, ScrollY) > contentsWrap Group(흰 박스, padding/radius) > 리스트 Group > row Group`.
- 데이터연결(`UseDataConnection:true` + `DataConnection`)은 **반복이 일어나는 그 Group** 에 붙인다(바깥 스크롤 래퍼는 false). 한 겹 더 감싸 query 그룹을 격리하면 헤더·요약을 같은 스크롤 안에 두면서도 반복만 바인딩된다.
- 영역 분리는 `DisplayStyle.rowGapValue`(예 20px) + Padding + Border 로.

## 마스터 영역도 데이터연결 + 선택 반영 (정적으로 두지 말 것)

마스터/헤더 영역을 전부 정적으로만 두지 않는다. 선택·표시가 데이터로 흐르게 한다:

- **단건 마스터 카드**(반복 아님)의 표시 라벨은 `LabelCKey` 로 마스터 카테고리 섹터에 바인딩(현실적 mock 1섹터). 정말 고정 문구만 정적.
- **종속 선택(Combo→Combo)**: 출고창고 선택 → 입고창고 옵션이 달라지는 종속은, 자식 Combo 의 Dialog `ComboList` 에 `Ckeys` 를 바인딩하고 그 옵션 카테고리에 **mock 을 다중(최소 2 옵션 이상) 으로** 박아 선택 종속이 시각적으로 드러나게 한다. (프로토타입에선 실제 필터 로직 대신 mock 옵션으로 표현.)
- 마스터 선택값을 다음 Step 으로 넘길 땐 카드/버튼 `UseMove:true` + `MoveSteps.MoveStepOrder` + 각 Step `MoveTo:"Next"`(네비 채널). 스크립트 흐름제어 금지.

## 콜렉션키 바인딩 (정적 텍스트 금지)

- 반복 Group 안에서 데이터가 흐르는 항목은 섹터 필드를 **`LabelCKey`/`Ckeys` 로 바인딩**한다. 정적 `labeltext` 로 박으면 모든 카드가 같은 문구가 된다.
- 1번만 보일 요소(제목·총건수 요약·"신규" 버튼)는 **query Group 바깥** 비연결 래퍼에 둔다.
- `CategoryName` 은 `Ctg` 접두 + PascalCase (예: `CtgOrder`, `CtgOrderItem`).
- **콜렉션키(`Ckeys`/`LabelCKey`/`CtrlDisplayCkey`)에 `f` 접두 금지.** 스펙에 키/필드명이 명시되면 **대소문자·표기 그대로**(예 `LotNo`·`BLNO`, 임의 camelCase 변환 금지), 미제공이면 의미있는 camelCase. ❌ `fOrderNo`·`fLotNo`.
- 예약어 금지: `status`/`isActive`/`length` 등 + JS 예약어 (정본: `schemas/naming-objects.schema.json`).

## 목업 동반 (필수)

DataConnection/Ckeys 를 박으면 **반드시 시작 Step.Init 에 `intent.mock` 으로 해당 카테고리 mock 섹터를 동반**한다 — 없으면 `[proto]` 차단(SKILL.md "데이터 표시 결정" 참조).

- 부모·자식 둘 다 mock 을 박아 조인이 실제로 그려지게 한다 (부모 2건+ / 각 부모에 자식 여러 건).
- `new` 모드 카테고리엔 빈 addSector 를 억지로 넣지 않는다(mock 면제).
- 배치 = named handler: `Step.Events.Init:"Step1Init"` + `scenario.Events.Step1Init` 안에 `intent.mock`.

## 스펙(.spec.md)에 적는 법

frontmatter:
```yaml
route: B
dcModes: [query, detail, parent-child]
categories:
  CtgOrder:       { role: master, keys: [주문번호], fields: [주문일자, 합계금액] }
  CtgOrderItem:   { role: detail, parentKey: 주문번호, childKey: 주문번호, fields: [상품명, 수량, 단가] }
```
본문 Step 설명에 "부모 query → 자식 query(Parent 필터, 주문번호 조인) → 상세 detail" 와 "Init mock: 주문 2건 + 각 상품 3건" 을 적는다. 자세한 본문 형태는 `templates/master-detail.spec.md`.

## ★ 생성 후 데이터연결 보장 게이트 (스펙 경로 Phase 2 직후, 블로킹)

`/flex-spec` 스펙 경로는 Phase 2(시나리오 생성) 가 끝나면 **반드시** 이 게이트를 통과해야 한다. 이건 `lint.md` 의 비블로킹 보고와 다른 **블로킹 점검**이다 — 데이터연결이 빠졌으면 통과시키지 말고 **샘플 시나리오를 참조해 추가 수정으로 주입**한다.

1. **점검** — 산출 시나리오를 본다. 화면이 **목록·카드·"~별"·"~내역"·조회·반복·선택지(Combo/Search)·마스터-디테일** 성격인데 시나리오 전체에 `UseDataConnection:true` + `DataConnection` + 시작 Step.Init `intent.mock` 이 **0건이면 게이트 실패** → 다음 단계로.
2. **샘플 참조** — `examples/index.json` 에서 **구조(`stepCount`/`patterns`/`controlTypes`)가 유사한 `design/` 샘플 시나리오**를 고른다. 도메인 글자 일치가 아니라 구조로 고른다. **반드시 먼저 `flex-scenario validate --no-write <후보 example>` 로 `ok:true` 를 확인**해 baseline 자격을 검증한다(`ok:false` 예제를 기준 삼지 말 것. ★ example 검증엔 `--no-write` 필수 — 기본 validate 는 `ok:true` 시 본문을 입력 파일에 write-back 해 참조 예제를 변형시킨다).
3. **key-diff → 주입** — 그 샘플의 데이터연결 노드와 내 산출물을 **키 단위로 diff** 한다. 빠진 것을 `Edit`(부분 수정, 전체 Write 금지)으로 주입한다:
   - 반복/목록 Group → `UseDataConnection:true` + `DataConnection{TargetType:'category', DataUsage:'query', CategoryName:'Ctg…'}` + 자식 `Ckeys`/`LabelCKey`.
   - 마스터-디테일이면 부모 query(또는 단건 `default`) + 자식 query(`TargetSector.Filters:[{FilterType:'Parent'}]`, `DCParentKey`/`DCChildKey` 조인) — 이 절 위쪽 "마스터-디테일(1:N)" 규칙대로.
   - 시작 Step.Init 에 named handler(`Step.Events.Init:"Step1Init"` + `scenario.Events.Step1Init` 안 `intent.mock`)로 해당 카테고리 mock(부모 2~3건 × 자식 2~3건, 조인키 일치) 동반.
   - **정적 Label 복제로 도망가지 않는다.** 단건 마스터/헤더도 정적으로 두지 말고 `DataUsage:"default"` + `LabelCKey` 로 바인딩한다.
4. **예외 (게이트 면제)** — 진짜 단건 고정 문구만 있는 표시 화면이거나, 실제 `scenario.DataSources`(`Fixed`/`Grid`) 가 채워져 정상 바인딩인 경우만 데이터연결 없이 통과. 신규 입력(`DataUsage:"new"`) 폼은 mock 면제(빈 addSector 금지).
5. **재검증** — 주입 후 `flex-scenario validate <scenario>` 를 다시 `ok:true` 까지 통과시킨다. (`[proto]`/`[mock-init]` 이 게이트와 같은 신호 — validate 가 동반 차단해 준다.)

> 직접 생성(기본) 경로에도 빈/정적 회귀 금지는 적용되지만(SKILL.md "데이터 표시 결정"), 이 **"샘플 참조 후 추가 수정으로 주입"하는 블로킹 게이트는 스펙 경로 전용**이다 — 스펙 경로는 데이터연결을 끝까지 보장한다.
