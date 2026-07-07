# examples

flextudio scenarioMeta 검증 샘플 — **5 카테고리 / 16 파일 / 13개 검증 통과**.

각 파일은 실제 운영 메타에서 추출한 패턴이거나, 운영 메타를 v1 컨트랙트 검증 통과 형태로 자동 보정한 것이다.

검증 명령:

```bash
node ../validate.mjs                                  # 전체 검증 (cross-check 포함)
node ../validate.mjs basic/delivery-address-popup.json # 단일 파일
PROTO_STRICT=0 node ../validate.mjs ...               # 운영 메타 모드 (Ckeys/DC 허용)
IMAGE_PATH_STRICT=0 node ../validate.mjs ...          # ImageBox path 채워진 운영 모드
```

## 카테고리

| 카테고리 | 파일 수 | 의도 | 디자인 토큰 | 통과 |
|---|---:|---|---|---:|
| [minimal/](minimal/)   | 4 | **골격(skeleton)** — 구조/패턴 검증용. 디자인 토큰 0. AI 가 "단순한 화면" 만들 때 / 구조만 빠르게 확인할 때. | 없음 | 4/4 |
| [basic/](basic/)       | 1 | 단순 1~3 step + 디자인 적용. PopUp 단독. | 풍부 | 1/1 |
| [enhanced/](enhanced/) | 6 | multi-step + dialog (PopUp/SlideUp) + 디자인. | 풍부 | 5/6 |
| [complex/](complex/)   | 4 | 5+ step + 깊은 그룹 중첩 (4~7 레벨). | 매우 풍부 | 3/4 |
| [tile/](tile/)         | 1 | 그리드 카드 패턴 (FlexDirection:wrap). | 풍부 | 0/1 |
| [tab/](tab/)           | 2 | Tab 컨트롤 + RadioBox styleTab 패턴 표본. 운영 메타 그대로 — 검증보다는 패턴 참조용. | 풍부 | — |
| [tree/](tree/)         | 1 | Tree 컨트롤 표본 (단일/다중 선택 + 검색바). 운영 메타 그대로. | 보통 | — |

---

## minimal/ — 골격 표본

디자인 토큰 (`BgStyle` / `BorderStyle` / `FontStyle` / `Padding` / `ContentStyle`) **모두 0**. v1 컨트랙트 구조와 패턴만 보여주는 최소 표본.

| 파일 | 패턴 | 핵심 컨트롤 / 메타 |
|---|---|---|
| [minimal/basic-list-detail.json](minimal/basic-list-detail.json) | 기본형태-0단계 — List → Input → Detail | `Label` / `RadioBox` / `InputText` / `MultiInputBox` / `ImageBox` |
| [minimal/list-with-filters.json](minimal/list-with-filters.json) | 기본형태-1단계 — Combo 필터 + List → Input | `Combo`(Dialog→`ComboList`) 필터, status 배지 카드 |
| [minimal/search-period-popup.json](minimal/search-period-popup.json) | 기본형태-조회강화형 — InputDate 기간 + Search + PopUp 상세조건 | `InputDate`(`FromTo`/`SingleDate`) + `Search`(Dialog→`List`), `StepDialogType:"PopUp"` |
| [minimal/fixedtop-floating-form.json](minimal/fixedtop-floating-form.json) | 기본형태-혼합강화형 — FixedTop 검색바 + 리스트 + Floating | `FixedContentsTop` 검색바, `UseAbsoluteLayout` Floating, `InputFile` 첨부, `monthCalendar` |

---

## basic/ — 디자인 적용 단순 화면

| 파일 | 패턴 | 특징 |
|---|---|---|
| [basic/delivery-address-popup.json](basic/delivery-address-popup.json) | 배송지 변경 PopUp (2 steps) | `BgStyle` 4, `BorderStyle` 14, `FontStyle` 29, `Padding` 8 |

---

## enhanced/ — multi-step + Dialog + 디자인

| 파일 | 패턴 | 특징 |
|---|---|---|
| [enhanced/trade-statement-list.json](enhanced/trade-statement-list.json) | 거래명세서 조회 (PDA, 3 steps) | StepView + PopUp + SlideUp 조합 |
| [enhanced/asset-management.json](enhanced/asset-management.json) | 자산관리 템플릿 (3 steps) | Combo + Search + ImageBox |
| [enhanced/appointment-booking.json](enhanced/appointment-booking.json) | 약속잡기 (5 steps) | Calendar + CheckBox 다중 |
| [enhanced/work-report.json](enhanced/work-report.json) | 구매 발주 관리 (4 steps) | DataUsage `query`/`detail`/`new` 혼합, SlideUp/PopUp |
| [enhanced/salary-contract.json](enhanced/salary-contract.json) | 연봉계약 (5 steps) | `Signature` + `Line` + 깊은 텍스트 |
| [enhanced/fuel-cost-status.json](enhanced/fuel-cost-status.json) | 유류비 자동등록 (3 steps) | `InputDate` × 3 + `InputMask` |

---

## complex/ — 다중 step + 깊은 중첩

운영급 시나리오. 그룹 중첩 4~7 레벨. **`composition.group-nesting` 가이드의 표본**.

| 파일 | 패턴 | 특징 |
|---|---|---|
| [complex/trade-statement-input.json](complex/trade-statement-input.json) | PDA 거래명세서 입력 (7 steps) | StepView × 4 + SlideUp × 3, `BgStyle` 26 / `BorderStyle` 41 / 중첩 7레벨 |
| [complex/order-management.json](complex/order-management.json) | 오더관리 (7 steps) | Tab 컨트롤, FontStyle 176, 중첩 6레벨 |
| [complex/crm-main.json](complex/crm-main.json) | CRM 메인 대시보드 (4 steps) | **★ ContentStyle:`styleRectangleShadow` 26회**, `BgStyle` 81 / `BorderStyle` 108 / 중첩 7레벨 |
| [complex/field-work-register.json](complex/field-work-register.json) | 외근등록 (13 steps + StepSub) | Step 13개, `Embed`, `BgStyle` 72 / `BorderStyle` 132 / 중첩 6레벨 |

