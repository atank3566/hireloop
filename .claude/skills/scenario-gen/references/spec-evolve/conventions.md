# conventions — 코퍼스에서 증류한 컨벤션 (자기완결)

실무 화면정의서/시나리오 코퍼스에서 뽑은 규칙. 배포 환경에 원본이 없으므로 여기 본문에 박는다. 이는 **기본값/힌트**이지 화면정의서가 있어야만 작동하는 강제 규칙이 아니다 — 일반 요청에도 적용한다.

## 1. 의도 → v1 ControlType 매핑

| 의도 (어떤 입력에서든 추론) | v1 ControlType | 비고 |
|---|---|---|
| 정적 표시·단건 라벨 | `Label` (`LabelType:"labeltext"` + `labeltext`) | 정적(A). 반복/선택 아님 |
| 선택지(콤보/드롭다운) | `Combo` (+ Dialog `ComboList`) | Dialog host 필수 |
| 날짜/기간 | `InputDate` (+ Dialog `Calendar`) | Dialog host 필수 |
| 코드도움/검색 팝업 | `Search` (+ Dialog `List`) | Dialog host 필수 |
| 숫자/수량 | `InputNumber` (`InputType:"number"`) | 천단위 콤마는 옵션 |
| 자유 텍스트 | `InputText` | |
| 멀티라인 텍스트 | `MultiInputBox` | 사유/목적/비고 |
| 반복 목록(디테일) | B: `DataUsage:"query"` 반복 Group / A: 행 복제 | `data-connection.md` |

### ★ 컨트롤타입이 명시되면 직역(고정 매핑). 의도 추론으로 흔들지 말 것

화면정의서/표에 **컨트롤타입 컬럼이 명시**되면 아래대로 **직역**한다. 항목설명의 "조회/원천/참조" 같은 단어에 휘둘려 다른 컨트롤로 바꾸지 않는다(이게 대표 오매핑이다).

| 명시 표기 | → v1 | 절대 금지 오매핑 |
|---|---|---|
| `label` | **`Label`** (읽기전용 표시) | ❌ label 을 `Search`/`InputText`/`Combo` 로 만들지 말 것. "원천 ~조회" 는 데이터 출처 설명일 뿐, 컨트롤은 Label |
| `Codehelp` / 코드도움 | **`Search`** (+Dialog `List`, `CtrlDisplayCkey` 필수) | ❌ `InputText` 로 떨어뜨리지 말 것 — 키 연결(코드도움 표시키)이 끊긴다 |
| `ComboBox` / 콤보 | **`Combo`** (+Dialog `ComboList`) | |
| `DateBox` / 날짜·기간 | **`InputDate`** (+Dialog `Calendar`) | |
| `FloatBox`·`NumberBox` / 숫자 | **`InputNumber`** | |
| `TextBox` / 텍스트 | **`InputText`** | |

- 표기가 **없을 때만** 위 "의도 → 컨트롤" 표로 추론한다.
- **읽기전용 표시 필드(label)는 화면에 그대로 다 Label 로 만든다** — 표시 항목이 10개면 Label 10개(S-03 실패: label 다수를 Search 로 띄워 입력 천지가 됨).
- **코드도움 조회조건은 반드시 `Search` + `CtrlDisplayCkey`**(선택값 표시키, 예 `customerName`) — `InputText` 금지(S-05 실패: 키 연결 끊김). `display-key` cross-check 와 동일 원칙.
- **콜렉션키 명명**: `Ckeys`/`LabelCKey`/`CtrlDisplayCkey` 값에 **`f` 접두 금지**.
  - **스펙(화면정의서)에 키/필드명이 명시되면 그 대소문자·표기를 그대로 사용**한다 — 임의로 camelCase 로 바꾸지 말 것. 식별자로 못 쓰는 공백/특수문자만 제거하고 대소문자는 보존 (예: `Lot No`→`LotNo`, `B/L NO`→`BLNO`, `품번`은 영문 키가 없으면 의미있는 영문으로).
  - 구조 미제공(추론)일 때만 의미있는 camelCase (예: `customerName`·`scanQty`). ❌ `fCustomer`·`fLotNo`.
  - 예약어 금지는 `naming-objects.schema.json`.
> Combo/Search/InputDate 는 본체에 Dialog host(`Dialog.Layouts[0].Controls[0]` = ComboList/List/Calendar)가 없으면 런타임 TypeError. 정본 `docs/control/*.md`.

### ★ 고정 선택지(Combo/Search 고정모드) — CtrlDisplayCkey ↔ SaveNameKey/SaveValueKey 매칭

`UseDataSource:false` + 고정 옵션(`Items`)으로 만드는 Combo/Search 는 본체 표시키와 자식 옵션키가 **반드시 같은 이름**이어야 선택값이 본체에 보인다(안 맞으면 선택해도 빈칸 — S-05/S-09 실패):

