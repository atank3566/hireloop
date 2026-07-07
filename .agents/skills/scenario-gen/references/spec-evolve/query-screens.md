# query-screens — 조회 화면: 상단 진입 + 조회조건 별도 Step

조회(조회/검색) 화면은 "조회조건 입력"과 "결과 리스트"가 한 화면에 다 들어가면 복잡해진다. 코퍼스 컨벤션상 **조회조건은 화면 상단에서 진입**하고, **조건이 많으면 조회조건을 별도 Step 으로 분리**한다.

## 핵심 원칙 (사용자 규칙)

1. **상단 진입만.** 조회조건/필터 진입은 **결과 화면의 상단 고정영역(`Step.FixedContentsTop`)** 에 둔다. **하단에 '조회조건' 버튼을 만들지 않는다.**
2. **부가 네비 버튼 금지.** `바로가기` · `메인메뉴` · `조회조건 펼치기/접기` 같은 **네비/토글 버튼을 만들지 않는다**. 화면 이동은 Step 전환 채널로만(`navigation` 규칙, 아래).
3. **표준 복귀.** 조회조건 Step → 결과 복귀는 **헤더 `UseBackButton:true`(표준 BackButton)** 또는 `BottomButtons[*].MoveTo:"Prev"` 로. ⚠ `Current.step.moveToPrev(...)` 같은 **스크립트 호출은 금지**(`[script-allow]`/`[back-button]` 차단). 표준 백버튼이 `IsRestored:true` 로 조건값을 유지한다.
4. **조건은 카테고리로 수집.** 공통 조회조건은 `CtgSearchCond` 같은 **query-condition 카테고리 1섹터**에 모아 바인딩하고, 결과 query 가 그 조건을 참조하는 형태로 둔다(프로토타입에선 mock 1섹터).

## 임계 규칙

- 조회조건(Combo / InputDate / Search / RadioBox / CheckBox 등) **5개 이상** → **별도 Step** 으로 분리.
- 4개 이하 → 결과 Step 의 **`FixedContentsTop` 고정영역**에 인라인(스크롤되지 않는 상단). 펼치기/접기 토글 버튼으로 만들지 말 것.

## Step 구성 (코퍼스 패턴, AI 생성 안전형)

- **Step1 (결과 리스트)** — 결과가 메인. 상단 `FixedContentsTop` 에 핵심 조건 1~2개(예: 사업단위 Combo) + **필터 진입 컨트롤**(라벨/아이콘에 `UseMove:true` + `MoveSteps.MoveStepOrder:["Step2"]` + `MoveTo:"Next"`). 활성 조건 수는 badge 로 표시 가능. 결과는 별도 스크롤 Group(`ScrollType:"ScrollY"`)에 query 반복.
- **Step2 (조회조건 폼)** — 나머지 전체 조회조건 컨트롤을 모아 배치. `UseBackButton:true` 표준 헤더로 결과 복귀, 또는 BottomButton "조회" `MoveTo:"Prev"`. 조건값은 BackButton `IsRestored:true` 로 유지.
- **Step3 (상세, 선택 시)** — 결과 행 클릭(카드 Group `UseMove:true` + `MoveSteps`) → `DataUsage:"detail"` 읽기전용 상세.

> 관찰된 정답 형태: `Step1(결과+상단조건 1~2) → Step2(전체 조회조건 10여 개) → Step3(상세)` 선형. 조회조건이 Step2 에 몰리고, Step1 상단에서 진입한다.

### Step 흐름 — 분기 혼란 금지 (S-07 실패 교정)

