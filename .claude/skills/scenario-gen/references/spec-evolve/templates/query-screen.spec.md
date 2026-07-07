---
id: inspection-query
domain: 품질
feature: 출하검사 조회 — 조회조건 상단진입(별도 Step) + 결과 리스트(부모-자식, 중첩 래핑) + 상세
screenKind: query
route: B
queryConditions: 12
queryCondCategory: CtgSearchCond
events: [조회]
steps:
  - { id: Step1, role: 결과리스트, topConditions: [사업단위], filterEntry: "FixedContentsTop 필터 → Step2 (UseMove)", next: Step2 }
  - { id: Step2, role: 조회조건폼, back: "UseBackButton(IsRestored)" }
  - { id: Step3, role: 상세(detail), back: "UseBackButton" }
forbidButtons: [바로가기, 메인메뉴, 조회조건펼치기, 접기]
keyRoles:
  검사번호: master
  검사일: none
  거래처: none
  품번: none
  합격건수: none
  불합격건수: none
  검사품목_검사번호: link
  Lot No: detail
  검사수량: none
  검사결과: none
categories:
  CtgSearchCond:
    role: query-condition
    fields: [사업단위, 검사일From, 검사일To, 출하검사의뢰일From, 출하검사의뢰일To, 거래처, 품번, LotNo]
  CtgInspection:
    role: master
    keys: [검사번호]
    fields: [검사일, 거래처, 품명, 합격건수, 불합격건수]
  CtgInspectionItem:
    role: detail
    parentKey: 검사번호
    childKey: 검사번호
    fields: [Lot No, 검사수량, 검사결과, 불량유형]
assumptions:
  - 조회조건 12개로 5개 임계 초과 → 조회조건 별도 Step 분리, 상단 FixedContentsTop 에서 진입
  - 검사 1건이 여러 Lot 검사품목을 가진다(1:N)
provisional: []
expect:
  - 조회조건은 Step1 상단 FixedContentsTop 에서 진입(필터). 하단 '조회조건' 버튼·'바로가기'·'메인메뉴'·'펼치기/접기' 라벨 버튼 0개
  - Step2 복귀는 헤더 UseBackButton:true(표준 BackButton, IsRestored:true). Current.step.moveToPrev 스크립트 미사용
  - 공통 조회조건을 CtgSearchCond 카테고리 1섹터로 수집(Init intent.mock), 결과는 CtgInspection query
  - 조건 폼 Group 은 UseDataConnection:true + DataUsage:"default"(CtgSearchCond), 각 조건 컨트롤 바인딩(InputDate/InputText=Ckeys, Combo/Search=CtrlDisplayCkey) — 조건 데이터연결 누락 금지(S-09)
  - 고정 Combo/Search 는 CtrlDisplayCkey = 자식 SaveNameKey 와 동일(예 ItemName) — 도메인 키와 어긋나면 빈칸(S-05)
  - Step1.Next 는 조회조건 Step 만, 상세는 결과 카드 UseMove → Step3 (Step1 에서 조건·상세 동시 분기 금지, S-07)
  - 콜렉션키에 f 접두 금지, 스펙 키는 대소문자 그대로
  - 결과는 스크롤 Group(ScrollY) > 리스트 Group(query) > row Group 으로 한두 겹 래핑(중첩 깊이 ≥5)
  - 부모 query(CtgInspection) + 카드 안 자식 query(CtgInspectionItem, Parent 필터, 검사번호 조인), 표시 항목 LabelCKey/Ckeys 바인딩
  - InputDate 기간 FromTo + 기본값(최근 1개월 등), Combo/InputDate/Search Dialog host 존재
  - Step3 상세 DataUsage:"detail"(UseTargetSector:true + Status:["active"]), UseBackButton:true
  - 시작 Step Init intent.mock 으로 CtgSearchCond 1 + CtgInspection 2건+ , 각 건 품목 여러 건
  - Step1↔Step2↔Step3 reachability 정확히 1회, CategoryName 'Ctg' PascalCase, Collections:{} 유지, validate 통과