---

## tile/ — 그리드 카드 패턴

| 파일 | 패턴 | 특징 |
|---|---|---|
| [tile/second-hand-marketplace.json](tile/second-hand-marketplace.json) | 중고거래 마이페이지 (9 steps) | **★ tileWrap > itemWrap > productInfoWrap > priceWrap** 깊은 카드 구조, `composition.list.card-tile-grid` 표본 |

---

## tab/ — 탭형 UI 표본

탭형 UI 두 가지 패턴 표본. 운영 메타 그대로 (`flextudio-ai-studio/scenario_sample_tab/` 원본). v1 컨트랙트 검증보다는 **패턴 참조용**.

| 파일 | 패턴 | 핵심 컨트롤 / 메타 |
|---|---|---|
| [tab/tab-control-cafe.json](tab/tab-control-cafe.json) | **Tab 컨트롤** — 탭마다 다른 Step 임베드 (HOME/COFFEE/DRINK/BOTTLE) | `Tab` 본체 + `Items[].LinkedStepId`, `Height: 100%` 패턴, 탭별 `Events.Click` |
| [tab/radiobox-styletab-approval.json](tab/radiobox-styletab-approval.json) | **RadioBox + ControlStyle:"styleTab"** — 같은 리스트의 필터만 변경 (결재/신청 전환) | `RadioBox` 의 `ControlStyle:"styleTab"`, Click 이벤트로 필터 reload |

---

## tree/ — 트리 컨트롤 표본

| 파일 | 패턴 | 핵심 컨트롤 / 메타 |
|---|---|---|
| [tree/tree-sample.json](tree/tree-sample.json) | **Tree 컨트롤** — flat array 계층 (NodeId/ParentId/Title) + 검색바 + 단일·다중 선택 | `Tree` + `CollectionMapper` + `UseExpandAll`/`UseSearchBar`/`UseParentAutoSelect`, DataSourceType 'API' |

---

## 공통 규칙 (모든 샘플)

v1 컨트랙트 강제 항목 — 변환 스크립트가 자동 보정:

- 시나리오 루트 const: `modules: {}`, `Collections: {}`, `htmlkey: "stephtml"`, `ScenarioTitle: ""`, `fConverterVersion: 1`, `FlexSQLService: {}`
- Step 식별자: `^Step[1-9][0-9]*$`
- Group/Control/BottomButton Id: `^f_[1-9][0-9]*$` — 시나리오 전체 유일
- 모든 Control: `ControlDefaultName` + `ControlName2`(같은 값) + `Caption` + `isColumnCtrl: false`
- Step Reachability: 각 Step 은 `StartSteps` 또는 다른 Step 의 `Next` 에서 정확히 1번
- Dialog 컨트롤(InputDate / Combo / Search) 본체에는 `UseEvents`/`Events` 두지 않음 — 자식 Calendar / ComboList / List 안에만
- Ckeys 사용 컨트롤은 상위 Group 어딘가에 `UseDataConnection: true` + `DataConnection`
- ImageBox: `ViewGroup.{ImgPath, BucketUrl}` 비움 (운영 시 채워짐)

## 프로토타이핑 정책

13개 통과 샘플 모두 **프로토타이핑 모드** — `DataSources: {}`, 정적 라벨 (`LabelType:"labeltext"` + `labeltext`).

운영 메타로 검증할 때는:
- `PROTO_STRICT=0` — Ckeys / DataConnection / LabelCKey 허용
- `IMAGE_PATH_STRICT=0` — ImageBox path 채워진 상태 허용
- `SAMPLE_DATA_STRICT=0` — Service / Collection / API DataSource 허용

## 잔여 검증 비통과 (3건)

| 파일 | 잔여 에러 | 사유 |
|---|---|---|
| `complex/order-management.json` | `[schema]` 1건 — Step2.Contents[1] (Tab) | v1 외 컨트롤 + 깊은 중첩 oneOf 폭발 |
| `enhanced/asset-management.json` | `[schema]` 2건 — BottomButton.Next | `MoveTo:"Next"` + `MoveStepOrder` 빈 배열 (then-require) |
| `tile/second-hand-marketplace.json` | `[schema]` 39건 — 깊은 ImageBox/Group 중첩 | 운영 특수 패턴 (oneOf 폭발) |

이 3건은 운영 특수 패턴 — 자동 변환으로 의미 손실 없이 해결 어려움. 패턴 참조용으로는 그대로 사용 가능.

## 디자인 시스템과의 매핑

[../schema/v1/design-system/](../schema/v1/design-system/) 의 컴포지션과 매칭:

| 디자인 패턴 (assets.json) | 대응 examples |
|---|---|
| `composition.list.card-list` | minimal/basic-list-detail, basic/delivery-address-popup |
| `composition.dialog.popup` / `dialog.slideup` | minimal/search-period-popup, enhanced/trade-statement-list |
| `composition.fixed.search-bar` | minimal/fixedtop-floating-form, enhanced/work-report |
| `composition.list.card-tile-grid` | tile/second-hand-marketplace |
| `composition.group-nesting` (★ 4~7 레벨) | complex/* (특히 crm-main, field-work-register) |
| `content-style.rectangle-shadow` | complex/crm-main (26회 사용 — 운영 1위 표본) |