- **`Step1.Next` 에는 조회조건 Step(Step2) 만** 둔다. 상세(Step3)는 `Step1.Next` 에 같이 넣지 말고 **결과 카드 Group `UseMove:true` + `MoveSteps.MoveStepOrder:["Step3"]`** 로 간다. 한 Step1 에서 조건·상세를 동시에 `Next` 분기하면 흐름이 모호해진다(S-07).
- **조회조건은 케이스에 있는 개수만큼만** 만든다 — 같은 조건을 중복 생성하지 말 것(S-07: 13개를 19개로 부풀림). 조건 컨트롤 수 = 스펙 조건 수.
- Step2 는 조건 폼 한 벌(위 CtgSearchCond 그룹) + 복귀(UseBackButton). Step3 는 detail.

## 조회조건 컨트롤 매핑 (의도 → v1)

- 기간/일자 → `InputDate` (+Dialog `Calendar`, FromTo). 기본값은 `conventions.md` 날짜 패턴.
- 선택(사업단위/구분/상태) → `Combo` (+Dialog `ComboList`).
- 코드도움(거래처/품번/Lot No/번호류) → **`Search` (+Dialog `List`) + `CtrlDisplayCkey`(선택값 표시키)**. ⚠ `InputText` 로 떨어뜨리지 말 것 — 키 연결이 끊겨 "조회조건 키 연결 안 됨" 실패가 난다(S-05). 케이스에 `Codehelp` 로 적혔으면 무조건 Search.
- 다중 선택/플래그 → `CheckBox` / `RadioBox`.

Combo/Search/InputDate 는 Dialog host(`Dialog.Layouts[0].Controls[0]`) 필수. Combo/Search 본체엔 `CtrlDisplayCkey` 또는 `DisplayValue` 가 있어야 선택 후 값이 보인다(`display-key`).

## 조회조건도 데이터연결한다 (CtgSearchCond) — 빠뜨리지 말 것

조회조건 컨트롤을 그냥 화면에만 두지 말고 **데이터연결**한다(S-09 실패: 조건 Step DC 0건).

- 조회조건들을 감싸는 **조건 폼 Group 에 `UseDataConnection:true` + `DataConnection{TargetType:'category', DataUsage:'default', CategoryName:'CtgSearchCond'}`** (단건 1섹터).
- 각 조건 컨트롤은 그 카테고리 필드에 바인딩: 입력류(InputDate/InputText)는 `Ckeys`, Combo/Search 는 `CtrlDisplayCkey`(+ 자식 SaveKey 매칭, `conventions.md` §1 고정모드 규칙).
- 시작 Step.Init `intent.mock` 에 `CtgSearchCond` **1섹터**(기본 조건값: 기간 기본값 등)를 박는다 — 없으면 `[proto]`/`[bind]`.
- 결과 리스트 query 카테고리(예: `CtgInspection`)는 별도 — 조건은 프로토타입에선 표시·전달 용도(실제 필터링 로직은 범위 밖).
- **키에 `f` 접두 금지**, 스펙에 키가 명시되면 대소문자 그대로(`conventions.md` §1).

## 결과 리스트는 B(query) + 중첩 래핑

결과 리스트는 마스터-디테일이면 `data-connection.md` 의 **부모 query + 자식 query**, 단순 목록이면 query Group 하나. **반복 영역은 스크롤 Group 으로 한두 겹 감싼다**: `스크롤(ScrollY) > 리스트 Group(query) > row Group > 내용`. Init 에 mock 동반(`mockup.md`).

## .spec.md 에 적는 법

```yaml
screenKind: query
queryConditions: 12          # 5 이상 → 별도 Step
queryCondCategory: CtgSearchCond
steps:
  - { id: Step1, role: 결과리스트, topConditions: [사업단위], filterEntry: "FixedContentsTop→Step2(UseMove)", next: Step2 }
  - { id: Step2, role: 조회조건폼, back: "UseBackButton(IsRestored)", conditions: [검사일, 출하검사의뢰일, 납기일, 거래처, 품번, ...] }
  - { id: Step3, role: 상세(detail), back: UseBackButton }   # 필요 시
forbidButtons: [바로가기, 메인메뉴, 조회조건펼치기]   # 생성 금지 — 명시 기록
```
본문 형태는 `templates/query-screen.spec.md`.
