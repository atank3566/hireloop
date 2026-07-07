# key-roles — 필드별 keyRole 판정 (비블로킹)

스펙 진화 단계에서 각 필드에 `keyRole` 을 붙인다. 이는 중간 스펙(`.spec.md`)의 분석 산출물이며, 최종 시나리오 JSON 에는 들어가지 않는다(시나리오엔 자리 없음) — keyRole 은 마스터-디테일/데이터연결을 **어떻게 설계할지 결정하는 근거**다.

## 다섯 가지 keyRole

| keyRole | 의미 | 판정 근거 |
|---|---|---|
| `master` | 마스터(부모) 식별 키 — 1쪽 | 한 건이 여러 디테일을 거느림. 헤더/요약 영역의 식별자 (예: 주문번호, 반품요청번호) |
| `detail` | 디테일(자식) 식별 키 — N쪽 | 마스터 1건 안에서 여러 건 반복 (예: 품목 Lot No, 라인번호) |
| `link` | 부모-자식 조인 키 | 마스터키가 디테일에도 나타나 둘을 잇는 외래키 (예: 디테일의 주문번호) |
| `none` | 키 아님 | 일반 표시/입력 필드 (품명, 수량, 금액 등) |
| `provisional` | 임시 — 확신 없음 | 카디널리티가 안 잡히거나 마스터/디테일 어느 쪽인지 모호. **추측하지 말고 여기 둔다** |

## 판정은 카디널리티로

- 한 화면 안에서 **1건만 보이면 master 후보**(헤더/요약), **여러 건 반복되면 detail 후보**.
- 마스터에도 디테일에도 같은 이름의 키가 보이면 그건 `link`(조인 키).
- 디테일이 또 하위 디테일을 가지면(3단) 상위는 그 하위에 대해 master 역할 — 가장 가까운 부모 기준으로 판정.

## 비블로킹 규칙 (중요)

- 카디널리티가 안 서거나 마스터/디테일이 모호하면 **추측하지 말고 `provisional` + flag** 한다.
- **불확실한 키 때문에 진행을 멈추지 않는다.** provisional 이 있어도 Phase 1 스펙 작성·Phase 2 생성은 계속한다.
- provisional 필드는 **가장 그럴듯한 쪽으로 일단 렌더**하되(보통 detail 또는 none), 그 가정을 `.spec.md` frontmatter `provisional` 에 기록한다.
- 최종 응답에서 lint 가 provisional 잔존을 "미해결"로 보고한다 (`lint.md`). 사용자가 정정하면 그때 확정.

## .spec.md 에 기록하는 법

frontmatter:
```yaml
keyRoles:
  주문번호: master
  주문일자: none
  상품_주문번호: link        # 자식의 조인 키
  상품명: none
  Lot No: detail
provisional:
  - field: 검사구분
    guess: none
    why: 마스터 헤더에 단건이지만 조회조건일 수도 있어 카디널리티 불명
```

본문에서는 keyRole 을 직접 쓰지 않고, master→헤더/요약 Group, detail→반복 Group(B 경로면 DataUsage:"query"), link→부모-자식 조인키(`data-connection.md`)로 **반영**한다.