---
출하검사 내역을 조회하는 화면. 조회조건이 많아 **조건을 상단에서 별도 Step 으로 분리**한다.

# Step 1 — 결과 리스트
## 상단 고정영역 (FixedContentsTop — 스크롤 안 됨)
- 사업단위 — Combo(핵심 조건, 상단 인라인). 기본 선택 고정값. CtgSearchCond.사업단위 바인딩.
- 결과 건수 요약 "총 N건" — Label.
- **필터 진입**: 필터 아이콘/라벨 Group 에 `UseMove:true` + `MoveSteps.MoveStepOrder:["Step2"]`(각 Step `MoveTo:"Next"`). 활성 조건 수 badge.
  - ※ 하단 '조회조건' 버튼/'바로가기'/'메인메뉴'/'펼치기' 버튼은 만들지 않는다.

## 결과 (스크롤 래핑 — 부모 query + 자식 query)
- 스크롤 Group(`ScrollType:"ScrollY"`, UseDataConnection:false) > 리스트 Group(UseDataConnection:true, DataUsage:"query", CtgInspection) > row Group:
  - 검사번호 — Label(LabelCKey). 카드 헤더.
  - 검사일 / 거래처 / 품명 — Label(Ckeys).
  - 합격건수 / 불합격건수 — Label(Ckeys). 합격 녹색·불합격 적색 badge.
  - 행 클릭(row Group UseMove → Step3) → 상세.
  - ### 검사품목 (자식 query, 카드 안)
    - 자식 Group DataUsage:"query", CtgInspectionItem + Parent 필터(검사번호 조인). Lot No / 검사수량 / 검사결과 / 불량유형 — Label(Ckeys), 행 반복.

# Step 2 — 조회조건 폼 (상단에서 진입)
- 헤더 `UseBackButton:true`(표준 BackButton, IsRestored:true) — 조건값 유지하며 Step1 복귀.
- 검사일 — InputDate(기간 FromTo). CtgSearchCond.검사일From/To 바인딩.
- 출하검사의뢰일 — InputDate(기간, 기본값 최근 1개월: From 현재일-1month, To 현재일).
- 납기일 — InputDate(기간, 기본값 현재일-1week ~ 현재일+1week).
- 출하검사의뢰번호 / 출하의뢰번호 / 부서 / 담당자 / 거래처 / 납품거래처 / 품명 / 품번 / Lot No — Search(코드도움).
- "조회" — BottomButton `MoveTo:"Prev"` (또는 헤더 백버튼으로 복귀).

# Step 3 — 상세 (detail, 읽기전용)
- 헤더 `UseBackButton:true` — Step1 복귀.
- 선택 검사 건(activeSector)을 DataUsage:"detail" 로 읽기전용: 검사 헤더 + 검사품목 목록.

# 데이터 / 목업 (시작 Step Init, named handler)
- CtgSearchCond 1섹터: 사업단위=특정값, 기간 기본값들.
- CtgInspection 2건 (예: INS-2026-001 / 2026-06-02 / 거래처A / 합격 3 / 불합격 1, INS-2026-002 / 2026-06-04 / 거래처B / 합격 5 / 불합격 0).
- CtgInspectionItem (검사번호로 연결): 각 검사에 Lot 2~3건, 검사수량·검사결과(합격/불합격)·불량유형(불합격 행만).

# 규칙
- 조회조건 ≥5 → 별도 Step + 상단 진입(`query-screens.md`). 하단/토글/부가 네비 버튼 금지.
- 복귀는 표준 백버튼(스크립트 흐름제어 금지). 반복은 DataUsage:"query"(UseInnerBlock 금지) + 스크롤 래핑.
- Combo/Search/InputDate Dialog host 필수. Collections:{} 유지 · validate 통과.
