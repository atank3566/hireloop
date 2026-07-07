# patterns-cheatsheet — 자주 쓰는 패턴 치트시트

SKILL.md 빌드 절차 중 catalog 조회 ~ `flex-scenario validate` 사이에서 막힐 때 본다.

## DataUsage 분기 (Group 의 DataConnection)

| 값 | 동작 | 필수 추가 필드 |
|---|---|---|
| `query` | 그룹 자체가 카테고리 섹터 수만큼 복제 — 리스트 카드 1장의 Group 에 박는다 | `Group.ScrollType:"ScrollY"` + `Height.MatchText:true` |
| `new` | 진입 시 빈 섹터 자동 생성 + 바인딩 — 신규 폼 | `UseNewSector:true` |
| `update` | activeSector 직접 바인딩 (읽기+쓰기) — 수정 폼 | `UseTargetSector:true` + `TargetSector.Status:["active"]` |
| `detail` | activeSector 읽기 전용 — 상세 화면 | `UseTargetSector:true` + `TargetSector.Status:["active"]` |
| `default` | 섹터 없으면 생성, 있으면 기존 | `UseNewSector:true` + `OnlyIfNoSector:true` |

`UseNewSector` / `OnlyIfNoSector` / `UseTargetSector` 는 boolean `true` — 문자열 금지.

## query 그룹 강제 (반복 카드)

리스트 카드 1장을 표현하는 Group:
```jsonc
{
  "ContentsType": "Group",
  "Id": "f_100",
  "UseDataConnection": true,
  "DataConnection": { "DataUsage": "query", "CategoryName": "items" },
  "ScrollType": "ScrollY",
  "Height": { "MatchText": true, "SizeValue": "", "SizeUnit": "text" },
  "Width":  { "MatchText": false, "SizeValue": "100", "SizeUnit": "%" },
  "Contents": [ /* 카드 내부 컨트롤들 */ ]
}
```
헤더/필터/추가 버튼처럼 1번만 표시할 요소는 **query 그룹 바깥** 비연결 래퍼 Group 에 둔다.

`UseInnerBlock` / `InnerBlockKey` / `RepeatStyle` 절대 등장 금지 — `[no-inner-block]` 후검증에서 차단.

## list-detail 2-step 패턴

- `Step1` (목록): `Contents[]` 안에 헤더 Group(비연결) + 카드 Group(`DataUsage:"query"`). 카드 Group 에 `UseMove:true` + `MoveSteps.MoveStepOrder:["Step2"]` + `MoveSteps.Step2:{}` 옵션 객체.
- `Step2` (상세): `Contents[]` 안에 `DataUsage:"detail"` (또는 `update`) Group. `BackButton.Next:"None"`.
- `Step.Next:["Step2"]` (Step1) — `MoveSteps` 가 트리거 역할. `[step-nav]` 후검증 통과.

`MoveSteps` 는 배열이 아니라 **순서 배열 + StepId 별 옵션 객체** 가 같은 레벨에 공존하는 구조:
```jsonc
"MoveSteps": { "MoveStepOrder": ["Step2"], "Step2": { /* options */ } }
```
옵션 객체 누락 시 런타임 TypeError.

## 단순 입력 폼 (1-step)

`StartSteps:["Step1"]`. `Step1` 안 `Contents[]` 에 `DataUsage:"new"` Group 1개. 그 안에 InputText/InputDate/Combo/MultiInputBox 등. `Step.BottomButtons:[{ MoveTo:"Save", ... }]` 또는 `MoveTo:"Next"` + 다음 Step 으로 이동.

폼 컨트롤은 자신의 상위 Group 어딘가에 `UseDataConnection:true + DataConnection` 이 있어야 동작 (직계 부모 아니어도 됨, rules.md §5.1).

## 다이얼로그형 컨트롤 (InputDate / Combo / Search)

`isLeaf:false` 라 자식 트리를 가진다 — `Dialog.Layouts[0].Controls[0]` 위치에 sub-control:

- `InputDate.Dialog.Layouts[0].Controls[0]` = `Calendar` (CalendarType: day/month/year, SelectType: SingleDate/FromTo)
- `Combo.Dialog.Layouts[0].Controls[0]` = `ComboList` (8개 이하 고정 목록은 Items[], 그 이상이면 DataSource)
- `Search.Dialog.Layouts[0].Controls[0]` = `List` (키워드 검색 + DataSource 필수)

세 컨트롤 모두 `DisplayType` 미지정 시 `CtrlDisplayCkey` 모드. `DisplayValue` 모드를 쓰려면 명시 + 표현식 등록.

## ID·Caption·이벤트 자주 빠뜨리는 것

- Control `Caption` 은 빈 문자열 허용 (`Embed` 는 반드시 `""`).
- `BottomButton.MoveTo:"Prev"` = 캐시 복원 (Init/Loaded 안 돔), `"Prev_ReStart"` = 재시작. Chart/Map/Timer 가 있으면 `Prev_ReStart`.
- Step Events 호스트별 EventOrder 키:
  - Step: `StepEventOrder` — `Init`/`Loaded`/`OnBackLoaded`/`OnLeave`/`OnForeground`/`ScrollEnd`
  - Group: `ContentEvent` — `Click`/`ScrollEnd`
  - InputText/MultiInputBox: `InputEventOrder` — `change`/`input`/`focusin`/`focusout` (소문자)
  - InputNumber/InputMask: `InputEventOrder` — `change` 만
  - Combo: `ComboOrder` — `change`/`DialogClose`
  - Search: `SearchOrder` — `change`/`Delete`/`DialogClose`
  - InputDate: `DateOrder` — `DialogClose`
- 이벤트 핸들러 이름은 `scenario.Events` 의 키와 일치 (`[event-ref]` 후검증). 사용 안 하는 핸들러는 키 자체를 안 만든다.

## ServiceBinding / DataSource

- `scenario.ServiceBinding: {}` 빈 객체. `SystemID`/`ModuleID`/`ServiceName` 등 어떤 키도 추가 금지.
- `DataSources[*].DataSourceType` 은 `Fixed` 또는 `Grid` 만. `Service`/`API` 는 `[no-service]` 차단.

## Tab / Tree / Embed 짧은 가이드

- `Tab` (`hasDialog:null`): `Items[].LinkedStepId` 로 다른 Step 의 화면을 내부에 렌더. `Height:"100%"` 필수, 자기 Step 자기 참조 금지. LinkedStep 내부 Step Event 는 실행 안 됨 — 초기화는 부모 Step `Init` 에 통합.
- `Tree` (`UseMultiData:true` 면 다중 체크): NodeId/ParentId/Title 로 flat array. 이벤트는 `TreeOrder` + `Selected`/`Checked`, `Click:""` 빈 문자열 필수.
- `Embed`: `Caption:""`. raw HTML 만 — `<script>` 직접 삽입 금지. 외부 라이브러리는 Step `Loaded` 에서 `f.Script.load()` + 유니크 id 의 div/canvas.
