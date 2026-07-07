# mockup — 목업데이터 추정·세팅 (구조 미제공 포함)

프로토타입 화면은 **항상 목업데이터로 채워야** 한다. 구조가 제공되지 않아도 마찬가지 — 도메인에서 카테고리·필드·현실적 값을 **알아서 추정**해 세팅한다. 빈 리스트·빈 폼·placeholder 만 있는 화면으로 끝내지 않는다.

## ★ M-D 구조가 제공되면 목업 카테고리는 필수 (위반 = 대표 실패)

화면정의서/요청에 **Master/Detail(또는 반복 항목) 구조가 명시**되면, 그 구조의 **목업데이터(Ctg 카테고리 + 시작 Step.Init `intent.mock`)는 반드시 생성**한다. 정적 Label 복제로 끝내면 안 된다.

- Master → `Ctg<Entity>` (1섹터 이상), Detail → `Ctg<Entity>Item` (부모마다 2~3섹터, 조인키 일치).
- 두 카테고리 모두 `intent.mock` 으로 채우고, 표시 항목은 `LabelCKey`/`Ckeys` 바인딩(정적 텍스트 금지).
- **실패 사례(S-02)**: Master/Detail 표가 있는 입력 화면을 `DataConnection` 0건·`Events:{}`·정적 Label 57개로 생성 → "데이터연결이 안 된" 화면. M-D 가 명시됐으면 이건 오답이다.
- 자체 점검: M-D 가 제공됐는데 산출물에 `UseDataConnection:true`/`DataConnection`/`intent.mock` 이 0건이면 다시 만든다.

## 언제 무엇을

| 상황 | 목업 형태 |
|---|---|
| 목록/반복/조회 결과 (B) | 시작 Step.Init `intent.mock` 으로 카테고리 섹터 **3건 이상** |
| 부모-자식(마스터-디테일, B) | 부모 2~3건 × 각 부모에 자식 2~3건 (조인키 일치) |
| 선택지(Combo/Search, B) | 그 카테고리 옵션 mock (3~6개) |
| 단건 정적 표시 (A) | 각 Label 에 현실적 `labeltext` 리터럴 |
| 신규 입력 폼 (new) | mock 면제 — 빈 섹터 자동 생성(`DataUsage:"new"`), Init addSector 금지 |

## 구조 미제공 시 추정 절차

1. **화면 종류·도메인 식별** — "주문 목록", "회원 조회", "재고 현황" 등에서 주체 엔티티를 잡는다.
2. **카테고리·필드 추정** — 그 엔티티의 자연스러운 필드를 코퍼스/상식으로 구성. 예: 주문 → 주문번호/주문일자/주문상태/합계금액; 회원 → 이름/연락처/이메일/가입유형. 마스터-디테일이면 자식 엔티티도(주문→주문상품: 상품명/수량/단가).
3. **카테고리명** — `Ctg` 접두 PascalCase (`CtgOrder`, `CtgOrderItem`). 예약어 금지.
4. **현실적 값 생성** — 아래 "값 현실성".
5. **개수** — 리스트 최소 3건(부모-자식이면 부모 2~3 × 자식 2~3). 상태/유형은 서로 다르게 섞어 다양성 확보(전부 같은 값 금지).
6. **가정 기록** — 추정한 카테고리·필드를 `spec-format.md` frontmatter `categories` + `assumptions` 에. keyRole 애매하면 `provisional`.

## 값 현실성

- 한국어 도메인 값: 이름(홍길동/김영희), 거래처(거래처A/대성물산), 상품명(무선마우스/A4용지).
- 날짜: 현재일 근방의 실제 형식 `YYYY-MM-DD` (예: 2026-06-01). 기간 기본값은 `conventions.md` 패턴.
- 금액/수량: 천단위 콤마 가능한 현실적 숫자. **합계 = 항목 합** 으로 산술 일치(예: 합계금액 = 자식 금액들의 합).
- 상태/유형: 그 화면의 enum 중에서(접수/배송중/완료, 합격/불합격 등).
- 조인키: 부모-자식 `DCParentKey`/`DCChildKey` 값이 실제로 매칭되게(자식의 주문번호 = 부모 주문번호).

## 배치 (B 경로)

- named handler: `Step.Events.Init:"Step1Init"` + `scenario.Events.Step1Init` 안에 `intent.mock`.
- 인라인 배열(`Step.Events.Init:[...]`) 금지 — schema 충돌 (SKILL.md "데이터 표시 결정" 참조).
- 부모·자식 카테고리 모두 mock 을 박아 조인이 실제로 그려지게.
- `intent.mock` 없이 `DataConnection`/`Ckeys` 만 박으면 `[proto]`·`[mock-init]` 차단.

## .spec.md 에 적는 법

frontmatter `categories` 로 카테고리·필드·키를 명시하고, 본문 "데이터 / 목업" 절에 **구체적 mock 값**(현실적 리터럴 N건)을 적는다. 템플릿의 mock 예시(`templates/master-detail.spec.md` 등) 형태를 따른다. Phase 2 가 이 mock 을 `intent.mock`(B) 또는 `labeltext`(A)로 펼친다.