- 자식 ComboList/List: `SaveNameKey`(표시키) / `SaveValueKey`(저장키). 옵션 `Items` 가 그 두 필드를 보유.
- 본체 `CtrlDisplayCkey` = 자식 **`SaveNameKey` 와 동일한 이름**으로 둔다(표시는 이름키).
- 표준: `Items:[{ItemName, ItemValue}, ...]` → `SaveNameKey:"ItemName"`, `SaveValueKey:"ItemValue"`, **`CtrlDisplayCkey:"ItemName"`**.
- ❌ `CtrlDisplayCkey:"BizUnit"`(도메인 키)인데 `SaveNameKey:"ItemName"` 처럼 어긋나게 두지 말 것. 도메인 의미를 키 이름에 담고 싶으면 SaveNameKey/SaveValueKey/CtrlDisplayCkey 를 **셋 다 같은 체계**로(예 `SaveNameKey:"bizUnitName"`, `CtrlDisplayCkey:"bizUnitName"`, Items 필드도 `bizUnitName`). `[combo-fixed]` cross-check.

## 2. 표시 등급 (항목사용여부)

- `숨김` → **노드 생성 제외.** 보통 저장 시 시스템이 채우는 키(자동채번·현재일·로그인 부서/사원·사업단위 디폴트).
- `중요` → 강조 스타일(굵게/색).
- `표시` → 일반.

## 3. 기본값 패턴 (항목설명 단서 → 기본값)

| 단서 | 해석 |
|---|---|
| `현재일`, 시스템 현재일 저장 | 오늘 날짜 |
| `From: 현재일 -1month, To: 현재일` | InputDate 기간 기본값 (한 달 전 ~ 오늘) |
| `From: 현재일 -1week, To: 현재일 +1week` | 기간 기본값 (1주 전 ~ 1주 후) |
| `"<고정값>" 디폴트` 등 고정 선택값 | Combo 기본 선택 |
| `자동채번` | 숨김 + 저장 시 채움 (노드 X) |

프로토타입이므로 날짜는 **현실적 리터럴**로 박아도 된다(예: 오늘이 기준이면 그 근방). B 경로 mock 도 현실적 값으로.

## 4. 마스터-디테일 레이아웃 골격 (그룹을 한두 겹 더 감싼다)

- **마스터** = 헤더/요약 Group (식별자 + 합계/상태). 단건. 표시 라벨은 가능하면 마스터 mock 섹터에 `LabelCKey` 바인딩(정적은 진짜 고정 문구만).
- **디테일** = 반복 영역. B 면 부모 query Group 안 자식 query Group(Parent 필터), A 면 같은 행 Group 을 복제(`row`, `row_copy`).
- **중첩 래핑(중요)**: 정답은 반복 영역을 여러 겹 감싼다(깊이 6~8). 얕으면 실패.
  - 조회: `스크롤 Group(ScrollY) > 리스트 Group(query) > row Group > [마스터섹션 + 디테일섹션]`
  - 입력: `마스터 Group(흰 배경) + graybg Group(회색,ScrollY) > contentsWrap(흰 박스) > 리스트 Group > row`
  - `UseDataConnection:true` 는 반복이 일어나는 그 Group 에만, 바깥 스크롤 래퍼는 false. 상세는 `data-connection.md`.
- 디테일 행에 행삭제(입력), 펼치기/상세(조회)를 둘 수 있다.

## 5. 입력 화면 vs 조회 화면 + 네비 규칙

| | 입력 | 조회 |
|---|---|---|
| 마스터 | 읽기전용 표시(Label, 가능하면 바인딩) + 일부 입력(Combo/InputNumber). 종속 선택은 `data-connection.md` | **조회조건은 상단 `FixedContentsTop`** (Combo/InputDate/Search) — 많으면 별도 Step (`query-screens.md`) |
| 디테일 | 스캔/추가로 쌓이는 품목(키+수량), 행삭제 | 결과 리스트 반복(스크롤 래핑) + 펼치기 상세 |
| 이벤트 | 저장/삭제/신규 (하단 BottomButtons) | 조회 |
| 네비 | BottomButtons MoveTo:Next/Prev, 결과/확인 Step | 상단에서 조건 Step 진입(UseMove), 복귀는 UseBackButton 표준 |

- **네비 채널은 4개만**(`skill-guides/step-navigation.md` 정본): StartSteps / 하단 `BottomButtons.MoveTo` / 리스트 카드 `UseMove`+`MoveSteps` / 헤더 `UseBackButton`. 스크립트 흐름제어(`Current.step.moveToPrev/Next`)는 **금지**.
- 첫 입력화면 `UseBackButton:false`, 상세/결과화면 `true`.
- **부가 네비 버튼 금지(★)**: `바로가기` · `메인메뉴` · `조회조건 펼치기/접기` 같은 라벨 버튼을 **만들지 않는다**. 화면정의서 '추가공유내용'에 그런 문구가 있어도 버튼으로 옮기지 말 것 — 이동은 Step 전환 채널로만 표현한다. 숨겨야 할 부가 액션은 `BottomButtons` 의 `ControlKey:"Hide"` 로.

## 6. 정적 vs 동적 (A vs B) 노드별 판정

SKILL.md "데이터 표시 결정"과 동일: 고정 문구·캡션·단건 = 정적 Label, 반복 렌더·선택지·Calendar 데이터 = 동적 DataConnection + Init mock. 한 화면에서 혼재 가능.
