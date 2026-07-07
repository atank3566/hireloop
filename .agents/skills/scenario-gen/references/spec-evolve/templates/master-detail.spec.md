---
id: order-with-items
domain: 주문관리
feature: 주문 + 주문상품(부모-자식 DC) + 상세 보기
screenKind: mixed
route: B
events: [조회, 상세]
steps:
  - { id: Step1, role: 주문목록(부모query+자식query), next: Step2 }
  - { id: Step2, role: 주문상세(detail, 읽기전용), back: Step1 }
keyRoles:
  주문번호: master
  주문일자: none
  주문상태: none
  합계금액: none
  상품_주문번호: link
  상품명: none
  수량: none
  단가: none
  금액: none
categories:
  CtgOrder:
    role: master
    keys: [주문번호]
    fields: [주문일자, 주문상태, 합계금액]
  CtgOrderItem:
    role: detail
    parentKey: 주문번호
    childKey: 주문번호
    fields: [상품명, 수량, 단가, 금액]
assumptions:
  - 주문 1건이 여러 주문상품을 가진다(1:N)고 추론
  - 합계금액 = 그 주문 상품들의 금액 합 (mock 에서 산술 일치시킴)
provisional: []
expect:
  - 부모 주문 Group DataUsage:"query" — CtgOrder 섹터 수만큼 카드 반복
  - 자식 주문상품 Group 이 부모 카드 안에서 DataUsage:"query" + TargetSector.Filters:[{FilterType:"Parent"}]
  - Parent 필터에 DCParentKey(주문번호)/DCChildKey(주문번호) 지정
  - 부모/자식 모든 표시 항목이 LabelCKey/Ckeys 로 바인딩(정적 labeltext 금지)
  - 제목·총주문건수 요약·"신규" 버튼은 query 그룹 바깥 비연결 래퍼(UseDataConnection:false)
  - query 그룹 Height.MatchText:true + ScrollType:"ScrollY"
  - 상세 Step2 는 DataUsage:"detail" (UseTargetSector:true + Status:["active"], 읽기전용)
  - Step2 헤더 BackButton 표준(Step.UseBackButton:true, BackButton.Next:"None"), {=Field} 토큰 금지 — 값은 script 전달
  - 시작 Step Init(named handler)가 intent.mock 으로 CtgOrder 3건 + 각 주문에 CtgOrderItem 2~3건
  - 합계금액 mock 이 그 주문 상품 금액 합과 일치
  - CategoryName 'Ctg' 접두 PascalCase, 예약어 미사용
  - StartSteps + Step.Next 로 Step1↔Step2 reachability 정확히 1회, Collections:{} 유지, validate 통과
---
주문과 그 주문의 상품들을 함께 보여주는 화면. **부모-자식 데이터연결(1:N)** 구조다.

# Step 1 — 주문 목록 (부모 query + 자식 query)

## 상단 (비연결 래퍼 — 1번만 표시, query 그룹 바깥)
- 제목 "주문 목록" — Label(labeltext). 굵게/큰 글씨(design: font 슬롯).
- 총 주문건수 요약 "총 N건" — Label. 회색 보조 텍스트.
- "신규 주문" 버튼 — Button. 우측 정렬. (동작은 프로토타입 범위 밖이어도 배치)

## 주문 카드 (부모 query, CtgOrder — 스크롤 래핑)
- **중첩 래핑**: `스크롤 Group(ScrollType:"ScrollY", UseDataConnection:false) > 리스트 Group(UseDataConnection:true, DataConnection{TargetType:"category", DataUsage:"query", CategoryName:"CtgOrder"}) > row Group(카드)`. 데이터연결은 반복하는 리스트 Group 에만, 바깥 스크롤은 false.
- 카드 스타일: 라운드 + 옅은 테두리 + 카드 사이 간격(design: radius/border/m 슬롯).
- 표시 항목(모두 섹터 필드 바인딩):
  - 주문번호 — Label(LabelCKey: 주문번호). 카드 헤더, 굵게.
  - 주문일자 — Label(LabelCKey: 주문일자). 보조 텍스트.
  - 주문상태 — Label(LabelCKey: 주문상태). 상태 배지 느낌(접수/배송중/완료).
  - 합계금액 — Label(LabelCKey: 합계금액). 우측, 강조.

### 주문상품 목록 (자식 query — 카드 안)
- 부모 카드 Group **안쪽**에 자식 Group UseDataConnection:true, DataUsage:"query", CategoryName:"CtgOrderItem".
- TargetSector.Filters:[{FilterType:"Parent"}], DCParentKey:"주문번호" / DCChildKey:"주문번호" 로 조인.
- 행 항목(반복, 섹터 필드 바인딩):
  - 상품명 — Label(LabelCKey: 상품명).
  - 수량 — Label(LabelCKey: 수량). "x N" 형태.
  - 단가 / 금액 — Label(Ckeys). 우측 정렬.
- 카드의 "상세" 버튼 → Step 2 (선택 주문이 activeSector 가 됨).

# Step 2 — 주문 상세 (detail, 읽기전용)
- 헤더 BackButton(Step.UseBackButton:true) — Step 1 로 회귀.
- 선택한 주문(activeSector)을 DataUsage:"detail"(UseTargetSector:true + Status:["active"])로 읽기전용 표시.
- 주문번호 / 주문일자 / 주문상태 / 합계금액 + 상품 목록(상품명·수량·단가·금액). 입력 불가, 표시만.
- 값은 {=Field} 토큰이 아니라 onShow/Next script 로 전달(template-script 규칙).

# 데이터 / 목업 (시작 Step Init, named handler)
- `Step.Events.Init:"Step1Init"` + `scenario.Events.Step1Init` 안에 intent.mock.
- CtgOrder 3건 (현실적 값):
  - ORD-2026-001 / 2026-06-01 / 배송중 / 합계 128,000
  - ORD-2026-002 / 2026-06-03 / 접수 / 합계 54,000
  - ORD-2026-003 / 2026-06-04 / 완료 / 합계 210,000
- CtgOrderItem (각 주문 주문번호로 연결, 금액 합 = 부모 합계금액):
  - ORD-2026-001: 무선마우스 x2 @24,000=48,000 / USB허브 x1 @80,000=80,000
  - ORD-2026-002: A4용지 x3 @18,000=54,000
  - ORD-2026-003: 기계식키보드 x1 @150,000=150,000 / 마우스패드 x2 @30,000=60,000

# 규칙
- Collections:{} 유지 · UseInnerBlock 금지(반복은 모두 DataUsage:"query")
- 1번만 보일 요소는 query 그룹 바깥, 비연결 그룹도 UseDataConnection:false 명시
- 정적 텍스트로 카드 내용을 박지 말 것(모든 카드가 같은 문구가 되면 안 됨)
- validate 통과 필수
